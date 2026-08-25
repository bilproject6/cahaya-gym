"use client";

import { useState, useEffect, useCallback } from "react";
import { formatRupiah, formatDate } from "@/lib/utils";
import {
  Package, Plus, AlertTriangle, Minus, Loader2, X, TrendingUp,
  TrendingDown, Edit3, History, ChevronRight, CheckCircle,
  AlertCircle, RotateCcw, ShoppingCart,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────
type Supplement = {
  id: string;
  nama_produk: string;
  harga_jual: number;
  harga_beli: number;
  stok: number;
  satuan: string;
  stok_minimum: number;
  is_active: boolean;
};

type StockHistory = {
  id: string;
  tipe: "restock" | "jual" | "koreksi_tambah" | "koreksi_kurang" | "initial";
  qty: number;
  stok_sebelum: number;
  stok_sesudah: number;
  harga_satuan: number;
  total_nilai: number;
  catatan: string | null;
  dicatat_ke_arus_kas: boolean;
  created_at: string;
};

// Disclaimer payload — dikirim ke halaman untuk diproses di level atas
type DisclaimerPayload = {
  title: string;
  message: string;
  onYes: () => void;
  onNo: () => void;
};

// ── Toast ──────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className="fixed top-5 right-5 z-[500] flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium shadow-2xl animate-fade-in-up"
      style={{
        background: type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
        border: `1px solid ${type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        color: type === "success" ? "#22c55e" : "#ef4444",
        backdropFilter: "blur(12px)",
      }}
    >
      {type === "success"
        ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  );
}

// ── Disclaimer Modal — z-index 400, di atas semua modal ───────────
function DisclaimerModal({ payload, loading }: { payload: DisclaimerPayload; loading: boolean }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 400, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl animate-fade-in-up"
        style={{
          background: "var(--color-dark-600)",
          border: "1px solid var(--color-border-default)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.1)" }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: "#f59e0b" }} />
            </div>
            <h3 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
              {payload.title}
            </h3>
          </div>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {payload.message}
          </p>
          <div className="flex gap-3">
            <button
              onClick={payload.onNo}
              disabled={loading}
              className="btn-ghost flex-1 justify-center"
            >
              Tidak
            </button>
            <button
              onClick={payload.onYes}
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ya, Catat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tipe badge helper ──────────────────────────────────────────────
function TipeBadge({ tipe }: { tipe: StockHistory["tipe"] }) {
  const config: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    initial:        { label: "Stok Awal",  color: "#a855f7", bg: "rgba(168,85,247,0.1)", icon: <Package className="w-3 h-3" /> },
    restock:        { label: "Restock",    color: "#22c55e", bg: "rgba(34,197,94,0.1)",  icon: <TrendingUp className="w-3 h-3" /> },
    jual:           { label: "Terjual",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: <ShoppingCart className="w-3 h-3" /> },
    koreksi_tambah: { label: "+Koreksi",   color: "#22c55e", bg: "rgba(34,197,94,0.1)",  icon: <Plus className="w-3 h-3" /> },
    koreksi_kurang: { label: "−Koreksi",   color: "#ef4444", bg: "rgba(239,68,68,0.1)",  icon: <Minus className="w-3 h-3" /> },
  };
  const c = config[tipe] ?? config.initial;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
      style={{ background: c.bg, color: c.color }}
    >
      {c.icon}{c.label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
export default function AdminSuplemenPage() {
  const [suplemen, setSuplemen] = useState<Supplement[]>([]);
  const [inactiveSuplemen, setInactiveSuplemen] = useState<Supplement[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingInactive, setLoadingInactive] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState<Supplement | null>(null);
  const [sellModal, setSellModal] = useState<Supplement | null>(null);
  const [restockModal, setRestockModal] = useState<Supplement | null>(null);
  const [stockEditModal, setStockEditModal] = useState<Supplement | null>(null);
  const [historyModal, setHistoryModal] = useState<Supplement | null>(null);

  // Disclaimer — dikelola di halaman agar z-index di atas semua modal
  const [disclaimer, setDisclaimer] = useState<DisclaimerPayload | null>(null);
  const [disclaimerLoading, setDisclaimerLoading] = useState(false);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openDisclaimer = (payload: DisclaimerPayload) => setDisclaimer(payload);
  const closeDisclaimer = () => { setDisclaimer(null); setDisclaimerLoading(false); };

  const fetchSuplemen = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/suplemen");
      const json = await res.json();
      if (res.ok) setSuplemen(json.supplements ?? []);
      else showToast(json.error ?? "Gagal memuat data.", "error");
    } catch { showToast("Gagal memuat data.", "error"); }
    setLoading(false);
  }, []);

  const fetchInactive = useCallback(async () => {
    setLoadingInactive(true);
    try {
      const res = await fetch("/api/admin/suplemen?inactive=true");
      const json = await res.json();
      if (res.ok) setInactiveSuplemen(json.supplements ?? []);
    } catch { /* ignore */ }
    setLoadingInactive(false);
  }, []);

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch("/api/admin/suplemen", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, restore: true }),
      });
      if (res.ok) {
        showToast("Suplemen berhasil diaktifkan kembali! ✅");
        fetchSuplemen();
        fetchInactive();
      } else {
        const json = await res.json();
        showToast(json.error ?? "Gagal mengaktifkan.", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan.", "error");
    }
  };

  useEffect(() => { fetchSuplemen(); }, [fetchSuplemen]);

  const lowStock = suplemen.filter((s) => s.stok <= s.stok_minimum);

  return (
    <div className="max-w-5xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Disclaimer Modal — di-render di page level, z-index 400 (di atas semua) */}
      {disclaimer && (
        <DisclaimerModal
          payload={disclaimer}
          loading={disclaimerLoading}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>SUPLEMEN</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Kelola stok dan penjualan suplemen gym</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowInactive(!showInactive); if (!showInactive) fetchInactive(); }}
            className="btn-ghost"
            style={{ fontSize: "0.8125rem" }}
          >
            {showInactive ? <Package className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
            {showInactive ? "Sembunyikan Nonaktif" : "Lihat Nonaktif"}
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" id="add-suplemen-btn">
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
          <span style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "#f59e0b" }}>{lowStock.length} produk</strong> stok menipis:{" "}
            {lowStock.map(s => s.nama_produk).join(", ")}
          </span>
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "var(--color-brand-orange)" }} />
        </div>
      ) : suplemen.length === 0 ? (
        <div className="card text-center py-12">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--color-text-muted)" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Belum ada produk suplemen. Tambahkan produk pertama!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suplemen.map((s) => {
            const isLow = s.stok <= s.stok_minimum;
            return (
              <div key={s.id} className="card flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isLow ? "rgba(245,158,11,0.1)" : "rgba(255,107,44,0.1)" }}>
                    <Package className="w-5 h-5" style={{ color: isLow ? "#f59e0b" : "var(--color-brand-orange)" }} />
                  </div>
                  {isLow && <span className="badge badge-warning"><AlertTriangle className="w-3 h-3" /> Stok Tipis</span>}
                </div>

                {/* Product info */}
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>{s.nama_produk}</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--color-text-muted)" }}>Harga Jual</span>
                      <strong style={{ color: "var(--color-brand-orange)" }}>{formatRupiah(s.harga_jual)}</strong>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--color-text-muted)" }}>Harga Beli</span>
                      <span style={{ color: "var(--color-text-secondary)" }}>{formatRupiah(s.harga_beli)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span style={{ color: "var(--color-text-muted)" }}>Margin</span>
                      <span style={{ color: s.harga_jual > s.harga_beli ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                        {s.harga_beli > 0
                          ? `${Math.round(((s.harga_jual - s.harga_beli) / s.harga_beli) * 100)}%`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                    <span>Stok</span>
                    <span style={{ color: isLow ? "#f59e0b" : "var(--color-text-primary)", fontWeight: 600 }}>
                      {s.stok} {s.satuan}
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: "5px" }}>
                    <div className="progress-fill" style={{
                      width: `${Math.min(100, (s.stok / Math.max(s.stok_minimum * 3, 1)) * 100)}%`,
                      background: isLow ? "#f59e0b" : "linear-gradient(90deg,#ff6b2c,#ffb347)",
                    }} />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button id={`sell-${s.id}`} onClick={() => setSellModal(s)}
                    className="btn-danger justify-center py-2 text-xs">
                    <Minus className="w-3 h-3" /> Jual
                  </button>
                  <button id={`restock-${s.id}`} onClick={() => setRestockModal(s)}
                    className="btn-success justify-center py-2 text-xs">
                    <TrendingUp className="w-3 h-3" /> Restock
                  </button>
                  <button id={`edit-stok-${s.id}`} onClick={() => setStockEditModal(s)}
                    className="btn-ghost justify-center py-2 text-xs">
                    <RotateCcw className="w-3 h-3" /> Edit Stok
                  </button>
                  <button id={`edit-produk-${s.id}`} onClick={() => setEditModal(s)}
                    className="btn-ghost justify-center py-2 text-xs">
                    <Edit3 className="w-3 h-3" /> Edit Produk
                  </button>
                </div>

                {/* History button */}
                <button onClick={() => setHistoryModal(s)}
                  className="flex items-center justify-between w-full text-xs py-2 px-3 rounded-xl transition-colors"
                  style={{ background: "var(--color-dark-700)", color: "var(--color-text-muted)" }}>
                  <span className="flex items-center gap-1.5"><History className="w-3 h-3" /> Riwayat Stok</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Inactive Supplements Section */}
      {showInactive && (
        <div className="mt-8">
          <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-muted)" }}>
            Produk Nonaktif ({inactiveSuplemen.length})
          </h2>
          {loadingInactive ? (
            <div className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: "var(--color-brand-orange)" }} /></div>
          ) : inactiveSuplemen.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Tidak ada produk yang dinonaktifkan.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inactiveSuplemen.map((s) => (
                <div key={s.id} className="card flex flex-col gap-3 opacity-60">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(120,120,120,0.1)" }}>
                      <Package className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} />
                    </div>
                    <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>Nonaktif</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>{s.nama_produk}</h3>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Harga Jual: {formatRupiah(s.harga_jual)}</p>
                  </div>
                  <button
                    onClick={() => handleRestore(s.id)}
                    className="btn-primary justify-center py-2 text-xs"
                  >
                    <RotateCcw className="w-3 h-3" /> Aktifkan Kembali
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals — semua menerima openDisclaimer dari page */}
      {showAddModal && (
        <AddSuplemenModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { fetchSuplemen(); showToast("Produk berhasil ditambahkan! ✅"); }}
          onError={(msg) => showToast(msg, "error")}
          openDisclaimer={openDisclaimer}
          closeDisclaimer={closeDisclaimer}
          setDisclaimerLoading={setDisclaimerLoading}
        />
      )}
      {editModal && (
        <EditSuplemenModal
          suplemen={editModal}
          onClose={() => setEditModal(null)}
          onSuccess={() => { fetchSuplemen(); showToast("Produk berhasil diperbarui! ✅"); }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
      {sellModal && (
        <SellModal
          suplemen={sellModal}
          onClose={() => setSellModal(null)}
          onSuccess={() => { fetchSuplemen(); showToast("Penjualan berhasil dicatat! ✅"); }}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
      {restockModal && (
        <RestockModal
          suplemen={restockModal}
          onClose={() => setRestockModal(null)}
          onSuccess={() => { fetchSuplemen(); showToast("Restock berhasil dicatat! ✅"); }}
          onError={(msg) => showToast(msg, "error")}
          openDisclaimer={openDisclaimer}
          closeDisclaimer={closeDisclaimer}
          setDisclaimerLoading={setDisclaimerLoading}
        />
      )}
      {stockEditModal && (
        <StockEditModal
          suplemen={stockEditModal}
          onClose={() => setStockEditModal(null)}
          onSuccess={() => { fetchSuplemen(); showToast("Stok berhasil diperbarui! ✅"); }}
          onError={(msg) => showToast(msg, "error")}
          openDisclaimer={openDisclaimer}
          closeDisclaimer={closeDisclaimer}
          setDisclaimerLoading={setDisclaimerLoading}
        />
      )}
      {historyModal && (
        <HistoryModal suplemen={historyModal} onClose={() => setHistoryModal(null)} />
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL: Tambah Produk Baru
// ══════════════════════════════════════════════════════════════════
function AddSuplemenModal({
  onClose, onSuccess, onError, openDisclaimer, closeDisclaimer, setDisclaimerLoading,
}: {
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
  openDisclaimer: (p: DisclaimerPayload) => void;
  closeDisclaimer: () => void;
  setDisclaimerLoading: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    nama_produk: "", harga_jual: "", harga_beli: "", stok: "0", satuan: "pcs", stok_minimum: "5",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const doSave = async (catatArusKas: boolean) => {
    setDisclaimerLoading(true);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/suplemen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, catat_arus_kas: catatArusKas }),
      });
      const json = await res.json();
      if (!res.ok) {
        onError(json.error || "Gagal menyimpan produk.");
        closeDisclaimer();
        setSaving(false);
        return;
      }
      closeDisclaimer();
      onSuccess();
      onClose();
    } catch {
      onError("Terjadi kesalahan jaringan.");
      closeDisclaimer();
    }
    setSaving(false);
    setDisclaimerLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hargaBeli = Number(form.harga_beli);
    const hargaJual = Number(form.harga_jual);
    const stok = Number(form.stok);

    if (!form.nama_produk.trim()) return setError("Nama produk wajib diisi.");
    if (!form.harga_beli || hargaBeli <= 0) return setError("Harga beli harus lebih dari 0.");
    if (!form.harga_jual || hargaJual <= 0) return setError("Harga jual harus lebih dari 0.");
    if (stok < 0) return setError("Stok tidak boleh negatif.");

    setError("");

    const totalModal = hargaBeli * stok;

    openDisclaimer({
      title: "Catat ke Arus Kas?",
      message: stok > 0
        ? `Total modal awal "${form.nama_produk}": ${formatRupiah(totalModal)} (${stok} ${form.satuan} × ${formatRupiah(hargaBeli)}). Apakah pengeluaran ini ingin dicatat di arus kas?`
        : `Produk "${form.nama_produk}" ditambahkan tanpa stok awal. Apakah ingin mencatat pengeluaran di arus kas?`,
      onYes: () => doSave(true),
      onNo: () => doSave(false),
    });
  };

  const totalModal = Number(form.harga_beli) * Number(form.stok);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Tambah Produk Suplemen</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Produk</label>
            <input
              id="new-supp-nama"
              type="text"
              className="input"
              placeholder="Contoh: Whey Protein Gold Standard"
              value={form.nama_produk}
              onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Harga Beli (Rp)</label>
              <input
                id="new-supp-harga-beli"
                type="number"
                className="input"
                min={0}
                placeholder="0"
                value={form.harga_beli}
                onChange={(e) => setForm({ ...form, harga_beli: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="input-label">Harga Jual (Rp)</label>
              <input
                id="new-supp-harga-jual"
                type="number"
                className="input"
                min={1}
                placeholder="0"
                value={form.harga_jual}
                onChange={(e) => setForm({ ...form, harga_jual: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Stok Awal</label>
              <input
                id="new-supp-stok"
                type="number"
                className="input"
                min={0}
                placeholder="0"
                value={form.stok}
                onChange={(e) => setForm({ ...form, stok: e.target.value })}
              />
            </div>
            <div>
              <label className="input-label">Satuan</label>
              <input
                id="new-supp-satuan"
                type="text"
                className="input"
                placeholder="pcs"
                value={form.satuan}
                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="input-label">Stok Minimum (Alert)</label>
            <input
              id="new-supp-stok-min"
              type="number"
              className="input"
              min={0}
              value={form.stok_minimum}
              onChange={(e) => setForm({ ...form, stok_minimum: e.target.value })}
            />
          </div>

          {/* Preview kalkulasi */}
          {Number(form.harga_beli) > 0 && Number(form.harga_jual) > 0 && (
            <div className="p-3 rounded-xl text-xs space-y-1.5"
              style={{ background: "var(--color-dark-700)", border: "1px solid var(--color-border-default)" }}>
              {Number(form.stok) > 0 && (
                <div className="flex justify-between">
                  <span style={{ color: "var(--color-text-muted)" }}>Total Modal Awal</span>
                  <strong style={{ color: "var(--color-brand-orange)" }}>{formatRupiah(totalModal)}</strong>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Margin per unit</span>
                <strong style={{ color: Number(form.harga_jual) > Number(form.harga_beli) ? "#22c55e" : "#ef4444" }}>
                  {formatRupiah(Number(form.harga_jual) - Number(form.harga_beli))}{" "}
                  ({Number(form.harga_beli) > 0
                    ? `${Math.round(((Number(form.harga_jual) - Number(form.harga_beli)) / Number(form.harga_beli)) * 100)}%`
                    : "—"})
                </strong>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
            <button
              id="add-suplemen-submit"
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Simpan Produk</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL: Edit Produk
// ══════════════════════════════════════════════════════════════════
function EditSuplemenModal({ suplemen, onClose, onSuccess, onError }: {
  suplemen: Supplement; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void;
}) {
  const [form, setForm] = useState({
    nama_produk: suplemen.nama_produk,
    harga_jual: String(suplemen.harga_jual),
    harga_beli: String(suplemen.harga_beli),
    satuan: suplemen.satuan,
    stok_minimum: String(suplemen.stok_minimum),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama_produk.trim()) return setError("Nama produk wajib.");
    if (Number(form.harga_beli) <= 0) return setError("Harga beli harus > 0.");
    if (Number(form.harga_jual) <= 0) return setError("Harga jual harus > 0.");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/suplemen", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: suplemen.id, ...form }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan."); setSaving(false); return; }
      onSuccess(); onClose();
    } catch { onError("Terjadi kesalahan jaringan."); }
    setSaving(false);
  };

  const margin = Number(form.harga_jual) - Number(form.harga_beli);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Edit Produk</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{suplemen.nama_produk}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm mb-4"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Nama Produk</label>
            <input type="text" className="input" required
              value={form.nama_produk} onChange={(e) => setForm({ ...form, nama_produk: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Harga Beli (Rp)</label>
              <input type="number" className="input" required min={0}
                value={form.harga_beli} onChange={(e) => setForm({ ...form, harga_beli: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Harga Jual (Rp)</label>
              <input type="number" className="input" required min={1}
                value={form.harga_jual} onChange={(e) => setForm({ ...form, harga_jual: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Satuan</label>
              <input type="text" className="input" required
                value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} />
            </div>
            <div>
              <label className="input-label">Stok Minimum</label>
              <input type="number" className="input" min={0}
                value={form.stok_minimum} onChange={(e) => setForm({ ...form, stok_minimum: e.target.value })} />
            </div>
          </div>

          {Number(form.harga_beli) > 0 && (
            <div className="p-3 rounded-xl text-xs"
              style={{ background: "var(--color-dark-700)", border: "1px solid var(--color-border-default)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Margin per unit</span>
                <strong style={{ color: margin > 0 ? "#22c55e" : "#ef4444" }}>
                  {formatRupiah(margin)} ({Number(form.harga_beli) > 0
                    ? `${Math.round((margin / Number(form.harga_beli)) * 100)}%` : "—"})
                </strong>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Edit3 className="w-4 h-4" /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL: Jual
// ══════════════════════════════════════════════════════════════════
function SellModal({ suplemen, onClose, onSuccess, onError }: {
  suplemen: Supplement; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void;
}) {
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSell = async () => {
    if (qty <= 0) return onError("Jumlah harus lebih dari 0.");
    if (qty > suplemen.stok) return onError("Stok tidak mencukupi!");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/suplemen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "jual", id: suplemen.id, qty, catatan }),
      });
      const json = await res.json();
      if (!res.ok) { onError(json.error || "Gagal mencatat penjualan."); setSaving(false); return; }
      onSuccess(); onClose();
    } catch { onError("Terjadi kesalahan jaringan."); }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Catat Penjualan</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm mb-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>{suplemen.nama_produk}</p>

        <div className="space-y-4">
          <div>
            <label className="input-label">Jumlah Terjual</label>
            <input type="number" className="input" min={1} max={suplemen.stok} value={qty}
              onChange={(e) => setQty(Number(e.target.value))} />
          </div>
          <div>
            <label className="input-label">Catatan (Opsional)</label>
            <input type="text" className="input" placeholder="Nama pembeli, dll" value={catatan}
              onChange={(e) => setCatatan(e.target.value)} />
          </div>
          <div className="p-3 rounded-xl space-y-2" style={{ background: "var(--color-dark-700)" }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--color-text-muted)" }}>Total Penjualan</span>
              <span className="font-bold" style={{ color: "var(--color-status-active)" }}>{formatRupiah(qty * suplemen.harga_jual)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--color-text-muted)" }}>Keuntungan</span>
              <span className="font-semibold" style={{ color: "#22c55e" }}>
                {formatRupiah(qty * (suplemen.harga_jual - suplemen.harga_beli))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "var(--color-text-muted)" }}>Sisa stok</span>
              <span style={{ color: "var(--color-text-primary)" }}>{suplemen.stok - qty} {suplemen.satuan}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
          <button id="confirm-sell-btn" onClick={handleSell} disabled={saving} className="btn-danger flex-1 justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingDown className="w-4 h-4" /> Konfirmasi Jual</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL: Restock
// ══════════════════════════════════════════════════════════════════
function RestockModal({
  suplemen, onClose, onSuccess, onError, openDisclaimer, closeDisclaimer, setDisclaimerLoading,
}: {
  suplemen: Supplement; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void;
  openDisclaimer: (p: DisclaimerPayload) => void;
  closeDisclaimer: () => void;
  setDisclaimerLoading: (v: boolean) => void;
}) {
  const [qty, setQty] = useState(10);
  const [hargaBeli, setHargaBeli] = useState(String(suplemen.harga_beli || ""));
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const doRestock = async (catatArusKas: boolean) => {
    setDisclaimerLoading(true);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/suplemen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "restock", id: suplemen.id,
          qty, harga_beli: Number(hargaBeli), catatan, catat_arus_kas: catatArusKas,
        }),
      });
      const json = await res.json();
      if (!res.ok) { onError(json.error || "Gagal restock."); closeDisclaimer(); setSaving(false); return; }
      closeDisclaimer();
      onSuccess(); onClose();
    } catch { onError("Terjadi kesalahan jaringan."); closeDisclaimer(); }
    setSaving(false); setDisclaimerLoading(false);
  };

  const handleProceed = () => {
    if (qty <= 0) return onError("Jumlah harus > 0.");
    const totalModal = Number(hargaBeli) * qty;
    openDisclaimer({
      title: "Catat ke Arus Kas?",
      message: `Restock ${suplemen.nama_produk}: ${qty} ${suplemen.satuan} × ${formatRupiah(Number(hargaBeli))} = ${formatRupiah(totalModal)}. Apakah pengeluaran restock ini ingin dicatat di arus kas?`,
      onYes: () => doRestock(true),
      onNo: () => doRestock(false),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Restock Suplemen</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm mb-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>{suplemen.nama_produk}</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Jumlah Masuk</label>
              <input type="number" className="input" min={1} value={qty}
                onChange={(e) => setQty(Number(e.target.value))} />
            </div>
            <div>
              <label className="input-label">Harga Beli/unit (Rp)</label>
              <input type="number" className="input" min={0} value={hargaBeli}
                onChange={(e) => setHargaBeli(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="input-label">Catatan (Opsional)</label>
            <input type="text" className="input" placeholder="Supplier, dll" value={catatan}
              onChange={(e) => setCatatan(e.target.value)} />
          </div>
          {Number(hargaBeli) > 0 && (
            <div className="p-3 rounded-xl text-sm" style={{ background: "var(--color-dark-700)" }}>
              <div className="flex justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Total Modal Restock</span>
                <strong style={{ color: "var(--color-brand-orange)" }}>{formatRupiah(Number(hargaBeli) * qty)}</strong>
              </div>
              <div className="flex justify-between mt-1">
                <span style={{ color: "var(--color-text-muted)" }}>Stok setelah restock</span>
                <span style={{ color: "var(--color-text-primary)" }}>{suplemen.stok + qty} {suplemen.satuan}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
          <button id="confirm-restock-btn" onClick={handleProceed} disabled={saving} className="btn-success flex-1 justify-center">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><TrendingUp className="w-4 h-4" /> Lanjut</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL: Edit Stok (Koreksi)
// ══════════════════════════════════════════════════════════════════
function StockEditModal({
  suplemen, onClose, onSuccess, onError, openDisclaimer, closeDisclaimer, setDisclaimerLoading,
}: {
  suplemen: Supplement; onClose: () => void; onSuccess: () => void; onError: (msg: string) => void;
  openDisclaimer: (p: DisclaimerPayload) => void;
  closeDisclaimer: () => void;
  setDisclaimerLoading: (v: boolean) => void;
}) {
  const [stokBaru, setStokBaru] = useState(String(suplemen.stok));
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);

  const selisih = Number(stokBaru) - suplemen.stok;
  const isKurang = selisih < 0;
  const isTambah = selisih > 0;
  const totalNilai = suplemen.harga_beli * Math.abs(selisih);

  const doKoreksi = async (catatArusKas: boolean) => {
    setDisclaimerLoading(true);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/suplemen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "koreksi", id: suplemen.id,
          stok_baru: Number(stokBaru), catatan, catat_arus_kas: catatArusKas,
        }),
      });
      const json = await res.json();
      if (!res.ok) { onError(json.error || "Gagal memperbarui stok."); closeDisclaimer(); setSaving(false); return; }
      closeDisclaimer();
      onSuccess(); onClose();
    } catch { onError("Terjadi kesalahan jaringan."); closeDisclaimer(); }
    setSaving(false); setDisclaimerLoading(false);
  };

  const handleProceed = () => {
    const stokBaruNum = Number(stokBaru);
    if (isNaN(stokBaruNum) || stokBaruNum < 0) return onError("Stok tidak valid.");
    if (selisih === 0) return onError("Stok tidak berubah.");
    if (isKurang && !catatan.trim()) return onError("Catatan wajib diisi saat mengurangi stok.");

    openDisclaimer({
      title: isKurang ? "Catat sebagai Kerugian?" : "Catat ke Arus Kas?",
      message: isKurang
        ? `Stok berkurang ${Math.abs(selisih)} ${suplemen.satuan} senilai ${formatRupiah(totalNilai)} (${Math.abs(selisih)} × ${formatRupiah(suplemen.harga_beli)}). Catat sebagai kerugian di arus kas?`
        : `Stok bertambah ${selisih} ${suplemen.satuan} senilai ${formatRupiah(totalNilai)}. Catat sebagai pengeluaran modal di arus kas?`,
      onYes: () => doKoreksi(true),
      onNo: () => doKoreksi(false),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Edit Stok</h2>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm mb-4 font-medium" style={{ color: "var(--color-text-secondary)" }}>{suplemen.nama_produk}</p>

        <div className="space-y-4">
          {/* Current vs new preview */}
          <div className="p-3 rounded-xl flex items-center justify-between"
            style={{ background: "var(--color-dark-700)" }}>
            <div className="text-center flex-1">
              <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Sekarang</div>
              <div className="font-bebas text-2xl" style={{ color: "var(--color-text-primary)" }}>{suplemen.stok}</div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{suplemen.satuan}</div>
            </div>
            <ChevronRight className="w-5 h-5 mx-2" style={{ color: "var(--color-text-muted)" }} />
            <div className="text-center flex-1">
              <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Stok Baru</div>
              <div className="font-bebas text-2xl" style={{
                color: isKurang ? "#ef4444" : isTambah ? "#22c55e" : "var(--color-text-primary)"
              }}>
                {stokBaru === "" ? "?" : Number(stokBaru)}
              </div>
              <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{suplemen.satuan}</div>
            </div>
            {selisih !== 0 && (
              <>
                <ChevronRight className="w-5 h-5 mx-2" style={{ color: "var(--color-text-muted)" }} />
                <div className="text-center flex-1">
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Selisih</div>
                  <div className="font-bold text-lg" style={{ color: isKurang ? "#ef4444" : "#22c55e" }}>
                    {selisih > 0 ? "+" : ""}{selisih}
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="input-label">Stok Baru</label>
            <input
              type="number"
              className="input"
              min={0}
              value={stokBaru}
              onChange={(e) => setStokBaru(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">
              Catatan{" "}
              {isKurang && <span style={{ color: "#ef4444" }}>*Wajib</span>}
              {!isKurang && <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(opsional)</span>}
            </label>
            <input
              type="text"
              className="input"
              placeholder={isKurang ? "Wajib: alasan stok berkurang..." : "Alasan perubahan stok (opsional)"}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              style={isKurang && !catatan ? { borderColor: "rgba(239,68,68,0.4)" } : {}}
            />
            {isKurang && !catatan && (
              <p className="text-xs mt-1" style={{ color: "#ef4444" }}>
                Catatan wajib diisi saat mengurangi stok
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Batal</button>
          <button
            onClick={handleProceed}
            disabled={saving || selisih === 0}
            className="btn-primary flex-1 justify-center"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><RotateCcw className="w-4 h-4" /> Lanjut</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MODAL: Riwayat Stok
// ══════════════════════════════════════════════════════════════════
function HistoryModal({ suplemen, onClose }: { suplemen: Supplement; onClose: () => void }) {
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/suplemen?id=${suplemen.id}`);
        const json = await res.json();
        if (res.ok) setHistory(json.history ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    };
    fetchHistory();
  }, [suplemen.id]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: "36rem" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>Riwayat Stok</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{suplemen.nama_produk}</p>
          </div>
          <button onClick={onClose} style={{ color: "var(--color-text-muted)" }}><X className="w-5 h-5" /></button>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: "var(--color-brand-orange)" }} />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-10">
            <History className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada riwayat stok</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {history.map((h) => (
              <div key={h.id} className="p-3 rounded-xl"
                style={{ background: "var(--color-dark-700)", border: "1px solid var(--color-border-default)" }}>
                <div className="flex items-center justify-between mb-2">
                  <TipeBadge tipe={h.tipe} />
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {formatDate(h.created_at.split("T")[0], { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                  <div>
                    <div style={{ color: "var(--color-text-muted)" }}>Sebelum</div>
                    <div className="font-semibold" style={{ color: "var(--color-text-secondary)" }}>{h.stok_sebelum}</div>
                  </div>
                  <div className="text-center">
                    <div style={{ color: "var(--color-text-muted)" }}>Perubahan</div>
                    <div className="font-bold" style={{ color: h.qty >= 0 ? "#22c55e" : "#ef4444" }}>
                      {h.qty >= 0 ? "+" : ""}{h.qty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ color: "var(--color-text-muted)" }}>Sesudah</div>
                    <div className="font-semibold" style={{ color: "var(--color-text-primary)" }}>{h.stok_sesudah}</div>
                  </div>
                </div>
                {h.total_nilai > 0 && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--color-text-muted)" }}>Nilai</span>
                    <span style={{ color: "var(--color-brand-orange)" }}>{formatRupiah(h.total_nilai)}</span>
                  </div>
                )}
                {h.catatan && (
                  <p className="text-xs mt-1.5 italic" style={{ color: "var(--color-text-muted)" }}>{h.catatan}</p>
                )}
                {h.dicatat_ke_arus_kas && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <CheckCircle className="w-3 h-3" style={{ color: "#22c55e" }} />
                    <span className="text-xs" style={{ color: "#22c55e" }}>Dicatat di arus kas</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
