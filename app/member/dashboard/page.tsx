import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { daysRemaining, getMemberStatus, formatDate, formatRupiah } from "@/lib/utils";
import {
  Clock,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Dumbbell,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default async function MemberDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gunakan adminClient untuk bypass RLS recursion
  const admin = createAdminClient();

  // Fetch profile
  const { data: profile } = await admin
    .from("profiles")
    .select("nama, no_hp, created_at, is_verified")
    .eq("id", user.id)
    .single();

  // Fetch member data
  const { data: member } = await admin
    .from("members")
    .select("id, tanggal_daftar, tanggal_jatuh_tempo, status")
    .eq("user_id", user.id)
    .single();

  // Fetch last 3 payments
  const { data: payments } = await admin
    .from("payments")
    .select("id, bulan_dibayar, jumlah, tanggal_bayar")
    .eq("member_id", member?.id ?? "")
    .order("tanggal_bayar", { ascending: false })
    .limit(3);

  const days = member ? daysRemaining(member.tanggal_jatuh_tempo) : 0;
  // Bug fix: pass member.status so non-aktif is handled correctly
  const status = member ? getMemberStatus(member.tanggal_jatuh_tempo, member.status) : "expired";
  const isNonAktif = status === "non-aktif" || (member && !profile?.is_verified);
  const totalDays = 30;
  const progressPercent = (member && !isNonAktif)
    ? Math.max(0, Math.min(100, (days / totalDays) * 100))
    : 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          DASHBOARD MEMBER
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
          Selamat datang, <strong style={{ color: "var(--color-text-primary)" }}>{profile?.nama}</strong>!
          Pantau keanggotaan kamu di sini.
        </p>
      </div>

      {/* Bug Fix 9: Tampilkan warning jika member belum diverifikasi/non-aktif */}
      {(!member || isNonAktif) ? (
        <div
          className="card text-center py-12 mb-6"
          style={{ borderColor: "rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.04)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(168,85,247,0.1)" }}
          >
            <Clock className="w-8 h-8" style={{ color: "#a855f7" }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Menunggu Konfirmasi Admin
          </h3>
          <p className="text-sm mb-3 max-w-sm mx-auto" style={{ color: "var(--color-text-secondary)" }}>
            Akun kamu sudah terdaftar. Admin akan mengaktifkan keanggotaan setelah pembayaran dikonfirmasi.
          </p>
          <p className="text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
            Hubungi admin jika sudah membayar dan belum diaktifkan.
          </p>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_ADMIN_WHATSAPP ?? "6281234567890"}?text=Halo%20admin%2C%20nama%20saya%20${encodeURIComponent(profile?.nama ?? "Member")}%20sudah%20daftar%20dan%20ingin%20mengaktifkan%20keanggotaan`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex"
          >
            Hubungi Admin via WhatsApp
          </a>
        </div>
      ) : (
        <>
          {/* ── Membership Status Card ── */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 mb-6"
            style={{
              background:
                status === "expired"
                  ? "rgba(239,68,68,0.06)"
                  : status === "akan-habis"
                  ? "rgba(245,158,11,0.06)"
                  : "rgba(255,107,44,0.06)",
              border:
                status === "expired"
                  ? "1px solid rgba(239,68,68,0.2)"
                  : status === "akan-habis"
                  ? "1px solid rgba(245,158,11,0.2)"
                  : "1px solid rgba(255,107,44,0.2)",
            }}
          >
            {/* Glow bg */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
              style={{
                background:
                  status === "expired"
                    ? "#ef4444"
                    : status === "akan-habis"
                    ? "#f59e0b"
                    : "var(--color-brand-orange)",
              }}
            />

            <div className="relative">
              <div className="flex items-start justify-between mb-5 gap-4 flex-wrap">
                <div>
                  <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--color-text-muted)" }}>
                    Status Keanggotaan
                  </div>
                  <div className="flex items-center gap-3">
                    {status === "aktif" ? (
                      <>
                        <CheckCircle className="w-7 h-7" style={{ color: "var(--color-status-active)" }} />
                        <span className="font-bebas text-3xl" style={{ color: "var(--color-status-active)" }}>AKTIF</span>
                      </>
                    ) : status === "akan-habis" ? (
                      <>
                        <AlertTriangle className="w-7 h-7" style={{ color: "#f59e0b" }} />
                        <span className="font-bebas text-3xl" style={{ color: "#f59e0b" }}>SEGERA HABIS</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-7 h-7" style={{ color: "#ef4444" }} />
                        <span className="font-bebas text-3xl" style={{ color: "#ef4444" }}>EXPIRED</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Days remaining */}
                <div className="text-right">
                  <div
                    className="font-bebas text-5xl"
                    style={{
                      color:
                        status === "expired"
                          ? "#ef4444"
                          : status === "akan-habis"
                          ? "#f59e0b"
                          : "var(--color-brand-orange)",
                    }}
                  >
                    {days <= 0 ? "0" : days}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    hari tersisa
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${progressPercent}%`,
                      background:
                        status === "expired"
                          ? "#ef4444"
                          : status === "akan-habis"
                          ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                          : "linear-gradient(90deg, #ff6b2c, #ffb347)",
                    }}
                  />
                </div>
              </div>

              {/* Info rows */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Tanggal Daftar</div>
                  <div style={{ color: "var(--color-text-primary)" }}>
                    {formatDate(member.tanggal_daftar)}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>Jatuh Tempo</div>
                  <div style={{ color: "var(--color-text-primary)" }}>
                    {formatDate(member.tanggal_jatuh_tempo)}
                  </div>
                </div>
              </div>

              {/* Warning / renewal notice */}
              {status !== "aktif" && (
                <div
                  className="mt-5 flex items-center gap-3 p-4 rounded-xl text-sm"
                  style={{
                    background:
                      status === "expired"
                        ? "rgba(239,68,68,0.1)"
                        : "rgba(245,158,11,0.1)",
                    borderLeft: `3px solid ${status === "expired" ? "#ef4444" : "#f59e0b"}`,
                  }}
                >
                  <AlertTriangle
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: status === "expired" ? "#ef4444" : "#f59e0b" }}
                  />
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    {status === "expired"
                      ? "Keanggotaan kamu sudah habis. Segera bayar ke admin untuk perpanjang."
                      : `Keanggotaan kamu tersisa ${days} hari. Segera bayar ke admin sebelum habis.`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Quick Stats ── */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card-stat">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Total Bayar
                </span>
              </div>
              <div className="font-bebas text-2xl" style={{ color: "var(--color-text-primary)" }}>
                {formatRupiah((payments?.length ?? 0) * 100000)}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                {payments?.length ?? 0} bulan pembayaran
              </div>
            </div>

            <div className="card-stat">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Bergabung
                </span>
              </div>
              <div className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {formatDate(member.tanggal_daftar, { month: "short", year: "numeric" })}
              </div>
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Tanggal bergabung
              </div>
            </div>
          </div>

          {/* ── Recent Payments ── */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                Riwayat Pembayaran Terbaru
              </h2>
              <Link href="/member/pembayaran" className="flex items-center gap-1 text-xs" style={{ color: "var(--color-brand-orange)" }}>
                Lihat semua <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            {!payments || payments.length === 0 ? (
              <div className="text-center py-8" style={{ color: "var(--color-text-muted)" }}>
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "var(--color-dark-700)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(34,197,94,0.1)" }}
                      >
                        <CheckCircle className="w-4 h-4" style={{ color: "var(--color-status-active)" }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          Bulan {payment.bulan_dibayar}
                        </div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {formatDate(payment.tanggal_bayar)}
                        </div>
                      </div>
                    </div>
                    <div className="font-semibold text-sm" style={{ color: "var(--color-status-active)" }}>
                      {formatRupiah(payment.jumlah)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Tutorial CTA ── */}
          <Link
            href="/member/tutorial"
            className="card flex items-center justify-between group"
            style={{ textDecoration: "none" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{ background: "rgba(255,107,44,0.1)" }}
              >
                <Dumbbell className="w-6 h-6" style={{ color: "var(--color-brand-orange)" }} />
              </div>
              <div>
                <div className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                  Tutorial Gerakan Gym
                </div>
                <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  Pelajari teknik latihan yang benar
                </div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: "var(--color-text-muted)" }} />
          </Link>
        </>
      )}
    </div>
  );
}
