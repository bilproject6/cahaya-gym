"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { formatDate, formatRupiah } from "@/lib/utils";
import { UserCheck, Plus, Loader2, X, AlertCircle, Trash2, CheckCircle } from "lucide-react";

type Visitor = {
  id: string;
  nama: string | null;
  jumlah_bayar: number;
  tanggal: string;
  catatan: string | null;
};

// ── Toast ──
function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className="fixed top-5 right-5 z-[70] flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-medium shadow-2xl animate-fade-in-up"
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

// ── Custom Confirm Modal ──
function ConfirmModal({
  message, onConfirm, onCancel
}: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl animate-fade-in-up"
        style={{
          background: "var(--color-dark-600)",
          border: "1px solid var(--color-border-default)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            <Trash2 className="w-7 h-7" style={{ color: "#ef4444" }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>Hapus Data</h3>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{message}</p>
        </div>
        <div className="flex gap-3 p-5 pt-2">
          <button onClick={onCancel} className="btn-ghost flex-1 justify-center">Batal</button>
          <button onClick={onConfirm} className="btn-danger flex-1 justify-center">Ya, Hapus</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminNonMemberPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const today = useRef(new Date().toISOString().split("T")[0]).current;

  const [form, setForm] = useState({
    nama: "",
    jumlah_bayar: 10000,
    tanggal: today,
    catatan: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch via API route (bypass RLS)
  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/non-member?limit=50");
      const json = await res.json();
      if (res.ok) setVisitors(json.visitors ?? []);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchVisitors(); }, [fetchVisitors]);

  const todayVisitors = visitors.filter((v) => v.tanggal === today);
  const todayTotal = todayVisitors.reduce((s, v) => s + v.jumlah_bayar, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/non-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Gagal menyimpan. Coba lagi.");
      } else {
        setForm({ nama: "", jumlah_bayar: 10000, tanggal: today, catatan: "" });
        showToast("Kunjungan berhasil dicatat! ✅");
        await fetchVisitors();
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setConfirmId(null);
    try {
      const res = await fetch("/api/admin/non-member", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        showToast("Data kunjungan dihapus.");
        await fetchVisitors();
      } else {
        showToast("Gagal menghapus.", "error");
      }
    } catch {
      showToast("Gagal menghapus.", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      {confirmId && (
        <ConfirmModal
          message="Yakin hapus data kunjungan ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={() => handleDelete(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          NON-MEMBER HARIAN
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Catat kunjungan pengunjung harian yang tidak berlangganan
        </p>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card-stat">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--color-text-muted)" }}>
              Pengunjung Hari Ini
            </span>
          </div>
          <div className="font-bebas text-3xl" style={{ color: "var(--color-text-primary)" }}>
            {todayVisitors.length}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>orang</div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4 h-4" style={{ color: "var(--color-status-active)" }} />
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--color-text-muted)" }}>
              Total Pemasukan Hari Ini
            </span>
          </div>
          <div className="font-bebas text-3xl" style={{ color: "var(--color-status-active)" }}>
            {formatRupiah(todayTotal)}
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>dari non-member</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Catat Kunjungan Baru
          </h2>

          {/* Info: otomatis masuk arus kas */}
          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs"
            style={{
              background: "rgba(34,197,94,0.06)",
              border: "1px solid rgba(34,197,94,0.15)",
              color: "var(--color-status-active)",
            }}
          >
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Pembayaran ini <strong>otomatis tercatat</strong> di Arus Kas sebagai pemasukan harian.</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="input-label">
                Nama Pengunjung <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(opsional)</span>
              </label>
              <input
                id="visitor-nama"
                type="text"
                className="input"
                placeholder="Anonim jika tidak diketahui"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </div>

            <div>
              <label className="input-label">Jumlah Bayar (Rp)</label>
              <input
                id="visitor-bayar"
                type="number"
                className="input"
                min={1000}
                step={1000}
                value={form.jumlah_bayar}
                onChange={(e) => setForm({ ...form, jumlah_bayar: Number(e.target.value) })}
                required
              />
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Default Rp10.000 / pengunjung</p>
            </div>

            <div>
              <label className="input-label">Tanggal</label>
              <input
                id="visitor-tanggal"
                type="date"
                className="input"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="input-label">
                Catatan <span style={{ color: "var(--color-text-muted)", fontWeight: 400 }}>(opsional)</span>
              </label>
              <input
                id="visitor-catatan"
                type="text"
                className="input"
                placeholder="Contoh: bayar setengah, dll"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
              />
            </div>

            <button
              id="visitor-submit-btn"
              type="submit"
              disabled={saving}
              className="btn-primary w-full justify-center"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Simpan Kunjungan</>}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Riwayat Kunjungan
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: "var(--color-brand-orange)" }} />
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada kunjungan</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {visitors.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 rounded-xl group"
                  style={{ background: "var(--color-dark-700)" }}>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {v.nama ?? <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>Anonim</span>}
                    </div>
                    <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {formatDate(v.tanggal, { day: "numeric", month: "short" })}
                      {v.catatan && ` · ${v.catatan}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold" style={{ color: "var(--color-status-active)" }}>
                      {formatRupiah(v.jumlah_bayar)}
                    </span>
                    <button
                      onClick={() => setConfirmId(v.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity btn-danger p-1.5"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
