import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { User, Phone, Mail, Calendar, Shield } from "lucide-react";

export default async function MemberProfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gunakan adminClient untuk bypass RLS recursion
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("nama, no_hp, role, is_verified, created_at")
    .eq("id", user.id)
    .single();

  const { data: member } = await admin
    .from("members")
    .select("tanggal_daftar, tanggal_jatuh_tempo, status")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-dark-text-primary, #f0f4ff)" }}>
          PROFIL SAYA
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Informasi akun dan keanggotaan kamu
        </p>
      </div>

      {/* Avatar & name card */}
      <div className="card mb-5 flex items-center gap-5">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ background: "var(--color-brand-orange)", color: "white" }}
        >
          {profile?.nama?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold text-xl mb-1" style={{ color: "var(--color-text-primary)" }}>
            {profile?.nama}
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-active">Member</span>
            {profile?.is_verified ? (
              <span className="badge badge-active">Terverifikasi</span>
            ) : (
              <span className="badge badge-warning">Menunggu Verifikasi</span>
            )}
          </div>
        </div>
      </div>

      {/* Info grid */}
      <div className="card mb-5">
        <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Informasi Akun
        </h2>
        <div className="space-y-4">
          {[
            { icon: User, label: "Nama Lengkap", value: profile?.nama ?? "-" },
            { icon: Mail, label: "Email", value: user.email ?? "-" },
            { icon: Phone, label: "No. HP / WhatsApp", value: profile?.no_hp ?? "-" },
            { icon: Calendar, label: "Bergabung Sejak", value: profile?.created_at ? formatDate(profile.created_at) : "-" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,107,44,0.08)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />
              </div>
              <div>
                <div className="text-xs mb-0.5" style={{ color: "var(--color-text-muted)" }}>{label}</div>
                <div className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Membership info */}
      {member && (
        <div className="card">
          <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
            Informasi Keanggotaan
          </h2>
          <div className="space-y-4">
            {[
              { label: "Tanggal Daftar Member", value: formatDate(member.tanggal_daftar) },
              { label: "Tanggal Jatuh Tempo", value: formatDate(member.tanggal_jatuh_tempo) },
              {
                label: "Status",
                value: member.status === "aktif" ? "Aktif" : member.status === "non-aktif" ? "Belum Aktif" : "Expired",
                badge: member.status === "aktif" ? "badge-active" : member.status === "non-aktif" ? "badge-warning" : "badge-danger",
              },
            ].map(({ label, value, badge }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{label}</span>
                {badge ? (
                  <span className={`badge ${badge}`}>{value}</span>
                ) : (
                  <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-center mt-6" style={{ color: "var(--color-text-muted)" }}>
        Untuk mengubah data profil, hubungi admin gym.
      </p>
    </div>
  );
}
