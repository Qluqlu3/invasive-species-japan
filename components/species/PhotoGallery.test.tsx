import { fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithChakra, screen } from '@/components/test-utils';
import type { PhotoCredit } from '@/lib/types';
import PhotoGallery from './PhotoGallery';

describe('PhotoGallery', () => {
  it('写真が1枚のときはサムネイル一覧を表示しない', () => {
    renderWithChakra(<PhotoGallery photos={['/a.jpg']} name="アライグマ" />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('写真が複数のときサムネイル一覧を表示し、クリックでメイン画像が切り替わる', () => {
    renderWithChakra(
      <PhotoGallery photos={['/a.jpg', '/b.jpg']} name="アライグマ" />,
    );

    const mainImage = screen.getByAltText('アライグマ');
    expect(mainImage).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent('/a.jpg')),
    );

    fireEvent.click(screen.getByAltText('アライグマ 2').closest('button')!);

    expect(screen.getByAltText('アライグマ')).toHaveAttribute(
      'src',
      expect.stringContaining(encodeURIComponent('/b.jpg')),
    );
  });

  it('creditが無い場合は出典を表示しない', () => {
    renderWithChakra(<PhotoGallery photos={['/a.jpg']} name="アライグマ" />);
    expect(screen.queryByText(/出典:/)).not.toBeInTheDocument();
  });

  it('選択中の写真にcreditがある場合、出典とライセンスを表示する', () => {
    const credits: Record<string, PhotoCredit> = {
      '/a.jpg': {
        source: 'wikimedia',
        credit: 'Andrew Mercer',
        license: 'CC BY-SA 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        sourceUrl: 'https://commons.wikimedia.org/wiki/File:a.jpg',
      },
    };
    renderWithChakra(
      <PhotoGallery photos={['/a.jpg']} name="アライグマ" credits={credits} />,
    );

    expect(screen.getByText(/出典:/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Andrew Mercer' })).toHaveAttribute(
      'href',
      'https://commons.wikimedia.org/wiki/File:a.jpg',
    );
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by-sa/4.0/',
    );
  });

  it('sourceUrl/licenseUrlが無い場合はプレーンテキストで出典・ライセンスを表示する', () => {
    const credits: Record<string, PhotoCredit> = {
      '/a.jpg': { source: 'env', credit: '環境省提供', license: '要許諾' },
    };
    renderWithChakra(
      <PhotoGallery photos={['/a.jpg']} name="アライグマ" credits={credits} />,
    );

    expect(screen.getByText(/環境省提供/)).toBeInTheDocument();
    expect(screen.getByText(/要許諾/)).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('サムネイルをクリックすると表示するcreditも選択中の写真のものに切り替わる', () => {
    const credits: Record<string, PhotoCredit> = {
      '/a.jpg': { source: 'env', credit: '環境省提供' },
      '/b.jpg': { source: 'wikimedia', credit: 'Andrew Mercer' },
    };
    renderWithChakra(
      <PhotoGallery
        photos={['/a.jpg', '/b.jpg']}
        name="アライグマ"
        credits={credits}
      />,
    );

    expect(screen.getByText(/環境省提供/)).toBeInTheDocument();
    fireEvent.click(screen.getByAltText('アライグマ 2').closest('button')!);
    expect(screen.queryByText(/環境省提供/)).not.toBeInTheDocument();
    expect(screen.getByText(/Andrew Mercer/)).toBeInTheDocument();
  });
});
