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

type FinancialData = {
  payments: { jumlah: number; tanggal_bayar: string; catatan: string | null }[];
  visitors: { jumlah_bayar: number; tanggal: string; nama: string | null }[];
  suppSales: { total_harga: number; tanggal: string }[];
  expenses: Expense[];
  period: { firstOfMonth: string; lastOfMonth: string; year: number; month: number };
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
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/keuangan?year=${year}&month=${month}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch { /* ignore */ }
    setLoading(false);
  }, [year, month]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    const now = new Date();
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

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
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
            KEUANGAN & ARUS KAS
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Laporan {monthLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month navigation */}
          <div className="flex items-center gap-1 card" style={{ padding: "0.375rem 0.75rem" }}>
            <button onClick={prevMonth} className="p-1 rounded hover:opacity-70 transition-opacity">
              <ChevronLeft className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
            </button>
            <span className="text-sm font-medium px-2 min-w-[120px] text-center" style={{ color: "var(--color-text-primary)" }}>
              {monthLabel}
            </span>
            <button onClick={nextMonth} disabled={isCurrentMonth} className="p-1 rounded hover:opacity-70 transition-opacity disabled:opacity-30">
              <ChevronRight className="w-4 h-4" style={{ color: "var(--color-text-secondary)" }} />
            </button>
          </div>
          <button
            onClick={() => {
              const sheets = [
                {
                  name: "Pemasukan",
                  data: (data?.payments ?? []).map((p) => ({
                    "Tanggal": fmtDate(p.tanggal_bayar),
                    "Jumlah": fmtRp(p.jumlah),
                    "Catatan": p.catatan || "-",
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
              exportMultiSheet(sheets, `cahaya-gym-keuangan-${monthLabel.replace(" ", "-")}`);
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
                  Bulan {monthLabel}: pengeluaran lebih besar {formatRupiah(Math.abs(saldo))} dari pemasukan. Tinjau laporan pengeluaran.
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Income Breakdown */}
            <div className="card">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Rincian Pemasukan</h2>
              <div className="space-y-3">
                {[
                  { label: "Pembayaran Member", amount: memberIncome, count: data?.payments.length ?? 0 },
                  { label: "Non-Member Harian", amount: visitorIncome, count: data?.visitors.length ?? 0 },
                  { label: "Penjualan Suplemen", amount: suppIncome, count: data?.suppSales.length ?? 0 },
                ].map(({ label, amount, count }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "var(--color-dark-700)" }}>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-4 h-4" style={{ color: "var(--color-status-active)" }} />
                      <div>
                        <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{count} transaksi</div>
                      </div>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--color-status-active)" }}>
                      +{formatRupiah(amount)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--color-dark-700)" }}>
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-4 h-4" style={{ color: "var(--color-status-danger)" }} />
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Total Pengeluaran</span>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: "var(--color-status-danger)" }}>
                    -{formatRupiah(totalExp)}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses List */}
            <div className="card">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Riwayat Pengeluaran Bulan Ini
              </h2>
              {(data?.expenses.length ?? 0) === 0 ? (
                <div className="text-center py-8">
                  <TrendingDown className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada pengeluaran dicatat</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {data?.expenses.map((exp) => (
                    <div key={exp.id} className="flex items-start justify-between p-3 rounded-xl group"
                      style={{ background: "var(--color-dark-700)" }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {kategoriLabel[exp.kategori as KategoriType] ?? exp.kategori}
                        </div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {formatDate(exp.tanggal, { day: "numeric", month: "short" })}
                          {exp.catatan && ` · ${exp.catatan}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm font-bold" style={{ color: "var(--color-status-danger)" }}>
                          -{formatRupiah(exp.jumlah)}
                        </span>
                        {/* Action buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditExpense(exp)}
                            className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                            title="Edit pengeluaran"
                            style={{ color: "var(--color-brand-orange)" }}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {confirmDeleteId === exp.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="px-2 py-0.5 rounded text-xs font-bold"
                                style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                              >Ya</button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-0.5 rounded text-xs"
                                style={{ color: "var(--color-text-muted)" }}
                              >Batal</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(exp.id)}
                              className="p-1 rounded-lg hover:opacity-70 transition-opacity"
                              title="Hapus pengeluaran"
                              style={{ color: "#ef4444" }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          {(data?.payments.length ?? 0) > 0 && (
            <div className="card mt-6">
              <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
                Transaksi Member Bulan Ini
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data?.payments.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "var(--color-dark-700)" }}>
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                        Pembayaran Keanggotaan
                      </div>
                      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {formatDate(p.tanggal_bayar, { day: "numeric", month: "short" })}
                        {p.catatan && ` · ${p.catatan}`}
                      </div>
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--color-status-active)" }}>
                      +{formatRupiah(p.jumlah)}
                    </span>
                  </div>
                ))}
              </div>
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
