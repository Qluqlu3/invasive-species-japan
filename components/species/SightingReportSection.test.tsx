import { fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import SightingReportSection from './SightingReportSection';

function mockGeolocation(
  impl: (success: PositionCallback, error?: PositionErrorCallback) => void,
) {
  Object.defineProperty(window.navigator, 'geolocation', {
    value: { getCurrentPosition: vi.fn(impl) },
    configurable: true,
  });
}

describe('SightingReportSection', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it('初期状態では位置情報未取得のため報告メモコピーボタンは無効', () => {
    renderWithChakra(
      <SightingReportSection
        jaName="アライグマ"
        scientificName="Procyon lotor"
      />,
    );
    expect(
      screen.getByRole('button', { name: '報告メモをコピー' }),
    ).toBeDisabled();
  });

  it('現在地取得に成功すると緯度経度を含む報告メモを表示する', async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 35.6812, longitude: 139.7671, accuracy: 12.3 },
      } as GeolocationPosition);
    });
    renderWithChakra(
      <SightingReportSection
        jaName="アライグマ"
        scientificName="Procyon lotor"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '現在地を取得する' }));

    const textarea = await screen.findByRole('textbox');
    const value = (textarea as HTMLTextAreaElement).value;
    expect(value).toContain('緯度 35.681200, 経度 139.767100');
    expect(value).toContain('誤差 約12m');
    expect(
      screen.getByRole('button', { name: '報告メモをコピー' }),
    ).not.toBeDisabled();
  });

  it('現在地取得に失敗するとエラーメッセージを表示する', async () => {
    mockGeolocation((_success, error) => {
      error?.({} as GeolocationPositionError);
    });
    renderWithChakra(
      <SightingReportSection
        jaName="アライグマ"
        scientificName="Procyon lotor"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '現在地を取得する' }));

    expect(
      await screen.findByText(
        '位置情報を取得できませんでした（許可設定をご確認ください）',
      ),
    ).toBeInTheDocument();
  });

  it('位置情報APIが無い端末ではエラーメッセージを表示する', () => {
    delete (window.navigator as { geolocation?: unknown }).geolocation;
    renderWithChakra(
      <SightingReportSection
        jaName="アライグマ"
        scientificName="Procyon lotor"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '現在地を取得する' }));

    expect(
      screen.getByText('この端末では位置情報を取得できません'),
    ).toBeInTheDocument();
  });

  it('報告メモをコピーすると種名・学名・座標を含むテキストがクリップボードに書き込まれる', async () => {
    mockGeolocation((success) => {
      success({
        coords: { latitude: 35.6812, longitude: 139.7671, accuracy: 12.3 },
      } as GeolocationPosition);
    });
    renderWithChakra(
      <SightingReportSection
        jaName="アライグマ"
        scientificName="Procyon lotor"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '現在地を取得する' }));
    await screen.findByRole('textbox');

    fireEvent.click(screen.getByRole('button', { name: '報告メモをコピー' }));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('種名: アライグマ（Procyon lotor）'),
      );
    });
    expect(
      await screen.findByRole('button', { name: 'コピーしました' }),
    ).toBeInTheDocument();
  });

  it('いきものログと地方環境事務所への外部リンクを表示する', () => {
    renderWithChakra(
      <SightingReportSection
        jaName="アライグマ"
        scientificName="Procyon lotor"
      />,
    );
    expect(
      screen.getByRole('link', { name: 'いきものログで報告する ↗' }),
    ).toHaveAttribute('href', 'https://ikilog.biodic.go.jp/ReportRegister/');
    expect(
      screen.getByRole('link', { name: '地方環境事務所等 連絡先一覧 ↗' }),
    ).toHaveAttribute('href', 'https://www.env.go.jp/nature/intro/reo.html');
  });
});
