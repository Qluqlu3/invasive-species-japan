/**
 * http.ts
 * データ収集スクリプト共通のHTTPユーティリティ
 */

/** 環境省・NIESサイトへのスクレイピングで共通利用するUser-Agent */
export const SCRAPER_USER_AGENT =
  'Mozilla/5.0 (invasive-species-viewer/1.0; research)';

/** 指定ミリ秒待機する（レート制限対策） */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** UAヘッダー付きでフェッチし、レスポンスが失敗ならHTTPエラーを投げる */
export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': SCRAPER_USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}
