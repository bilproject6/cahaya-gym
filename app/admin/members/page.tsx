"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate, formatRupiah, daysRemaining } from "@/lib/utils";
import {
  Users, Search, CheckCircle, XCircle, Clock,
  AlertTriangle, Plus, Trash2, Loader2, X, UserCheck,
  CreditCard, Edit2, Calendar, Phone, ShieldAlert, UserPlus, Banknote,
  FileDown,
} from "lucide-react";
import { exportToExcel, fmtDate } from "@/lib/export";

type Member = {
  id: string;
  user_id: string;
  tanggal_daftar: string;
  tanggal_jatuh_tempo: string;
  status: string;
  catatan: string | null;
  profiles: { id: string; nama: string; no_hp: string; is_verified: boolean } | null;
};

type PendingProfile = {
  id: string;
  nama: string;
  no_hp: string | null;
  is_verified: boolean;
  created_at: string;
};

type FilterType = "semua" | "aktif" | "akan-habis" | "expired" | "non-aktif";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  confirmStyle?: "danger" | "success" | "primary";
  icon?: React.ReactNode;
  onConfirm: () => void;
};

type PaymentAction = {
  title: string;
  memberNama: string;
  description: string;
  onConfirm: (jumlah: number, catatan: string) => void;
};

// ════════════════════════════════════════
// STATUS BADGE
// ════════════════════════════════════════
function StatusBadge({ member }: { member: Member }) {
  if (member.status === "non-aktif" || !member.profiles?.is_verified) {
    return <span className="badge badge-pending"><Clock className="w-3 h-3" /> Belum Aktif</span>;
  }
  const days = daysRemaining(member.tanggal_jatuh_tempo);
  if (days <= 0) return <span className="badge badge-danger"><XCircle className="w-3 h-3" /> Expired</span>;
  if (days <= 3) return <span className="badge badge-warning"><AlertTriangle className="w-3 h-3" /> Habis {days}h</span>;
  if (days <= 7) return <span className="badge badge-warning"><Clock className="w-3 h-3" /> {days}h lagi</span>;
  return <span className="badge badge-active"><CheckCircle className="w-3 h-3" /> Aktif</span>;
}

// ════════════════════════════════════════
// CUSTOM CONFIRM MODAL
// ════════════════════════════════════════
function ConfirmModal({ options, onCancel }: { options: ConfirmOptions; onCancel: () => void }) {
  const btnClass =
    options.confirmStyle === "danger"
      ? "btn-danger"
      : options.confirmStyle === "success"
      ? "btn-success"
      : "btn-primary";

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
        {/* Icon Header */}
        <div className="flex flex-col items-center pt-8 pb-4 px-6 text-center">
          {options.icon && (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:
                  options.confirmStyle === "danger"
                    ? "rgba(239,68,68,0.1)"
                    : options.confirmStyle === "success"
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(255,107,44,0.1)",
                color:
                  options.confirmStyle === "danger"
                    ? "#ef4444"
                    : options.confirmStyle === "success"
                    ? "#22c55e"
                    : "var(--color-brand-orange)",
              }}
            >
              {options.icon}
            </div>
          )}
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            {options.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {options.message}
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--color-border-default)", margin: "0 1.5rem" }} />

        {/* Actions */}
        <div className="flex gap-3 p-5">
          <button onClick={onCancel} className="btn-ghost flex-1">
            Batal
          </button>
          <button
            onClick={() => { options.onConfirm(); onCancel(); }}
            className={`${btnClass} flex-1`}
          >
            {options.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// TOAST NOTIFICATION
// ════════════════════════════════════════
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
      {type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
      {msg}
    </div>
  );
}

// ════════════════════════════════════════
// PAYMENT CONFIRM MODAL
// ════════════════════════════════════════
function PaymentConfirmModal({
  action,
  onCancel,
}: {
  action: PaymentAction;
  onCancel: () => void;
}) {
  const [jumlah, setJumlah] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    const amount = Number(jumlah);
    if (!jumlah || amount <= 0) {
      setError("Jumlah pembayaran wajib diisi dan harus lebih dari 0.");
      return;
    }
    setLoading(true);
    setError("");
    await action.onConfirm(amount, catatan);
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: 200, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl animate-fade-in-up"
        style={{
          background: "var(--color-dark-600)",
          border: "1px solid var(--color-border-default)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.1)" }}
            >
              <Banknote className="w-5 h-5" style={{ color: "#22c55e" }} />
            </div>
            <div>
              <h3 className="font-bold text-base" style={{ color: "var(--color-text-primary)" }}>
                {action.title}
              </h3>
              <p className="text-xs" style={{ color: "var(--color-brand-orange)" }}>
                {action.memberNama}
              </p>
            </div>
          </div>
          <p className="text-sm mt-3 leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
            {action.description}
          </p>
        </div>

        {/* Form */}
        <div className="px-6 pb-6 space-y-4">
          {/* Info: masuk arus kas */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-xs"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", color: "#22c55e" }}
          >
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Pembayaran ini akan otomatis tercatat di <strong>Arus Kas</strong> sebagai pemasukan.</span>
          </div>

          <div>
            <label className="input-label">
              JUMLAH BAYAR (Rp) <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              id="payment-amount-input"
              type="number"
              className="input"
              min={1}
              placeholder="Contoh: 100000"
              value={jumlah}
              onChange={(e) => { setJumlah(e.target.value); setError(""); }}
              autoFocus
            />
            {jumlah && Number(jumlah) > 0 && (
              <p className="text-xs mt-1.5 font-semibold" style={{ color: "var(--color-brand-orange)" }}>
                = {formatRupiah(Number(jumlah))}
              </p>
            )}
          </div>

          <div>
            <label className="input-label">CATATAN (opsional)</label>
            <input
              type="text"
              className="input"
              placeholder="Contoh: Bayar tunai, transfer BCA, dll"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
            >
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={onCancel} disabled={loading} className="btn-ghost flex-1 justify-center">
              Batal
            </button>
            <button
              id="confirm-payment-btn"
              onClick={handleConfirm}
              disabled={loading}
              className="btn-success flex-1 justify-center"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> Konfirmasi</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════
export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [pendingProfiles, setPendingProfiles] = useState<PendingProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("semua");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmOpts, setConfirmOpts] = useState<ConfirmOptions | null>(null);
  const [paymentAction, setPaymentAction] = useState<PaymentAction | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const askConfirm = (opts: ConfirmOptions) => setConfirmOpts(opts);

  // ── Fetch ──
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/members");
      const json = await res.json();
      if (res.ok) {
        setMembers(json.members ?? []);
        setPendingProfiles(json.pendingProfiles ?? []);
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  // ── Filter ──
  const filtered = members.filter((m) => {
    const name = m.profiles?.nama?.toLowerCase() ?? "";
    const hp = m.profiles?.no_hp ?? "";
    const matchSearch = name.includes(search.toLowerCase()) || hp.includes(search);
    if (!matchSearch) return false;
    if (filter === "semua") return true;
    if (filter === "non-aktif") return m.status === "non-aktif" || !m.profiles?.is_verified;
    if (m.status === "non-aktif" || !m.profiles?.is_verified) return false;
    const days = daysRemaining(m.tanggal_jatuh_tempo);
    if (filter === "aktif") return days > 3;
    if (filter === "akan-habis") return days > 0 && days <= 3;
    if (filter === "expired") return days <= 0;
    return true;
  });

  // ── Verify (buka PaymentModal dulu) ──
  const openVerify = (member: Member) => {
    setPaymentAction({
      title: "Konfirmasi & Aktifkan Member",
      memberNama: member.profiles?.nama || "",
      description: `Aktifkan keanggotaan selama 30 hari dari hari ini. Masukkan jumlah yang telah dibayar oleh member.`,
      onConfirm: async (jumlah, catatan) => {
        setActionLoading(member.id + "_verify");
        setPaymentAction(null);
        try {
          const res = await fetch("/api/admin/members", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify",
              memberId: member.id,
              userId: member.profiles?.id,
              memberNama: member.profiles?.nama,
              jumlah_bayar: jumlah,
              catatan_bayar: catatan,
            }),
          });
          if (res.ok) {
            showToast(`${member.profiles?.nama} berhasil diaktifkan! 🎉`);
            await fetchMembers();
          } else {
            const j = await res.json();
            showToast(j.error || "Gagal verifikasi", "error");
          }
        } catch { showToast("Gagal verifikasi", "error"); }
        setActionLoading(null);
      },
    });
  };

  // ── Extend (buka PaymentModal dulu) ──
  const openExtend = (member: Member) => {
    setPaymentAction({
      title: "Perpanjang Keanggotaan",
      memberNama: member.profiles?.nama || "",
      description: `Perpanjang keanggotaan selama 30 hari. Masukkan jumlah iuran yang telah dibayar.`,
      onConfirm: async (jumlah, catatan) => {
        setActionLoading(member.id + "_extend");
        setPaymentAction(null);
        try {
          const res = await fetch("/api/admin/members", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "extend",
              memberId: member.id,
              userId: member.profiles?.id,
              memberNama: member.profiles?.nama,
              jumlah_bayar: jumlah,
              catatan_bayar: catatan,
            }),
          });
          if (res.ok) {
            showToast(`Keanggotaan ${member.profiles?.nama} diperpanjang! ✅`);
            await fetchMembers();
          } else {
            const j = await res.json();
            showToast(j.error || "Gagal perpanjang", "error");
          }
        } catch { showToast("Gagal perpanjang", "error"); }
        setActionLoading(null);
      },
    });
  };

  // ── Activate Pending (buka PaymentModal dulu) ──
  const openActivatePending = (p: PendingProfile) => {
    setPaymentAction({
      title: "Aktifkan Member Baru",
      memberNama: p.nama,
      description: `Aktifkan keanggotaan "${p.nama}" dari pendaftaran mandiri. Masa aktif 30 hari dari hari ini. Masukkan jumlah yang telah dibayar.`,
      onConfirm: async (jumlah, catatan) => {
        setActionLoading(p.id + "_pending");
        setPaymentAction(null);
        try {
          const res = await fetch("/api/admin/members", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "activate_pending",
              userId: p.id,
              memberNama: p.nama,
              jumlah_bayar: jumlah,
              catatan_bayar: catatan,
            }),
          });
          if (res.ok) {
            showToast(`${p.nama} berhasil diaktifkan! 🎉`);
            await fetchMembers();
          } else {
            const j = await res.json();
            showToast(j.error || "Gagal aktivasi", "error");
          }
        } catch { showToast("Gagal aktivasi", "error"); }
        setActionLoading(null);
      },
    });
  };

  // ── Delete ──
  const execDelete = async (member: Member) => {
    setActionLoading(member.id + "_del");
    try {
      const res = await fetch("/api/admin/members", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id, memberNama: member.profiles?.nama, deleteUser: true }),
      });
      if (res.ok) { showToast(`${member.profiles?.nama} berhasil dihapus`); await fetchMembers(); }
      else { const j = await res.json(); showToast(j.error || "Gagal menghapus", "error"); }
    } catch { showToast("Gagal menghapus", "error"); }
    setActionLoading(null);
  };



  const filters: { key: FilterType; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "aktif", label: "Aktif" },
    { key: "akan-habis", label: "Akan Habis" },
    { key: "expired", label: "Expired" },
    { key: "non-aktif", label: "Belum Aktif" },
  ];

  const activeCount = members.filter(m => m.profiles?.is_verified && daysRemaining(m.tanggal_jatuh_tempo) > 0).length;
  const nonAktifCount = members.filter(m => m.status === "non-aktif" || !m.profiles?.is_verified).length;
  const pendingCount = pendingProfiles.length;

  const handleExport = () => {
    const rows = members.map((m) => ({
      "Nama": m.profiles?.nama || "-",
      "No HP": m.profiles?.no_hp || "-",
      "Status": m.status,
      "Terverifikasi": m.profiles?.is_verified ? "Ya" : "Tidak",
      "Tanggal Daftar": fmtDate(m.tanggal_daftar),
      "Jatuh Tempo": fmtDate(m.tanggal_jatuh_tempo),
      "Sisa Hari": daysRemaining(m.tanggal_jatuh_tempo),
      "Catatan": m.catatan || "-",
    }));
    exportToExcel(rows, "Data Member", `cahaya-gym-member-${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Confirm Modal (hapus member) */}
      {confirmOpts && <ConfirmModal options={confirmOpts} onCancel={() => setConfirmOpts(null)} />}

      {/* Payment Confirm Modal (aktivasi/perpanjang) */}
      {paymentAction && (
        <PaymentConfirmModal
          action={paymentAction}
          onCancel={() => setPaymentAction(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>KELOLA MEMBER</h1>
          <div className="flex items-center gap-3 text-sm">
            <span style={{ color: "var(--color-status-active)" }}>● {activeCount} aktif</span>
            <span style={{ color: "var(--color-text-muted)" }}>·</span>
            <span style={{ color: "#a855f7" }}>● {nonAktifCount} belum aktif</span>
            <span style={{ color: "var(--color-text-muted)" }}>·</span>
            {pendingCount > 0 && <>
              <span style={{ color: "#f59e0b" }}>● {pendingCount} daftar mandiri</span>
              <span style={{ color: "var(--color-text-muted)" }}>·</span>
            </>}
            <span style={{ color: "var(--color-text-muted)" }}>{members.length} total</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap page-header-actions">
          <button onClick={handleExport} className="btn-ghost" title="Export ke Excel">
            <FileDown className="w-4 h-4" /> Export Excel
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Member
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Cari nama atau no. HP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={filter === key ? "btn-primary py-2 px-4 text-sm" : "btn-ghost py-2 px-4 text-sm"}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="space-y-3">
        {loading ? (
          <div className="card p-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" style={{ color: "var(--color-brand-orange)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--color-text-muted)" }} />
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {search ? "Tidak ada member yang cocok" : "Belum ada data member"}
            </p>
          </div>
        ) : (
          filtered.map((member) => {
            const isNonAktif = member.status === "non-aktif" || !member.profiles?.is_verified;
            const days = daysRemaining(member.tanggal_jatuh_tempo);
            const isExpired = !isNonAktif && days <= 0;
            const borderColor = isNonAktif ? "#a855f7" : isExpired ? "#ef4444" : days <= 7 ? "#f59e0b" : "#22c55e";

            return (
              <div
                key={member.id}
                className="card cursor-pointer"
                style={{ padding: "1rem 1.25rem", borderLeft: `3px solid ${borderColor}`, transition: "all 0.2s" }}
                onClick={() => setEditMember(member)}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: `${borderColor}20`, color: borderColor }}
                      >
                        {member.profiles?.nama?.charAt(0).toUpperCase() ?? "?"}
                      </div>
                      <span className="font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                        {member.profiles?.nama || "—"}
                      </span>
                      <StatusBadge member={member} />
                    </div>
                    <div className="flex items-center gap-4 text-xs ml-11" style={{ color: "var(--color-text-muted)" }}>
                      {member.profiles?.no_hp && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{member.profiles.no_hp}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {isNonAktif ? "Belum aktif — tunggu konfirmasi admin" : `s/d ${formatDate(member.tanggal_jatuh_tempo)}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {isNonAktif ? (
                      <button
                        onClick={() => openVerify(member)}
                        disabled={actionLoading === member.id + "_verify"}
                        className="btn-success py-1.5 px-3 text-xs"
                      >
                        {actionLoading === member.id + "_verify"
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <><UserCheck className="w-3 h-3" /> Konfirmasi &amp; Aktifkan</>
                        }
                      </button>
                    ) : (
                      <button
                        onClick={() => openExtend(member)}
                        disabled={actionLoading === member.id + "_extend"}
                        className="btn-ghost py-1.5 px-3 text-xs"
                      >
                        {actionLoading === member.id + "_extend"
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <><CreditCard className="w-3 h-3" /> Perpanjang</>
                        }
                      </button>
                    )}

                    <button
                      onClick={() => askConfirm({
                        title: "Hapus Member",
                        message: `Yakin hapus "${member.profiles?.nama}"? Data member dan akun akan dihapus secara permanen dan tidak bisa dikembalikan.`,
                        confirmLabel: "Ya, Hapus",
                        confirmStyle: "danger",
                        icon: <ShieldAlert className="w-7 h-7" />,
                        onConfirm: () => execDelete(member),
                      })}
                      disabled={actionLoading === member.id + "_del"}
                      className="btn-danger py-1.5 px-3 text-xs"
                    >
                      {actionLoading === member.id + "_del"
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Trash2 className="w-3 h-3" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pending Profiles — self-registered users without member record */}
      {!loading && pendingProfiles.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: "#f59e0b" }}>
              ⚠ Pendaftaran Mandiri Menunggu Aktivasi
            </div>
            <div className="flex-1 h-px" style={{ background: "rgba(245,158,11,0.2)" }} />
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
              {pendingProfiles.length} orang
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
            User berikut mendaftar sendiri melalui halaman Register. Aktifkan setelah mereka membayar.
          </p>
          <div className="space-y-2">
            {pendingProfiles.map((p) => (
              <div key={p.id} className="card" style={{ padding: "0.875rem 1.25rem", borderLeft: "3px solid #f59e0b" }}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                      {p.nama?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>{p.nama}</div>
                      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        {p.no_hp && <span className="mr-3">{p.no_hp}</span>}
                        Daftar: {formatDate(p.created_at)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openActivatePending(p)}
                    disabled={actionLoading === p.id + "_pending"}
                    className="btn-success py-1.5 px-3 text-xs"
                  >
                    {actionLoading === p.id + "_pending"
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <><UserPlus className="w-3 h-3" /> Aktifkan</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => { fetchMembers(); setShowAddModal(false); showToast("Member baru berhasil ditambahkan! 🎉"); }}
        />
      )}

      {/* Edit Modal */}
      {editMember && (
        <EditMemberModal
          member={editMember}
          onClose={() => setEditMember(null)}
          onSuccess={() => { fetchMembers(); setEditMember(null); showToast("Data member berhasil diupdate!"); }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════
// ADD MEMBER MODAL
// ════════════════════════════════════════
function AddMemberModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [noHp, setNoHp] = useState("");
  const [password, setPassword] = useState("cahayagym123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/create-member", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, email, no_hp: noHp, password }),
    });
    const json = await res.json();
    if (!res.ok) { setError(json.error || "Gagal menambahkan member"); setLoading(false); return; }
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card w-full max-w-md animate-fade-in-up" style={{ background: "var(--color-dark-600)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-bebas text-2xl" style={{ color: "var(--color-text-primary)" }}>Tambah Member Baru</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Data akan disimpan ke Supabase</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors"><X className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">NAMA LENGKAP</label>
            <input className="input" placeholder="Nama member" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">EMAIL</label>
            <input className="input" type="email" placeholder="email@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">NO. HP</label>
            <input className="input" placeholder="08123456789" value={noHp} onChange={(e) => setNoHp(e.target.value)} />
          </div>
          <div>
            <label className="input-label">PASSWORD AWAL</label>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl text-xs" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)", color: "#a855f7" }}>
            <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>Member baru akan berstatus <strong>Belum Aktif</strong>. Klik <strong>&quot;Konfirmasi &amp; Aktifkan&quot;</strong> setelah member membayar iuran pertama.</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Tambah</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════
// EDIT MEMBER MODAL
// ════════════════════════════════════════
function EditMemberModal({ member, onClose, onSuccess }: { member: Member; onClose: () => void; onSuccess: () => void }) {
  const [nama, setNama] = useState(member.profiles?.nama || "");
  const [noHp, setNoHp] = useState(member.profiles?.no_hp || "");
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState(member.tanggal_jatuh_tempo);
  const [catatan, setCatatan] = useState(member.catatan || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isNonAktif = member.status === "non-aktif" || !member.profiles?.is_verified;
  const days = daysRemaining(member.tanggal_jatuh_tempo);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isNonAktif && tanggalJatuhTempo <= new Date().toISOString().split("T")[0]) {
      setError("Tanggal jatuh tempo harus lebih dari hari ini.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/members", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        memberId: member.id,
        userId: member.profiles?.id || member.user_id,
        nama,
        no_hp: noHp,
        tanggal_jatuh_tempo: isNonAktif ? undefined : tanggalJatuhTempo,
        catatan,
      }),
    });

    const json = await res.json();
    if (!res.ok) { setError(json.error || "Gagal update"); setLoading(false); return; }
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="card w-full max-w-md animate-fade-in-up" style={{ background: "var(--color-dark-600)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bebas text-2xl" style={{ color: "var(--color-text-primary)" }}>Edit Data Member</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>Klik kolom untuk mengedit</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 transition-colors"><X className="w-5 h-5" style={{ color: "var(--color-text-muted)" }} /></button>
        </div>

        {/* Status banner */}
        <div className="flex items-center gap-3 mb-5 p-3 rounded-xl" style={{
          background: isNonAktif ? "rgba(168,85,247,0.08)" : days <= 0 ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
          border: `1px solid ${isNonAktif ? "rgba(168,85,247,0.2)" : days <= 0 ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
        }}>
          <StatusBadge member={member} />
          {!isNonAktif && (
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              {days > 0 ? `Sisa ${days} hari · s/d ${formatDate(member.tanggal_jatuh_tempo)}` : `Expired ${formatDate(member.tanggal_jatuh_tempo)}`}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">NAMA LENGKAP</label>
            <input className="input" value={nama} onChange={(e) => setNama(e.target.value)} required />
          </div>
          <div>
            <label className="input-label">NO. HP</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
              <input className="input" style={{ paddingLeft: "2.5rem" }} value={noHp} onChange={(e) => setNoHp(e.target.value)} placeholder="08123456789" />
            </div>
          </div>

          {!isNonAktif && (
            <div>
              <label className="input-label">TANGGAL JATUH TEMPO</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input
                  type="date"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  value={tanggalJatuhTempo}
                  min={minDate}
                  onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Hanya bisa diatur ke tanggal yang lebih dari hari ini</p>
            </div>
          )}

          <div>
            <label className="input-label">CATATAN (opsional)</label>
            <textarea
              className="input"
              style={{ minHeight: "4.5rem", resize: "vertical" }}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
              <XCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Batal</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Edit2 className="w-4 h-4" /> Simpan Perubahan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
