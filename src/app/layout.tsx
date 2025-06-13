import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import Head from 'next/head'; // Import Head

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin', 'arabic'], // Added 'arabic' subset if available, otherwise it will fallback.
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin', 'arabic'], // Added 'arabic' subset if available.
});

export const metadata: Metadata = {
  title: 'Atmetny | أتمتني', // Changed from NajahEdu Prep
  description: 'منصة تعليمية شاملة لطلاب الثالث الثانوي في سوريا',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0KOVcNqOIIJGEcymbAoisMZRLMgMFjOkPMGKtcMDc4makAUgtOLVT"
          crossOrigin="anonymous"
        />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen={true}>
            <AppLayout>
              {children}
            </AppLayout>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
