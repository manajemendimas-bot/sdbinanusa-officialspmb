import type {Metadata} from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SD Bina Nusa — Official School Website & SPMB 2027/2028',
  description: 'Website Resmi SD Bina Nusa (Yayasan Pendidikan Arrafah Rajeg) dan Sistem SPMB Terintegrasi Tahun Pelajaran 2027/2028.',
  icons: { icon: '/logo-bina-nusa.jpeg', apple: '/logo-bina-nusa.jpeg' },
  openGraph: {
    title: 'SD Bina Nusa — Official School Website & SPMB 2027/2028',
    description: 'Website Resmi SD Bina Nusa dan Sistem Penerimaan Murid Baru Terpadu Tahun Pelajaran 2027/2028.',
    type: 'website',
    images: ['/logo-bina-nusa.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SD Bina Nusa — Official School Website & SPMB 2027/2028',
    description: 'Website Resmi SD Bina Nusa dan Sistem Penerimaan Murid Baru Terpadu Tahun Pelajaran 2027/2028.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#F5F8FC] text-[#0F172A] min-h-screen selection:bg-[#03357E] selection:text-[#FFFFFF]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
