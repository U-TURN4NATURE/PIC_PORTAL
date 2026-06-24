import type { Metadata } from 'next';
import { Inter, DM_Serif_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
});
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'U-Turn4Nature | Partners in Change (PIC) Portal',
  description: 'Join U-Turn4Nature as a Partner in Change (PIC). Earn 5% contribution on every referral, support rural women entrepreneurs, and be part of India\'s homemade food revolution.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo_1.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo_1.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo_1.jpg" />
      </head>
      <body className={`${inter.variable} ${dmSerif.variable} ${plusJakartaSans.variable} antialiased font-sans`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
