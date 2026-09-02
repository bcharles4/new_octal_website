# cPanel mail relay

## Why this exists

Railway blocks outbound SMTP (ports 25, 465 and 587) on its Free, Hobby and
Trial plans. `lib/mailer.js` used to fall back to nodemailer against
`smtp.gmail.com:465`, which meant every contact-form and job-application send in
production died with `ETIMEDOUT` and the route returned
`500 Failed to send email`.

Pointing `SMTP_HOST` at `mail.octaltech.net` does not help — Railway blocks the
*egress port*, not the destination.

So sending moved off Railway. The Node API still renders the email (all three
HTML templates stay in `server.js`) and hands the finished message to
`mail-relay.php` over ordinary HTTPS on port 443, which is never blocked. The
PHP file does the SMTP locally, from the host that is authoritative for
`octaltech.net` — which also means SPF and DKIM align, so deliverability is
better than it was with Gmail SMTP.

No frontend change was needed: the forms still POST to Railway exactly as before.

```
browser ──POST /api/contact──> Railway (renders HTML)
                                  │
                                  └──HTTPS 443──> cPanel mail-relay.php ──SMTP──> mailbox
```

## Files

| File | Goes where |
|---|---|
| `mail-relay.php` | `public_html/_mail/mail-relay.php` |
| `mail-relay-config.example.php` | copy to `~/mail-relay-config.php` (**above** `public_html`) and fill in |
| `htaccess-for-_mail.txt` | `public_html/_mail/.htaccess` (rename it) |
| PHPMailer (downloaded, see below) | `public_html/_mail/PHPMailer/` |

## Deploying

1. **Mailbox.** In cPanel → *Email Accounts*, confirm `info@octaltech.net`
   exists and you know its password (or create a dedicated `noreply@` one).

2. **PHPMailer.** No Composer needed. Download the latest 6.x release from
   <https://github.com/PHPMailer/PHPMailer/releases>, and from its `src/` folder
   upload just these three files to `public_html/_mail/PHPMailer/`:

   - `PHPMailer.php`
   - `SMTP.php`
   - `Exception.php`

3. **Relay.** Upload `mail-relay.php` to `public_html/_mail/`.

4. **Config.** Copy `mail-relay-config.example.php` to the account's home
   directory as `mail-relay-config.php` — *one level above* `public_html`, so it
   cannot be served even if PHP is disabled. Fill in the mailbox password and
   generate the shared secret with:

   ```
   openssl rand -hex 32
   ```

5. **.htaccess.** Upload `htaccess-for-_mail.txt` to `public_html/_mail/` and
   rename it to `.htaccess`. (File Manager hides dotfiles until you enable
   *Show Hidden Files*.)

6. **Upload limits.** A 10MB resume base64s to ~13.4MB. The common shared-host
   default of `post_max_size = 8M` would drop the request. In cPanel →
   *MultiPHP INI Editor*, set `post_max_size` and `upload_max_filesize` to `20M`.
   If you would rather not, lower multer's limit in `server.js` instead — the
   relay reports this case explicitly rather than failing silently.

7. **Railway variables.** In the service's *Variables* tab:

   ```
   MAIL_RELAY_URL    = https://octaltech.net/_mail/mail-relay.php
   MAIL_RELAY_SECRET = <the generated secret>
   MAIL_FROM         = info@octaltech.net
   ```

   Confirm `ADMIN_EMAIL` and `CC_EMAIL` are set too, then redeploy. The existing
   `SMTP_*` variables can stay — the relay takes precedence, and they keep
   `npm run dev` working from `.env`.

## Testing the relay on its own

Health check (needs no secret, sends nothing):

```
curl https://octaltech.net/_mail/mail-relay.php
# -> {"ok":true,"service":"mail-relay"}
```

A real send:

```
curl -X POST https://octaltech.net/_mail/mail-relay.php \
  -H "X-Mail-Secret: <secret>" -H "Content-Type: application/json" \
  -d '{"from":{"email":"info@octaltech.net"},"to":[{"email":"you@example.com"}],"subject":"relay test","html":"<b>hi</b>"}'
# -> {"ok":true,"recipients":1}
```

**Confirm the auth actually works** — this one must fail:

```
curl -i -X POST https://octaltech.net/_mail/mail-relay.php \
  -H "Content-Type: application/json" -d '{}'
# -> 403 {"ok":false,"error":"Forbidden."}
```

If that returns anything other than 403, stop and fix it before going further:
an unauthenticated relay is an open spam relay and will get the domain
blacklisted.

## Security notes

- The secret is compared with `hash_equals()`, which is constant-time.
- `allowed_from` in the config restricts which addresses the relay will send
  *as*, so even a leaked secret cannot be used to spoof arbitrary senders.
- Credentials live outside the web root.
- There is a crude per-IP throttle (20 requests/minute).

## Rolling back

Delete `MAIL_RELAY_URL` from the Railway variables and redeploy. `lib/mailer.js`
falls through to SendGrid if `SENDGRID_API_KEY` is set, otherwise to SMTP.
