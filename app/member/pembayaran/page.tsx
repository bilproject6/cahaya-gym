import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatRupiah } from "@/lib/utils";
import { CreditCard, CheckCircle, Calendar, Clock } from "lucide-react";

export default async function MemberPembayaranPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Gunakan adminClient untuk bypass RLS — query atas nama user sendiri tapi tanpa RLS recursion
  const admin = createAdminClient();

  const { data: member } = await admin
    .from("members")
    .select("id, status, tanggal_jatuh_tempo")
    .eq("user_id", user.id)
    .single();

  const { data: payments } = member?.id
    ? await admin
        .from("payments")
        .select("id, bulan_dibayar, jumlah, tanggal_bayar, catatan")
        .eq("member_id", member.id)
        .order("tanggal_bayar", { ascending: false })
    : { data: [] };

  const totalBayar = payments?.reduce((sum, p) => sum + p.jumlah, 0) ?? 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl mb-1" style={{ color: "var(--color-text-primary)" }}>
          RIWAYAT PEMBAYARAN
        </h1>
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Semua riwayat pembayaran keanggotaan bulanan kamu
        </p>
      </div>

      {/* Summary */}
      <div className="card mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,107,44,0.1)" }}
          >
            <CreditCard className="w-6 h-6" style={{ color: "var(--color-brand-orange)" }} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "var(--color-text-muted)" }}>
              Total Pembayaran
            </div>
            <div className="font-bebas text-3xl" style={{ color: "var(--color-text-primary)" }}>
              {formatRupiah(totalBayar)}
            </div>
          </div>
        </div>
      </div>

      {/* State: belum ada member record */}
      {!member ? (
        <div className="card text-center py-12" style={{ borderColor: "rgba(168,85,247,0.2)", background: "rgba(168,85,247,0.04)" }}>
          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: "#a855f7" }} />
          <p className="font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>Keanggotaan Belum Aktif</p>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Riwayat pembayaran akan muncul setelah keanggotaan diaktifkan oleh admin.
          </p>
        </div>
      ) : !payments || payments.length === 0 ? (
        <div className="card text-center py-12">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--color-text-muted)" }} />
          <p style={{ color: "var(--color-text-muted)" }}>Belum ada riwayat pembayaran.</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
            Hubungi admin jika pembayaran belum tercatat.
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th>Tanggal Bayar</th>
                  <th>Jumlah</th>
                  <th>Keterangan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: "var(--color-text-muted)" }} />
                        <span style={{ color: "var(--color-text-primary)" }}>
                          {payment.bulan_dibayar}
                        </span>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-text-secondary)" }}>
                      {formatDate(payment.tanggal_bayar)}
                    </td>
                    <td>
                      <span className="font-semibold" style={{ color: "var(--color-status-active)" }}>
                        {formatRupiah(payment.jumlah)}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>
                      {payment.catatan || "—"}
                    </td>
                    <td>
                      <span className="badge badge-active">
                        <CheckCircle className="w-3 h-3" /> Lunas
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
