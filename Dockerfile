FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ---- 依存関係インストール（キャッシュ活用） ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ---- 開発用（docker compose up はこのステージを使う。ソースはホットリロード用にマウントされる） ----
FROM deps AS dev
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# ---- 本番ビルド ----
FROM deps AS builder
COPY . .
ENV DOCKER_BUILD=1
RUN pnpm build

# ---- 本番実行（Next.jsのstandalone出力を使った最小イメージ） ----
FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
