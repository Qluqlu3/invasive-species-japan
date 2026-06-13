FROM node:20-alpine

WORKDIR /app

# 依存関係インストール（キャッシュ活用）
COPY package.json package-lock.json* ./
RUN npm ci

# ソースコードをコピー
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
