import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '投資ニュース | 日本人投資家のための投資情報キュレーション',
  description: '日本株・米国株・為替・決算・テーマ株など、投資家が注目する最新ニュースをAIが要約・分類して毎日更新。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={notoSansJP.className}>{children}</body>
    </html>
  );
}