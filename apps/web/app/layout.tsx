import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title:       'SRJ Sarathi HRMS',
  description: 'Connect | Collaborate | Grow — SRJ Steel HR Management System',
  icons:       { icon: '/logo.png' },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  themeColor:   '#F97316',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
