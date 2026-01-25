import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Exam System',
    template: '%s | Exam System'
  },
  description: 'বিসিএস, ব্যাংক, প্রাইমারি সহ সকল চাকরির পরীক্ষার জন্য সম্পূর্ণ প্রস্তুতি',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}