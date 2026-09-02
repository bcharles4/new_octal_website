<?php
/**
 * Template for the relay's credentials.
 *
 * Copy this to the cPanel account's HOME directory as `mail-relay-config.php`
 * — one level ABOVE public_html. It must never sit under the web root: if PHP
 * were ever disabled or misconfigured, a file inside public_html would be
 * served as plain text and hand over the SMTP password.
 *
 *   /home/<cpaneluser>/mail-relay-config.php     <- here
 *   /home/<cpaneluser>/public_html/_mail/mail-relay.php
 *
 * This example file is safe to commit. The real one is not — never commit it.
 */

return [
    /**
     * Must match MAIL_RELAY_SECRET in the Railway service variables.
     * Generate with:  openssl rand -hex 32
     */
    'secret' => 'REPLACE_WITH_THE_GENERATED_SECRET',

    /**
     * The cPanel mail server. 'localhost' also works and avoids a DNS round
     * trip, but mail.<domain> is easier to reason about when debugging.
     */
    'smtp_host' => 'mail.octaltech.net',

    /** 465 (implicit TLS) or 587 (STARTTLS). Both are open on this host. */
    'smtp_port' => 465,

    /** A real cPanel mailbox and its password. */
    'smtp_user' => 'info@octaltech.net',
    'smtp_pass' => 'REPLACE_WITH_THE_MAILBOX_PASSWORD',

    /**
     * Addresses the relay is willing to send AS. Anything else is rejected with
     * a 403 even when the secret is correct, so a leaked secret cannot be used
     * to spoof mail from arbitrary senders. Must include whatever MAIL_FROM is
     * set to on Railway.
     */
    'allowed_from' => [
        'info@octaltech.net',
    ],
];
