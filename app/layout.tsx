import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram Message Sender',
  description: 'Send messages to Instagram users via Graph API',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

