/**
 * lib/export.ts
 * Utility untuk export data ke file Excel (.xlsx) yang profesional
 * Dengan branding Cahaya Gym, header, dan formatting
 */
import * as XLSX from "xlsx";

export type SheetData = {
  name: string;
  data: Record<string, unknown>[];
};

/**
 * Helper: buat style header branding di atas data
 * Mengembalikan array-of-arrays untuk ditambahkan sebelum data
 */
function buildHeaderRows(sheetTitle: string): unknown[][] {
  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return [
    ["CAHAYA GYM"],
    [`Laporan ${sheetTitle}`],
    [`Diekspor: ${dateStr}, ${timeStr}`],
    [], // baris kosong pemisah
  ];
}

/**
 * Helper: hitung auto-width kolom berdasarkan data & header
 */
function calcColWidths(
  headers: string[],
  data: Record<string, unknown>[]
): { wch: number }[] {
  return headers.map((key) => {
    const maxData = data.reduce((max, row) => {
      const len = String(row[key] ?? "").length;
      return len > max ? len : max;
    }, 0);
    return { wch: Math.max(key.length, maxData, 12) + 3 };
  });
}

/**
 * Helper: buat worksheet dengan header branding + data
 */
function buildSheet(
  data: Record<string, unknown>[],
  sheetTitle: string
): XLSX.WorkSheet {
  if (!data || data.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([
      ...buildHeaderRows(sheetTitle),
      ["Tidak ada data"],
    ]);
    return ws;
  }

  const headerRows = buildHeaderRows(sheetTitle);
  const headers = Object.keys(data[0]);

  // Baris header + data sebagai AOA (array of arrays)
  const aoa: unknown[][] = [
    ...headerRows,
    headers, // header kolom
    ...data.map((row) => headers.map((h) => row[h] ?? "")),
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Auto-width kolom
  ws["!cols"] = calcColWidths(headers, data);

  // Merge cell baris 1 (CAHAYA GYM) spanning semua kolom
  const colCount = Math.max(headers.length, 1);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }, // CAHAYA GYM
    { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } }, // Laporan ...
    { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } }, // Diekspor ...
  ];

  // Freeze panes — baris setelah header (baris 5, yaitu index row 4 = header kolom data)
  ws["!freeze"] = { xSplit: 0, ySplit: 5 };

  return ws;
}

/**
 * Export satu sheet ke file .xlsx dengan branding
 */
export function exportToExcel(
  data: Record<string, unknown>[],
  sheetName: string,
  filename: string
) {
  const ws = buildSheet(data, sheetName);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export banyak sheet ke satu file .xlsx dengan branding
 */
export function exportMultiSheet(sheets: SheetData[], filename: string) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    const ws = buildSheet(data, name);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Format tanggal untuk tampil di Excel
 */
export function fmtDate(dateStr: string): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format mata uang untuk tampil di Excel
 */
export function fmtRp(num: number): string {
  return `Rp ${(num ?? 0).toLocaleString("id-ID")}`;
}