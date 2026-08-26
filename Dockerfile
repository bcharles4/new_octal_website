# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Bind all interfaces; docker-compose maps the port. Never hardcode a host IP.
ENV HOST=0.0.0.0
ENV PORT=3001

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/db ./db
COPY --from=builder /app/data ./data
COPY --from=builder /app/src/assets/img/octal-logo-withText.png ./src/assets/img/octal-logo-withText.png

EXPOSE 3001
CMD ["node", "server.js"]
