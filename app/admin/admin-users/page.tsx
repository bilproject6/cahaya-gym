import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { ShieldCheck, Users } from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gunakan adminClient untuk bypass RLS
  const adminDb = createAdminClient();
  const { data: admins } = await adminDb
    .from("profiles")
    .select("id, nama, no_hp, created_at, is_verified")
    .eq("role", "admin")
    .order("created_at");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          KELOLA ADMIN
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Daftar akun staf yang memiliki akses admin panel
        </p>
      </div>

      <div className="card mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(255,107,44,0.1)" }}>
          <Users className="w-5 h-5" style={{ color: "var(--color-brand-orange)" }} />
        </div>
        <div>
          <div className="font-bebas text-2xl" style={{ color: "var(--color-text-primary)" }}>
            {admins?.length ?? 0}
          </div>
          <div className="text-xs uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
            Total Admin
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Daftar Admin</h2>
        {!admins || admins.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Belum ada admin terdaftar.</p>
        ) : (
          <div className="space-y-3">
            {admins.map((admin) => (
              <div key={admin.id}
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "var(--color-dark-700)" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#ff6b2c,#ffb347)", color: "white" }}>
                  {admin.nama.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
                    {admin.nama}
                    {admin.id === user.id && (
                      <span className="ml-2 text-xs" style={{ color: "var(--color-brand-orange)" }}>(Anda)</span>
                    )}
                  </div>
                  <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {admin.no_hp ?? "—"} · Bergabung {formatDate(admin.created_at, { month: "short", year: "numeric" })}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />
                  <span className="text-xs font-medium" style={{ color: "var(--color-brand-orange)" }}>Admin</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="mt-6 p-4 rounded-xl text-sm"
        style={{ background: "rgba(255,107,44,0.06)", border: "1px solid rgba(255,107,44,0.12)" }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>
          💡 Untuk menambah akun admin baru, daftarkan melalui halaman{" "}
          <strong>Supabase Authentication</strong> atau buat akun baru dan set role ke &quot;admin&quot; di database.
          Admin baru membutuhkan &quot;admin&quot; di field <code style={{ color: "var(--color-brand-orange)" }}>role</code> pada tabel <code style={{ color: "var(--color-brand-orange)" }}>profiles</code>.
        </p>
      </div>
    </div>
  );
}
