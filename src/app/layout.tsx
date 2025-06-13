import type { Metadata } from 'next';
import { Cairo } from 'next/font/google'; // خط يدعم العربية
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import Head from 'next/head';

// ✅ استخدام خط Cairo فقط (يدعم arabic و latin)
const cairo = Cairo({
  variable: '--font-cairo',
  subsets: ['latin', 'arabic'],
});

export const metadata: Metadata = {
  title: 'Atmetny | أتمتني',
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
      <body className={`${cairo.variable} antialiased`}>
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
