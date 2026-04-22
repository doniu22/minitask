# ============================================
# Stage 1: Dependencies (production only)
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate Prisma client before build
RUN npx prisma generate

# next.config.js must have output: 'standalone' for this to work
RUN npm run build

# ============================================
# Stage 3: Runner (production)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 appuser

# Standalone output (requires output: 'standalone' in next.config.js)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma: engine binaries + generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

USER appuser

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Requires GET /api/health → 200 to be implemented (TASK-010)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
