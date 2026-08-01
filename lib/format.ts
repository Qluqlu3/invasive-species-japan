/** "YYYY-MM-DD" を日本語表記に変換する（タイムゾーン変換を避けるため文字列のまま処理） */
export function formatJaDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${y}年${Number(m)}月${Number(d)}日`;
}
