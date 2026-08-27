import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";

export const metadata: Metadata = {
  title: "Cahaya Gym — Fitness Center Terbaik",
  description:
    "Cahaya Gym menawarkan fasilitas fitness modern dengan harga terjangkau. Member bulanan Rp100.000, non-member harian Rp10.000. Bergabunglah sekarang!",
  keywords: "gym, fitness, olahraga, cahaya gym, member gym, latihan",
  openGraph: {
    title: "Cahaya Gym",
    description:
      "Fitness center dengan fasilitas lengkap dan harga terjangkau.",
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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
