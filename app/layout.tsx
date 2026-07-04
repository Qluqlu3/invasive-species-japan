import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: '日本の特定外来生物',
  description:
    '環境省指定の特定外来生物・条件付特定外来生物を一覧・検索できるビューア',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Providers>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}
          >
            <div style={{ flex: 1 }}>{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
