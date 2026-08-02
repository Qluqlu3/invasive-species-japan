import { expect, test } from '@playwright/test';

test.describe('一覧画面', () => {
  test('種の一覧が表示される', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: '日本の特定外来生物' }),
    ).toBeVisible();
    await expect(page.getByText(/\d+ 件/)).toBeVisible();
  });

  test('検索すると和名で絞り込まれる', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('和名・学名・科・目で検索').fill('アライグマ');
    // 「アライグマ」「カニクイアライグマ」の2種がヒットする
    await expect(page.getByText('2 件')).toBeVisible();
    await expect(page.getByText('アライグマ', { exact: true })).toBeVisible();
    await expect(page.getByText('カニクイアライグマ')).toBeVisible();
  });

  test('地図から都道府県をクリックすると一覧が絞り込まれ、URLに反映される', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByText('地図から都道府県で絞り込む').click();

    const tokyoPath = page.locator('path[aria-label="東京"]');
    await expect(tokyoPath).toBeVisible();

    // Tokyoは伊豆・小笠原諸島を含む複雑な形状のため、パスの重心が実際の
    // 描画領域外に来ることがある（幾何形状に起因する既知の制約）。
    // ここではアプリのフィルタ連携ロジックを検証したいので、要素への
    // 実クリック座標に依存しないdispatchEventで確実にクリックイベントを発火させる。
    await tokyoPath.dispatchEvent('click');

    await expect(page).toHaveURL(/prefecture=%E6%9D%B1%E4%BA%AC/);
    await expect(
      page.getByText('東京で絞り込み中・もう一度クリックすると解除されます'),
    ).toBeVisible();

    // もう一度クリックすると解除される
    await tokyoPath.dispatchEvent('click');
    await expect(page).not.toHaveURL(/prefecture=/);
  });
});
