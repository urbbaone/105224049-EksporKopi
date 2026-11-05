# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Multi-stage Dockerfile Hardened untuk Nusantara Coffee Export Platform
# Memenuhi RSK-CONT-01: Non-root execution, minimal attack surface, read-only
# ─────────────────────────────────────────────────────────────────────────────

# --- Stage 1: Dependencies ---
FROM node:20-alpine3.20 AS deps
WORKDIR /app

# Menginstal dependensi library yang dibutuhkan
COPY package.json package-lock.json ./
RUN npm ci

# --- Stage 2: Builder ---
FROM node:20-alpine3.20 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Stage 3: Runner (Minimal & Hardened Runtime) ---
FROM node:20-alpine3.20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Buat grup dan pengguna non-root dengan UID/GID eksplisit (10001:10001)
RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S appuser -G appgroup

# Salin aset build dari tahap builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static

# Gunakan pengguna non-root
USER 10001:10001

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
