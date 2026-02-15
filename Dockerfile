# --- Build dashboard ---
FROM node:20-alpine AS dashboard-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY dashboard/ ./
RUN pnpm build

# --- Install production deps ---
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# --- Final image ---
FROM node:20-alpine
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=dashboard-builder /app/src/dashboard ./src/dashboard
COPY package.json ./
COPY src/ ./src/
COPY templates/ ./templates/

ENV NODE_ENV=production
EXPOSE 4400

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:4400/logs || exit 1

CMD ["pnpm", "dev"]
