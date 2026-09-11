import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "Cahaya Gym — Fitness Center Terbaik di Surabaya",
  description:
    "Cahaya Gym — gym lokal Surabaya dengan fasilitas lengkap, harga terjangkau. Member bulanan Rp100.000, non-member harian Rp10.000. Daftar sekarang!",
  keywords: "gym, fitness, olahraga, cahaya gym, member gym, latihan, surabaya",
  openGraph: {
    title: "Cahaya Gym — Latihan Keras, Hasil Lebih Keras",
    description:
      "Fitness center dengan fasilitas lengkap dan harga terjangkau di Surabaya.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
