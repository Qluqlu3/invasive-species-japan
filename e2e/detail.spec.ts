import { expect, test } from '@playwright/test';

test.describe('一覧から詳細への遷移', () => {
  test('種をクリックすると詳細ページに遷移し、戻ると一覧に戻れる', async ({
    page,
  }) => {
    await page.goto('/');
    await page.getByPlaceholder('和名・学名・科・目で検索').fill('アライグマ');
    // 検索語のURL反映は300msデバウンスされ、それに伴い一覧の絞り込みも
    // 遅れて起こるため、絞り込み後の件数表示を待ってからクリックする
    await expect(page.getByText('2 件')).toBeVisible();
    await page.getByRole('link', { name: 'アライグマ', exact: true }).click();

    await expect(page).toHaveURL(/\/species\/procyon-lotor/);
    await expect(
      page.getByRole('heading', { name: 'アライグマ' }),
    ).toBeVisible();
    await expect(page.getByText('Procyon lotor')).toBeVisible();

    await page.getByRole('button', { name: '← 一覧に戻る' }).click();
    await expect(page).toHaveURL(
      /\/\?q=%E3%82%A2%E3%83%A9%E3%82%A4%E3%82%B0%E3%83%9E/,
    );
    await expect(page.getByPlaceholder('和名・学名・科・目で検索')).toHaveValue(
      'アライグマ',
    );
  });

  test('存在しない種のURLは404を表示する', async ({ page }) => {
    await page.goto('/species/存在しない種');
    await expect(page.getByText('種が見つかりません')).toBeVisible();
  });
});
