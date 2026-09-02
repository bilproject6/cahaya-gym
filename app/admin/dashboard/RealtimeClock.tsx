"use client";
import { useEffect, useState } from "react";

export default function RealtimeClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!now) return null;

  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  const label = `${hari[now.getDay()]}, ${now.getDate()} ${bulan[now.getMonth()]} ${now.getFullYear()}`;
  const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div
      className="flex flex-col items-end gap-0.5 flex-shrink-0"
      style={{ color: "var(--color-text-muted)" }}
    >
      <span className="font-bebas text-2xl tracking-wider" style={{ color: "var(--color-brand-orange)", lineHeight: 1 }}>
        {jam}
      </span>
      <span className="text-xs">{label}</span>
    </div>
  );
}
