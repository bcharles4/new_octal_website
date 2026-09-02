<?php
/**
 * Mail relay for the Railway API.
 *
 * Railway blocks outbound SMTP (25/465/587) on its Free/Hobby/Trial plans, so
 * the Node API cannot talk to a mail server at all. It renders the message and
 * POSTs it here over ordinary HTTPS instead; this file does the SMTP locally,
 * from the host that is authoritative for the domain.
 *
 * This is a dumb transport on purpose. It builds no HTML and knows nothing
 * about contact forms — server.js remains the single source of truth for the
 * templates. Everything here is transport and access control.
 *
 * Deploy to:  public_html/_mail/mail-relay.php
 * Config at:  ../../mail-relay-config.php  (i.e. one level ABOVE public_html,
 *             so it can never be served even if PHP is disabled)
 *
 * GET  -> {"ok":true}  health probe, sends nothing, requires no secret.
 * POST -> sends one message. Requires the X-Mail-Secret header.
 */

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

header('Content-Type: application/json; charset=utf-8');
/* Nothing here is meant to be reachable from a browser page. */
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex, nofollow');

/** Rejects anything larger than this before decoding. A 10MB resume base64s to
 *  ~13.4MB; the rest is headroom for the HTML body and JSON overhead. */
const MAX_PAYLOAD_BYTES = 20 * 1024 * 1024;

/** Crude per-IP throttle. A contact form will never come close. */
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60;

function fail(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function succeed(array $extra = []): void
{
    echo json_encode(['ok' => true] + $extra);
    exit;
}

/* ------------------------------------------------------------- Health -- */

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET' || $method === 'HEAD') {
    /* Proves the file is deployed and the PHP parses, without sending mail and
     * without needing the secret. verifyMailer() in lib/mailer.js calls this at
     * boot so a broken deploy shows up in the Railway log immediately. */
    succeed(['service' => 'mail-relay']);
}

if ($method !== 'POST') {
    fail(405, 'Method not allowed.');
}

/* ------------------------------------------------------------- Config -- */

$configPath = __DIR__ . '/../../mail-relay-config.php';
if (!is_readable($configPath)) {
    fail(500, 'Relay is not configured (mail-relay-config.php not found).');
}
$cfg = require $configPath;

foreach (['secret', 'smtp_host', 'smtp_user', 'smtp_pass'] as $key) {
    if (empty($cfg[$key])) {
        fail(500, "Relay config is missing '$key'.");
    }
}

/* ------------------------------------------------------------- Auth ---- */

$provided = $_SERVER['HTTP_X_MAIL_SECRET'] ?? '';

/* hash_equals is constant-time; a plain === would leak the secret one byte at a
 * time to anyone willing to measure. An unauthenticated endpoint here is an
 * open spam relay, which would get the domain blacklisted. */
if (!is_string($provided) || $provided === '' || !hash_equals((string) $cfg['secret'], $provided)) {
    fail(403, 'Forbidden.');
}

/* -------------------------------------------------------- Rate limit --- */

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/mail-relay-' . hash('sha256', $ip) . '.json';
$now = time();
$hits = [];
if (is_readable($bucket)) {
    $decoded = json_decode((string) file_get_contents($bucket), true);
    if (is_array($decoded)) {
        $hits = array_filter($decoded, static fn($t) => is_int($t) && $t > $now - RATE_LIMIT_WINDOW);
    }
}
if (count($hits) >= RATE_LIMIT_MAX) {
    fail(429, 'Too many requests.');
}
$hits[] = $now;
@file_put_contents($bucket, json_encode(array_values($hits)), LOCK_EX);

/* ------------------------------------------------------------ Payload -- */

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '') {
    /* An empty body with a non-empty CONTENT_LENGTH means PHP discarded the
     * request for exceeding post_max_size — worth saying plainly, because the
     * symptom is otherwise indistinguishable from a client bug. */
    $declared = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($declared > 0) {
        fail(413, "Body was dropped by PHP: $declared bytes exceeds post_max_size (" . ini_get('post_max_size') . ').');
    }
    fail(400, 'Empty body.');
}
if (strlen($raw) > MAX_PAYLOAD_BYTES) {
    fail(413, 'Payload too large.');
}

$msg = json_decode($raw, true);
if (!is_array($msg)) {
    fail(400, 'Body is not valid JSON.');
}

/** Accepts {name, email} or a bare string, and returns [email, name]. */
function readAddress($value): ?array
{
    if (is_array($value) && !empty($value['email'])) {
        return [trim((string) $value['email']), trim((string) ($value['name'] ?? ''))];
    }
    if (is_string($value) && trim($value) !== '') {
        return [trim($value), ''];
    }
    return null;
}

$from = readAddress($msg['from'] ?? null);
if ($from === null || !filter_var($from[0], FILTER_VALIDATE_EMAIL)) {
    fail(400, 'Missing or invalid "from".');
}

/* Even with the secret, the relay will only send as an address it owns. This
 * is what stops a leaked secret from becoming a spoofing tool. */
$allowedFrom = array_map('strtolower', $cfg['allowed_from'] ?? [$cfg['smtp_user']]);
if (!in_array(strtolower($from[0]), $allowedFrom, true)) {
    fail(403, 'Sender address is not permitted by this relay.');
}

$recipients = [];
foreach ((array) ($msg['to'] ?? []) as $entry) {
    $addr = readAddress($entry);
    if ($addr !== null && filter_var($addr[0], FILTER_VALIDATE_EMAIL)) {
        $recipients[] = $addr;
    }
}
if (count($recipients) === 0) {
    fail(400, 'No valid recipient.');
}

$subject = (string) ($msg['subject'] ?? '');
$html = (string) ($msg['html'] ?? '');
if ($html === '') {
    fail(400, 'Missing "html".');
}

/* ------------------------------------------------------------- Send ---- */

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host = (string) $cfg['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = (string) $cfg['smtp_user'];
    $mail->Password = (string) $cfg['smtp_pass'];
    $mail->Port = (int) ($cfg['smtp_port'] ?? 465);
    $mail->SMTPSecure = $mail->Port === 587
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $mail->CharSet = 'UTF-8';
    $mail->Timeout = 20;

    $mail->setFrom($from[0], $from[1]);
    /* Return-Path. Bounces should come back to the mailbox that authenticated,
     * not to whatever display address the app used. */
    $mail->Sender = (string) $cfg['smtp_user'];

    foreach ($recipients as [$email, $name]) {
        $mail->addAddress($email, $name);
    }

    foreach ((array) ($msg['cc'] ?? []) as $entry) {
        $addr = readAddress($entry);
        if ($addr !== null && filter_var($addr[0], FILTER_VALIDATE_EMAIL)) {
            $mail->addCC($addr[0], $addr[1]);
        }
    }

    $replyTo = readAddress($msg['replyTo'] ?? null);
    if ($replyTo !== null && filter_var($replyTo[0], FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($replyTo[0], $replyTo[1]);
    }

    foreach ((array) ($msg['attachments'] ?? []) as $a) {
        if (!is_array($a) || empty($a['filename'])) {
            continue;
        }
        $data = base64_decode((string) ($a['content'] ?? ''), true);
        if ($data === false || $data === '') {
            continue;
        }
        $filename = (string) $a['filename'];
        $type = (string) ($a['type'] ?? 'application/octet-stream');

        if (!empty($a['cid'])) {
            /* Keeps <img src="cid:octal-logo"> in the templates resolving. */
            $mail->addStringEmbeddedImage($data, (string) $a['cid'], $filename, PHPMailer::ENCODING_BASE64, $type);
        } else {
            $mail->addStringAttachment($data, $filename, PHPMailer::ENCODING_BASE64, $type);
        }
    }

    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $html;
    $mail->AltBody = trim(html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

    $mail->send();
} catch (PHPMailerException $e) {
    fail(500, 'SMTP send failed: ' . $mail->ErrorInfo);
} catch (Throwable $e) {
    fail(500, 'Relay error: ' . $e->getMessage());
}

succeed(['recipients' => count($recipients)]);
