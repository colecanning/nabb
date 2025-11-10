import type { Metadata } from 'next';
import { Providers } from './providers';
import { Roboto } from 'next/font/google';

export const metadata: Metadata = {
  title: 'Instagram Message Sender',
  description: 'Send messages to Instagram users via Graph API',
  icons: {
    icon: '/images/logo.svg',
  },
};

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

