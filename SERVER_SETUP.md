# Immersive Portfolio - Full Server Setup Guide

This guide is tailored for your current environment:

- Server IP: `192.168.10.85`
- No domain yet
- No SMTP provider yet

---

## 1) Server requirements

Use Ubuntu 22.04/24.04 (or similar Linux distro) with SSH access.

Install required packages:

```bash
sudo apt update && sudo apt -y upgrade
sudo apt -y install docker.io docker-compose-plugin ufw curl
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

---

## 2) Copy project to server

Option A (recommended): clone from Git repo

```bash
sudo mkdir -p /opt/immersive-portfolio
sudo chown -R $USER:$USER /opt/immersive-portfolio
cd /opt/immersive-portfolio
git clone <YOUR_REPO_URL> .
```

Option B: copy from local machine with SCP

```bash
scp -r <LOCAL_PROJECT_PATH>\* <USER>@192.168.10.85:/opt/immersive-portfolio/
```

---

## 3) Create production `.env`

In `/opt/immersive-portfolio/.env`, add:

```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3001

JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET
ADMIN_PASSWORD=CHANGE_THIS_TO_A_STRONG_PASSWORD

# Temporary SMTP placeholders (app starts, email endpoints may fail until real SMTP is set)
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USER=placeholder@example.com
SMTP_PASS=placeholder_password
ADMIN_EMAIL=admin@example.com
CC_EMAIL=
```

Generate a secure JWT secret:

```bash
openssl rand -hex 32
```

---

## 4) Start the app with Docker Compose

From `/opt/immersive-portfolio`:

```bash
docker compose up --build -d
docker compose ps
docker compose logs -f app
```

App URL (LAN):

`http://192.168.10.85:3001`

Health check:

```bash
curl http://192.168.10.85:3001/health
```

Expected response:

```json
{"ok":true}
```

---

## 5) Firewall (LAN-only temporary setup)

Allow SSH and app port:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 3001/tcp
sudo ufw enable
sudo ufw status
```

---

## 6) Basic operations

Restart app:

```bash
cd /opt/immersive-portfolio
docker compose restart app
```

Pull updates and redeploy:

```bash
cd /opt/immersive-portfolio
git pull
docker compose up --build -d
```

Stop:

```bash
docker compose down
```

---

## 7) Data persistence and backup

Your compose file maps `./data` to `/app/data`, so `data/jobs.json` persists.

Quick backup:

```bash
cd /opt/immersive-portfolio
tar -czf backup-data-$(date +%F).tar.gz data
```

Restore:

```bash
tar -xzf backup-data-YYYY-MM-DD.tar.gz
docker compose restart app
```

---

## 8) SMTP options (when ready)

You do **not** need Gmail specifically. Any SMTP provider works:

- Brevo
- SendGrid
- Mailgun
- Mailtrap (testing)
- Zoho Mail

When you choose one, update these in `.env`:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_EMAIL`
- `CC_EMAIL` (optional)

Then restart:

```bash
docker compose up -d
```

---

## 9) Later: move to domain + HTTPS (recommended)

When you have a domain:

1. Point DNS A record to your public server IP.
2. Install Nginx and Certbot.
3. Reverse proxy `80/443` to `127.0.0.1:3001`.
4. Enable HTTPS with Let's Encrypt.
5. Close public port `3001` (keep internal only).

At that point, users will access your app via:

`https://yourdomain.com`

---

## 10) Troubleshooting

Container not starting:

```bash
docker compose logs --tail=200 app
```

Port already in use:

```bash
sudo ss -ltnp | grep 3001
```

Rebuild from scratch:

```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

---

## 11) Quick start (copy/paste)

```bash
cd /opt/immersive-portfolio
docker compose up --build -d
docker compose logs -f app
curl http://192.168.10.85:3001/health
```

