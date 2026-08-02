import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // "standalone"出力は`next start`では使えず、`node .next/standalone/server.js`
  // での起動が必要になる。Dockerの本番イメージ用ビルドでのみ有効にし、
  // 通常の`pnpm build && pnpm start`（ローカルでの本番確認・E2Eテスト等）を壊さないようにする。
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
