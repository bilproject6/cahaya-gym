import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatRupiah, daysRemaining } from "@/lib/utils";
import {
  Users, TrendingUp, TrendingDown, AlertTriangle,
  UserCheck, CheckCircle, XCircle, Clock, Package,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent?: "orange" | "green" | "red" | "yellow";
}

function StatCard({ label, value, sub, icon, accent = "orange" }: StatCardProps) {
  const colors = {
    orange: { bg: "rgba(255,107,44,0.08)", color: "var(--color-brand-orange)" },
    green:  { bg: "rgba(34,197,94,0.08)",  color: "var(--color-status-active)" },
    red:    { bg: "rgba(239,68,68,0.08)",  color: "var(--color-status-danger)" },
    yellow: { bg: "rgba(245,158,11,0.08)", color: "#f59e0b" },
  };
  const { bg, color } = colors[accent];

  return (
    <div className="card-stat">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
          {icon}
        </div>
      </div>
      <div className="font-bebas text-3xl mb-1" style={{ color: "var(--color-text-primary)" }}>{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</div>
      {sub && <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{sub}</div>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gunakan adminClient untuk bypass RLS pada semua query data
  const admin = createAdminClient();

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // ── Fetch all data in parallel ──
  const [
    { data: allMembers },
    { data: payments },
    { data: dailyVisitors },
    { data: expenses },
    { data: suppSales },
    { data: pendingMembers },
    { data: expiringSoon },
    { data: todayVisitors },
    { data: lowStock },
    { data: outOfStock },
  ] = await Promise.all([
    admin.from("members").select("id, tanggal_jatuh_tempo, status"),
    admin.from("payments").select("jumlah, tanggal_bayar").gte("tanggal_bayar", firstOfMonth),
    admin.from("daily_visitors").select("jumlah_bayar, tanggal").eq("tanggal", todayStr),
    admin.from("expenses").select("jumlah, tanggal").gte("tanggal", firstOfMonth),
    admin.from("supplement_sales").select("total_harga, tanggal").gte("tanggal", firstOfMonth),
    admin.from("profiles").select("id, nama").eq("role", "member").eq("is_verified", false),
    admin.from("members")
      .select("id, tanggal_jatuh_tempo, profiles(nama, no_hp)")
      .eq("status", "aktif")
      .lte("tanggal_jatuh_tempo", in7Days)
      .gte("tanggal_jatuh_tempo", todayStr),
    // Fetch detail non-member hari ini (nama + bayar)
    admin.from("daily_visitors")
      .select("id, nama, jumlah_bayar, tanggal, catatan")
      .eq("tanggal", todayStr)
      .order("created_at", { ascending: false }),
    admin.from("supplements")
      .select("id, nama_produk, stok, stok_minimum")
      .eq("is_active", true)
      .gt("stok", 0)
      .filter("stok", "lte", "stok_minimum"),
    admin.from("supplements")
      .select("id, nama_produk, stok, stok_minimum")
      .eq("is_active", true)
      .eq("stok", 0),
  ]);

  const activeCount = allMembers?.filter(m => daysRemaining(m.tanggal_jatuh_tempo) > 0).length ?? 0;
  const expiredCount = allMembers?.filter(m => daysRemaining(m.tanggal_jatuh_tempo) <= 0).length ?? 0;

  const memberIncome = payments?.reduce((s, p) => s + p.jumlah, 0) ?? 0;
  const visitorIncome = dailyVisitors?.reduce((s, v) => s + v.jumlah_bayar, 0) ?? 0;
  const suppIncome = suppSales?.reduce((s, ss) => s + ss.total_harga, 0) ?? 0;
  const totalIncome = memberIncome + visitorIncome + suppIncome;
  const totalExpenses = expenses?.reduce((s, e) => s + e.jumlah, 0) ?? 0;
  const saldo = totalIncome - totalExpenses;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          DASHBOARD ADMIN
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Ringkasan operasional Cahaya Gym hari ini
        </p>
      </div>

      {/* ── Alerts ── */}
      {(pendingMembers && pendingMembers.length > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#a855f7" }} />
          <span style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "#a855f7" }}>{pendingMembers.length} member baru</strong> menunggu verifikasi.{" "}
            <a href="/admin/members?filter=pending" style={{ color: "#a855f7", textDecoration: "underline" }}>Verifikasi sekarang →</a>
          </span>
        </div>
      )}

      {(outOfStock && outOfStock.length > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#ef4444" }} />
          <span style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "#ef4444" }}>{outOfStock.length} produk suplemen</strong> stok habis!{" "}
            <a href="/admin/suplemen" style={{ color: "#ef4444", textDecoration: "underline" }}>Isi stok →</a>
          </span>
        </div>
      )}

      {(lowStock && lowStock.length > 0) && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#f59e0b" }} />
          <span style={{ color: "var(--color-text-secondary)" }}>
            <strong style={{ color: "#f59e0b" }}>{lowStock.length} produk suplemen</strong> stok tipis.{" "}
            <a href="/admin/suplemen" style={{ color: "#f59e0b", textDecoration: "underline" }}>Cek stok →</a>
          </span>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatRupiah(totalIncome)}
          sub={`Saldo: ${formatRupiah(saldo)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          accent="orange"
        />
        <StatCard
          label="Member Aktif"
          value={activeCount}
          sub={`${expiredCount} member expired`}
          icon={<Users className="w-5 h-5" />}
          accent="green"
        />
        <StatCard
          label="Non-Member Hari Ini"
          value={dailyVisitors?.length ?? 0}
          sub={formatRupiah(visitorIncome)}
          icon={<UserCheck className="w-5 h-5" />}
          accent="yellow"
        />
        <StatCard
          label="Akan Expired (7 hr)"
          value={expiringSoon?.length ?? 0}
          sub="perlu perpanjang"
          icon={<AlertTriangle className="w-5 h-5" />}
          accent="red"
        />
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Members expiring soon */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Member Akan Expired (7 hari)
            </h2>
            <a href="/admin/members" className="text-xs" style={{ color: "var(--color-brand-orange)" }}>
              Lihat semua →
            </a>
          </div>

          {!expiringSoon || expiringSoon.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-status-active)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Semua member aman 👍</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringSoon.map((m: Record<string, unknown>) => {
                const days = daysRemaining(m.tanggal_jatuh_tempo as string);
                const profile = (m.profiles as Record<string, string>) ?? {};
                return (
                  <div key={m.id as string} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: "var(--color-dark-700)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
                        {(profile.nama ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                          {profile.nama ?? "—"}
                        </div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {profile.no_hp ?? "—"}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${days <= 3 ? "badge-danger" : "badge-warning"}`}>
                      <Clock className="w-3 h-3" /> {days}h lagi
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Non-Member Hari Ini */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Non-Member Hari Ini
            </h2>
            <a href="/admin/non-member" className="text-xs" style={{ color: "var(--color-brand-orange)" }}>
              Kelola →
            </a>
          </div>

          {!todayVisitors || todayVisitors.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: "var(--color-text-muted)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada non-member hari ini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayVisitors.map((v: Record<string, unknown>) => (
                <div key={v.id as string} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ background: "var(--color-dark-700)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "rgba(255,107,44,0.15)", color: "var(--color-brand-orange)" }}>
                      {((v.nama as string) ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                      {(v.nama as string) || <em style={{ color: "var(--color-text-muted)" }}>Tanpa nama</em>}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "var(--color-status-active)" }}>
                    +{formatRupiah(v.jumlah_bayar as number)}
                  </span>
                </div>
              ))}
              {/* Total */}
              <div className="flex items-center justify-between px-3 pt-2"
                style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
                <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>TOTAL</span>
                <span className="font-bebas text-lg" style={{ color: "var(--color-status-active)" }}>
                  {formatRupiah(todayVisitors.reduce((s: number, v: Record<string, unknown>) => s + (v.jumlah_bayar as number), 0))}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Keuangan bulan ini */}
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Arus Kas Bulan Ini
          </h2>
          <div className="space-y-3">
            {[
              { label: "Pembayaran Member", value: memberIncome, icon: Users, color: "var(--color-status-active)" },
              { label: "Non-Member Harian", value: visitorIncome, icon: UserCheck, color: "var(--color-status-active)" },
              { label: "Penjualan Suplemen", value: suppIncome, icon: TrendingUp, color: "var(--color-status-active)" },
              { label: "Total Pengeluaran", value: -totalExpenses, icon: TrendingDown, color: "var(--color-status-danger)" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--color-dark-700)" }}>
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
                </div>
                <span className="font-semibold text-sm" style={{ color }}>
                  {value < 0 ? "-" : "+"}{formatRupiah(Math.abs(value))}
                </span>
              </div>
            ))}
            {/* Divider + Saldo */}
            <div className="divider" />
            <div className="flex items-center justify-between px-3">
              <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>Saldo Bersih</span>
              <span className="font-bebas text-xl" style={{ color: saldo >= 0 ? "var(--color-status-active)" : "var(--color-status-danger)" }}>
                {formatRupiah(saldo)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
