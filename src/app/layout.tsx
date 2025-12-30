import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'منصة متابعة أداء المدرسين',
  description: 'منصة متكاملة لإدارة ومتابعة أداء المدرسين في المؤسسات التعليمية',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
