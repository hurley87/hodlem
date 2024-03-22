import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';
import PrivyWrapper from './PrivyWrapper';
import { Toaster } from 'react-hot-toast';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Hodlem',
  description: "Onchain Texas Hold'em",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-background font-sans antialiased  ${fontSans.variable}`}
      >
        <Toaster />
        <ConvexClientProvider>
          <PrivyWrapper>{children}</PrivyWrapper>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
