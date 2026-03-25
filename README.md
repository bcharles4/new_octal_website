# Immersive Portfolio

React + Vite frontend with an Express backend (`server.js`) that serves the API and production build from `dist`.

## Local development

```bash
npm install
npm run dev
```

Build frontend:

```bash
npm run build
```

Run server:

```bash
npm run server
```

## Docker

This repo includes:

- `Dockerfile` (multi-stage production image)
- `.dockerignore`
- `docker-compose.yml`

The container runs Express on port `3001` and serves both API and built frontend.

### 1) Prepare environment variables

Create `.env` in the project root (or reuse your existing one). Required values used by `server.js` include:

- `JWT_SECRET`
- `ADMIN_PASSWORD`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `ADMIN_EMAIL`
- `CC_EMAIL` (optional)
- `HOST` (optional, defaults to `0.0.0.0`)
- `PORT` (optional, defaults to `3001`)

### 2) Build and run with Docker

```bash
docker build -t immersive-portfolio .
docker run --env-file .env -e HOST=0.0.0.0 -p 3001:3001 immersive-portfolio
```

Health check:

```bash
curl http://localhost:3001/health
```

### 3) Run with Docker Compose

```bash
docker compose up --build -d
docker compose logs -f app
```

Stop:

```bash
docker compose down
```

`docker-compose.yml` maps `./data` to `/app/data` so job data persists across container restarts.
