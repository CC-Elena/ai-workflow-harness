import type { Metadata } from 'next';
import './globals.css';
import NavBar from '../components/layouts/nav-bar';

export const metadata: Metadata = {
  title: 'AI Workflow Harness',
  description: 'A repository-native workflow cockpit for AI-assisted development.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  );
}
