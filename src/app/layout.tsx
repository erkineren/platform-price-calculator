import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Platform Fiyat Hesaplayıcı",
  description: "Online platformlarda satış yapanlar için komisyon, KDV ve kar hesaplama aracı",
  keywords: ["fiyat hesaplama", "komisyon hesaplama", "platform satış", "kar hesaplama", "KDV hesaplama"],
  authors: [{ name: "Erkin Eren" }],
  creator: "Erkin Eren",
  publisher: "Erkin Eren",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://platform-price-calculator.vercel.app/",
    title: "Platform Fiyat Hesaplayıcı",
    description: "Online platformlarda satış yapanlar için komisyon, KDV ve kar hesaplama aracı",
    siteName: "Platform Fiyat Hesaplayıcı",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Platform Fiyat Hesaplayıcı",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Platform Fiyat Hesaplayıcı",
    description: "Online platformlarda satış yapanlar için komisyon, KDV ve kar hesaplama aracı",
    images: ["/og-image.png"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#ffffff",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
