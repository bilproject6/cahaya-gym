/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

/**
 * Format date short
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculate days remaining from today to target date
 */
export function daysRemaining(targetDate: string | Date): number {
  const target = new Date(typeof targetDate === "string" ? targetDate : targetDate.getTime());
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get member status based on days remaining
 */
export function getMemberStatus(
  tanggalJatuhTempo: string | Date,
  dbStatus?: string
): "aktif" | "akan-habis" | "expired" | "non-aktif" {
  if (dbStatus === "non-aktif") return "non-aktif";
  const days = daysRemaining(tanggalJatuhTempo);
  if (days <= 0) return "expired";
  if (days <= 3) return "akan-habis";
  return "aktif";
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return months[month - 1] || "";
}

/**
 * Add days to a date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Get first and last day of month
 */
export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  return { start, end };
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Generate WhatsApp URL
 */
export function waLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const formatted = cleanPhone.startsWith("0")
    ? "62" + cleanPhone.slice(1)
    : cleanPhone;
  const encodedMsg = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${formatted}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
}
