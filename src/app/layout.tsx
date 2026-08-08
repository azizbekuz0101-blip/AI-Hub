import type { Metadata } from 'next';
import './globals.css';
import { I18nProvider } from '@/i18n/context';

export const metadata: Metadata = {
  title: 'AI HUB — Multilingual AI Workspace',
  description: 'Chat with AI HUB AI, your everyday intelligent assistant. Write code, analyze data, and generate content across Russian, Uzbek, and English.',
  keywords: ['AI HUB', 'AI HUB AI', 'Cloudflare Workers AI', 'Open Source AI', 'Multilingual AI'],
  openGraph: {
    title: 'AI HUB — Multilingual AI Workspace',
    description: 'Chat with AI HUB AI, your everyday intelligent assistant powered by open-source AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-textMain antialiased min-h-screen flex flex-col selection:bg-accent/30 selection:text-white">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
