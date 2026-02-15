# --- Build dashboard ---
FROM node:22-alpine AS dashboard-builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY dashboard/ ./
RUN pnpm build

# --- Final image ---
FROM node:22-alpine
# libstdc++ is needed at runtime by the compiled better-sqlite3 binding
RUN apk add --no-cache python3 make g++ libstdc++
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml .pnpm-approved-builds.json ./
RUN pnpm install --frozen-lockfile --prod \
  && apk del python3 make g++

COPY --from=dashboard-builder /app/src/dashboard ./src/dashboard
COPY src/ ./src/
COPY templates/ ./templates/

ENV NODE_ENV=production
EXPOSE 4400

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:4400/logs || exit 1

CMD ["pnpm", "dev"]
