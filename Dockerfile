# AI Agent Central — workshop prototype (Next.js + Prisma + PostgreSQL)
FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma generate only during build — DB seed happens at container start
ENV DATABASE_URL="postgresql://agentcentral:agentcentral@db:5432/agentcentral?schema=public"
RUN npx prisma generate && npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_URL="postgresql://agentcentral:agentcentral@db:5432/agentcentral?schema=public"

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --create-home --home-dir /home/nextjs nextjs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY scripts/docker-entrypoint.sh /app/scripts/docker-entrypoint.sh

RUN sed -i 's/\r$//' /app/scripts/docker-entrypoint.sh \
  && chmod +x /app/scripts/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app /home/nextjs

USER nextjs
ENV HOME=/home/nextjs
EXPOSE 3000
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
