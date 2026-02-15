# --- Build dashboard ---
FROM oven/bun:1 AS dashboard-builder
WORKDIR /app/dashboard
COPY dashboard/package.json dashboard/bun.lock ./
RUN bun install --frozen-lockfile
COPY dashboard/ ./
RUN bun run build

# --- Final image ---
FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=dashboard-builder /app/src/dashboard ./src/dashboard
COPY src/ ./src/
COPY templates/ ./templates/

ENV NODE_ENV=production
EXPOSE 4400

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -q --spider http://localhost:4400/logs || exit 1

CMD ["bun", "src/index.ts"]
