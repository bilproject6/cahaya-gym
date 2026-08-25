import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
