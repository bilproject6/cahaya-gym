"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, Plus, Loader2, X, AlertCircle,
  DollarSign, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight,
  Edit2, Trash2, CheckCircle, FileDown,
} from "lucide-react";
import { exportMultiSheet, fmtDate, fmtRp } from "@/lib/export";

type Expense = {
  id: string;
  kategori: string;
  jumlah: number;
  tanggal: string;
  catatan: string | null;
};

type SuppSale = {
  id: string;
  total_harga: number;
  harga_satuan: number;
  qty: number;
  tanggal: string;
  supplements: { nama_produk: string; harga_beli: number } | null;
};

type FinancialData = {
  payments: { jumlah: number; tanggal_bayar: string; catatan: string | null }[];
  visitors: { jumlah_bayar: number; tanggal: string; nama: string | null }[];
  suppSales: SuppSale[];
  expenses: Expense[];
  period: { firstDate: string; lastDate: string; year: number; month: number; mode: string };
};

const KATEGORI = ["maintenance", "listrik", "sewa", "gaji", "suplemen", "lainnya"] as const;
type KategoriType = typeof KATEGORI[number];

const kategoriLabel: Record<KategoriType, string> = {
  maintenance: "Maintenance Alat",
  listrik: "Listrik",
  sewa: "Sewa Tempat",
  gaji: "Gaji Staf",
  suplemen: "Pembelian Suplemen",
  lainnya: "Lainnya",
};

export default function AdminKeuanganPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [mode, setMode] = useState<"month" | "year" | "all">("month");
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pengeluaran" | "member" | "nonmember" | "suplemen">("pengeluaran");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const periodLabel = mode === "all" ? "Semua Waktu" : mode === "year" ? `Tahun ${year}` : new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/keuangan?year=${year}&month=${month}&mode=${mode}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  }, [year, month, mode]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const prevMonth = () => {
    if (mode === "year") { setYear(y => y - 1); return; }
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (mode === "all") return;
    const now = new Date();
    if (mode === "year") {
      if (year >= now.getFullYear()) return;
      setYear(y => y + 1);
      return;
    }
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };
  const isAtLatest = mode === "all"
    ? true
    : mode === "year"
    ? year >= today.getFullYear()
    : year === today.getFullYear() && month === today.getMonth() + 1;

  const handleDeleteExpense = async (id: string) => {
    try {
      const res = await fetch("/api/admin/keuangan", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.ok) {
        showToast("Pengeluaran berhasil dihapus.");
        fetchAll();
      } else {
        showToast(json.error || "Gagal menghapus.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
    setConfirmDeleteId(null);
  };

  const memberIncome = data?.payments.reduce((s, p) => s + p.jumlah, 0) ?? 0;
  const visitorIncome = data?.visitors.reduce((s, v) => s + v.jumlah_bayar, 0) ?? 0;
  const suppIncome = data?.suppSales.reduce((s, ss) => s + ss.total_harga, 0) ?? 0;
  const totalExp = data?.expenses.reduce((s, e) => s + e.jumlah, 0) ?? 0;
  const totalIn = memberIncome + visitorIncome + suppIncome;
  const saldo = totalIn - totalExp;
  const suppProfit = data?.suppSales.reduce((s, ss) => {
    const beli = (ss.supplements?.harga_beli ?? 0) * ss.qty;
    return s + (ss.total_harga - beli);
  }, 0) ?? 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{
            background: toast.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
            border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: toast.type === "success" ? "#22c55e" : "#ef4444",
          }}
        >
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
            KEUANGAN & ARUS KAS
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laporan {periodLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Tabs */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border-default)" }}>
            {(["month", "year", "all"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{
                  background: mode === m ? "var(--color-brand-orange)" : "transparent",
                  color: mode === m ? "#fff" : "var(--color-text-muted)",
                }}
              >
                {m === "month" ? "Bulanan" : m === "year" ? "Tahunan" : "Semua"}
              </button>
            ))}
          </div>

          {/* Period Navigation */}
          {mode !== "all" && (
            <div className="flex items-center gap-1 card" style={{ padding: "0.375rem 0.75rem" }}>
              <button onClick={prevMonth} className="p-1 rounded hover:opacity-70 transition-opacity">
                <ChevronLeft className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
              </button>
              <span className="text-sm font-medium px-2 min-w-[120px] text-center" style={{ color: "var(--color-text-primary)" }}>
                {periodLabel}
              </span>
              <button onClick={nextMonth} disabled={isAtLatest} className="p-1 rounded hover:opacity-70 transition-opacity disabled:opacity-30">
                <ChevronRight className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
              </button>
            </div>
          )}

          <button
            onClick={() => {
              const sheets = [
                {
                  name: "Pemasukan Member",
                  data: (data?.payments ?? []).map((p) => ({
                    "Tanggal": fmtDate(p.tanggal_bayar),
                    "Jumlah": fmtRp(p.jumlah),
                    "Catatan": p.catatan || "-",
                  })),
                },
                {
                  name: "Non-Member",
                  data: (data?.visitors ?? []).map((v) => ({
                    "Tanggal": fmtDate(v.tanggal),
                    "Nama": v.nama || "Tanpa Nama",
                    "Jumlah": fmtRp(v.jumlah_bayar),
                  })),
                },
                {
                  name: "Penjualan Suplemen",
                  data: (data?.suppSales ?? []).map((s) => ({
                    "Tanggal": fmtDate(s.tanggal),
                    "Produk": (s.supplements as { nama_produk: string } | null)?.nama_produk || "-",
                    "Qty": s.qty,
                    "Harga Satuan": fmtRp(s.harga_satuan),
                    "Total": fmtRp(s.total_harga),
                    "Modal": fmtRp((s.supplements as { harga_beli: number } | null)?.harga_beli ?? 0 * s.qty),
                    "Profit": fmtRp(s.total_harga - ((s.supplements as { harga_beli: number } | null)?.harga_beli ?? 0) * s.qty),
                  })),
                },
                {
                  name: "Pengeluaran",
                  data: (data?.expenses ?? []).map((e) => ({
                    "Tanggal": fmtDate(e.tanggal),
                    "Kategori": e.kategori,
                    "Jumlah": fmtRp(e.jumlah),
                    "Catatan": e.catatan || "-",
                  })),
                },
              ];
              exportMultiSheet(sheets, `cahaya-gym-keuangan-${periodLabel.replace(" ", "-")}`);
            }}
            className="btn-ghost"
          >
            <FileDown className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => setShowExpenseModal(true)} className="btn-primary" id="add-expense-btn">
            <Plus className="w-4 h-4" /> Catat Pengeluaran
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--color-brand-orange)" }} />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card-stat">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpCircle className="w-4 h-4" style={{ color: "var(--color-status-active)" }} />
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--color-text-muted)" }}>Pemasukan</span>
              </div>
              <div className="font-bebas text-2xl" style={{ color: "var(--color-status-active)" }}>{formatRupiah(totalIn)}</div>
            </div>
            <div className="card-stat">
              <div className="flex items-center gap-2 mb-2">
                <ArrowDownCircle className="w-4 h-4" style={{ color: "var(--color-status-danger)" }} />
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--color-text-muted)" }}>Pengeluaran</span>
              </div>
              <div className="font-bebas text-2xl" style={{ color: "var(--color-status-danger)" }}>{formatRupiah(totalExp)}</div>
            </div>
            <div className="card-stat">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />
                <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--color-text-muted)" }}>Saldo Bersih</span>
              </div>
              <div className="font-bebas text-2xl" style={{ color: saldo >= 0 ? "var(--color-status-active)" : "var(--color-status-danger)" }}>
                {formatRupiah(saldo)}
              </div>
            </div>
          </div>

          {/* Saldo Negatif Warning */}
          {saldo < 0 && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-6"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--color-status-danger)",
              }}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm">Saldo Negatif — Pengeluaran Melebihi Pemasukan</div>
                <div className="text-xs mt-0.5 opacity-80">
                  Periode {periodLabel}: pengeluaran lebih besar {formatRupiah(Math.abs(saldo))} dari pemasukan. Tinjau laporan pengeluaran.
                </div>
              </div>
            </div>
          )}

          {/* Tab navigation */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--color-dark-700)" }}>
            {([
              { id: "pengeluaran", label: "Pengeluaran", count: data?.expenses.length ?? 0, color: "#ef4444" },
              { id: "member", label: "Pemasukan Member", count: data?.payments.length ?? 0, color: "#22c55e" },
              { id: "nonmember", label: "Non-Member", count: data?.visitors.length ?? 0, color: "var(--color-brand-orange)" },
              { id: "suplemen", label: "Suplemen", count: data?.suppSales.length ?? 0, color: "#a855f7" },
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeTab === tab.id ? "var(--color-dark-600)" : "transparent",
                  color: activeTab === tab.id ? tab.color : "var(--color-text-muted)",
                  boxShadow: activeTab === tab.id ? "0 1px 6px rgba(0,0,0,0.3)" : "none",
                }}
              >
                {tab.label} <span className="opacity-60">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* TAB: Pengeluaran */}
          {activeTab === "pengeluaran" && (
            <div className="card">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Riwayat Pengeluaran — {periodLabel}
              </h2>
              {(data?.expenses.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada pengeluaran dicatat</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-[420px] overflow-y-auto space-y-2">
                    {data?.expenses.map((exp) => (
                      <div key={exp.id} className="flex items-start justify-between p-3 rounded-xl group"
                        style={{ background: "var(--color-dark-700)" }}>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                            {kategoriLabel[exp.kategori as KategoriType] ?? exp.kategori}
                          </div>
                          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {formatDate(exp.tanggal, { day: "numeric", month: "short", year: "numeric" })}
                            {exp.catatan && ` · ${exp.catatan}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-sm font-bold" style={{ color: "var(--color-status-danger)" }}>
                            -{formatRupiah(exp.jumlah)}
                          </span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditExpense(exp)} className="p-1 rounded-lg hover:opacity-70 transition-opacity" title="Edit" style={{ color: "var(--color-brand-orange)" }}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {confirmDeleteId === exp.id ? (
                              <div className="flex gap-1">
                                <button onClick={() => handleDeleteExpense(exp.id)} className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>Ya</button>
                                <button onClick={() => setConfirmDeleteId(null)} className="px-2 py-0.5 rounded text-xs" style={{ color: "var(--color-text-muted)" }}>Batal</button>
                              </div>
                            ) : (
                              <button onClick={() => setConfirmDeleteId(exp.id)} className="p-1 rounded-lg hover:opacity-70 transition-opacity" title="Hapus" style={{ color: "#ef4444" }}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Total row */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>TOTAL PENGELUARAN</span>
                    <span className="font-bebas text-lg" style={{ color: "#ef4444" }}>-{formatRupiah(totalExp)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Pemasukan Member */}
          {activeTab === "member" && (
            <div className="card">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Pembayaran Member — {periodLabel}
              </h2>
              {(data?.payments.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpCircle className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada pembayaran member</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-[420px] overflow-y-auto space-y-2">
                    {data?.payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--color-dark-700)" }}>
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>Pembayaran Keanggotaan</div>
                          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {formatDate(p.tanggal_bayar, { day: "numeric", month: "short", year: "numeric" })}
                            {p.catatan && ` · ${p.catatan}`}
                          </div>
                        </div>
                        <span className="font-semibold text-sm" style={{ color: "var(--color-status-active)" }}>+{formatRupiah(p.jumlah)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Total */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>TOTAL PEMASUKAN MEMBER</span>
                    <span className="font-bebas text-lg" style={{ color: "#22c55e" }}>+{formatRupiah(memberIncome)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Non-Member */}
          {activeTab === "nonmember" && (
            <div className="card">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Non-Member Harian — {periodLabel}
              </h2>
              {(data?.visitors.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <ArrowUpCircle className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada kunjungan non-member</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-[420px] overflow-y-auto space-y-2">
                    {data?.visitors.map((v, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--color-dark-700)" }}>
                        <div>
                          <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{v.nama || <em style={{ color: "var(--color-text-muted)" }}>Tanpa nama</em>}</div>
                          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{formatDate(v.tanggal, { day: "numeric", month: "short", year: "numeric" })}</div>
                        </div>
                        <span className="font-semibold text-sm" style={{ color: "var(--color-brand-orange)" }}>+{formatRupiah(v.jumlah_bayar)}</span>
                      </div>
                    ))}
                  </div>
                  {/* Total */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(255,107,44,0.06)", border: "1px solid rgba(255,107,44,0.15)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>TOTAL NON-MEMBER</span>
                    <span className="font-bebas text-lg" style={{ color: "var(--color-brand-orange)" }}>+{formatRupiah(visitorIncome)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: Suplemen */}
          {activeTab === "suplemen" && (
            <div className="card">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Penjualan Suplemen — {periodLabel}
              </h2>
              {/* Profit summary */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total Penjualan", value: suppIncome, color: "#a855f7" },
                  { label: "Total Modal", value: suppIncome - suppProfit, color: "#ef4444" },
                  { label: "Profit Bersih", value: suppProfit, color: "#22c55e" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="p-3 rounded-xl text-center" style={{ background: "var(--color-dark-700)" }}>
                    <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</div>
                    <div className="font-bebas text-base" style={{ color }}>{formatRupiah(value)}</div>
                  </div>
                ))}
              </div>
              {(data?.suppSales.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada penjualan suplemen</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="max-h-[420px] overflow-y-auto space-y-2">
                    {data?.suppSales.map((s) => {
                      const modal = (s.supplements?.harga_beli ?? 0) * s.qty;
                      const profit = s.total_harga - modal;
                      return (
                        <div key={s.id} className="flex items-start justify-between p-3 rounded-xl" style={{ background: "var(--color-dark-700)" }}>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{s.supplements?.nama_produk ?? "—"}</div>
                            <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                              {formatDate(s.tanggal, { day: "numeric", month: "short", year: "numeric" })} · {s.qty} pcs × {formatRupiah(s.harga_satuan)}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: profit >= 0 ? "#22c55e" : "#ef4444" }}>
                              Profit: {formatRupiah(profit)}
                            </div>
                          </div>
                          <span className="font-semibold text-sm" style={{ color: "#a855f7" }}>+{formatRupiah(s.total_harga)}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Total */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
                    <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>TOTAL PENJUALAN SUPLEMEN</span>
                    <span className="font-bebas text-lg" style={{ color: "#a855f7" }}>+{formatRupiah(suppIncome)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showExpenseModal && (
        <AddExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onSuccess={async () => { await fetchAll(); setShowExpenseModal(false); showToast("Pengeluaran berhasil dicatat! ✅"); }}
        />
      )}
      {editExpense && (
        <EditExpenseModal
          expense={editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={async () => { await fetchAll(); setEditExpense(null); showToast("Pengeluaran berhasil diperbarui! ✅"); }}
        />
      )}
    </div>
  );
}

function AddExpenseModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    kategori: "maintenance" as KategoriType,
    jumlah: "",
    tanggal: new Date().toISOString().split("T")[0],
    catatan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/keuangan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, jumlah: Number(form.jumlah) }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan."); setLoading(false); return; }
      await onSuccess();
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Catat Pengeluaran</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          <div>
            <label className="input-label">Kategori</label>
            <select id="expense-kategori" className="input" value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value as KategoriType })}>
              {KATEGORI.map((k) => (
                <option key={k} value={k} style={{ background: "var(--color-dark-700)" }}>
                  {kategoriLabel[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Jumlah (Rp)</label>
            <input id="expense-jumlah" type="number" className="input" placeholder="Contoh: 150000"
              value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} required min={0} />
          </div>

          <div>
            <label className="input-label">Tanggal</label>
            <input id="expense-tanggal" type="date" className="input" value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />
          </div>

          <div>
            <label className="input-label">Catatan (Opsional)</label>
            <input id="expense-catatan" type="text" className="input" placeholder="Detail pengeluaran..."
              value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
            <button id="expense-submit-btn" type="submit" disabled={loading} className="btn-danger flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingDown className="w-4 h-4" /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditExpenseModal({
  expense,
  onClose,
  onSuccess,
}: {
  expense: Expense;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    kategori: expense.kategori as KategoriType,
    jumlah: String(expense.jumlah),
    tanggal: expense.tanggal,
    catatan: expense.catatan ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkedWarning, setLinkedWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/keuangan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: expense.id, ...form, jumlah: Number(form.jumlah) }),
      });

      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan."); setLoading(false); return; }

      // Jika hanya catatan yang bisa diedit (terkait stok)
      if (json.note) setLinkedWarning(true);

      await onSuccess();
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Edit Pengeluaran</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>

        {linkedWarning && (
          <div className="flex items-start gap-2 p-3 rounded-xl mb-4 text-xs"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b" }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Pengeluaran ini terkait riwayat stok suplemen. Hanya <strong>catatan</strong> yang dapat diubah.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <AlertCircle className="w-4 h-4" />{error}
            </div>
          )}

          <div>
            <label className="input-label">Kategori</label>
            <select className="input" value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value as KategoriType })}>
              {KATEGORI.map((k) => (
                <option key={k} value={k} style={{ background: "var(--color-dark-700)" }}>
                  {kategoriLabel[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">Jumlah (Rp)</label>
            <input type="number" className="input" placeholder="Contoh: 150000"
              value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: e.target.value })} required min={0} />
          </div>

          <div>
            <label className="input-label">Tanggal</label>
            <input type="date" className="input" value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })} required />
          </div>

          <div>
            <label className="input-label">Catatan (Opsional)</label>
            <input type="text" className="input" placeholder="Detail pengeluaran..."
              value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Edit2 className="w-4 h-4" /> Perbarui</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
