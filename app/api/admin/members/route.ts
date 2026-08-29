import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Helper: verify admin
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, user: null, adminName: "" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, nama")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403, user: null, adminName: "" };
  }
  return { error: null, status: 200, user, adminName: profile.nama };
}

// Helper: log admin action
async function logAction(adminId: string, adminNama: string, action: string, targetType: string, targetId: string, targetNama: string, detail: string) {
  const admin = createAdminClient();
  await admin.from("admin_logs").insert({
    admin_id: adminId,
    admin_nama: adminNama,
    action,
    target_type: targetType,
    target_id: targetId,
    target_nama: targetNama,
    detail,
  });
}

// GET — List members + pending profiles
export async function GET() {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const admin = createAdminClient();

  // Fetch existing members with profile data
  const { data: members, error } = await admin
    .from("members")
    .select("id, user_id, tanggal_daftar, tanggal_jatuh_tempo, status, catatan, profiles:user_id(id, nama, no_hp, is_verified)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch profiles yang belum punya member record (self-registered)
  const memberUserIds = (members ?? []).map(m => m.user_id);
  const { data: pendingProfiles } = await admin
    .from("profiles")
    .select("id, nama, no_hp, is_verified, created_at")
    .eq("role", "member")
    .not("id", "in", memberUserIds.length > 0 ? `(${memberUserIds.join(",")})` : "(00000000-0000-0000-0000-000000000000)");

  return NextResponse.json({
    members: members ?? [],
    pendingProfiles: (pendingProfiles ?? []).filter(p => !memberUserIds.includes(p.id)),
  });
}

// PUT — Update member
export async function PUT(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { memberId, userId, nama, no_hp, tanggal_jatuh_tempo, catatan } = body;

    if (!memberId) {
      return NextResponse.json({ error: "memberId wajib." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Update profile jika ada perubahan
    if (nama || no_hp !== undefined) {
      const profileUpdate: Record<string, string> = {};
      if (nama) profileUpdate.nama = nama;
      if (no_hp !== undefined) profileUpdate.no_hp = no_hp;
      await admin.from("profiles").update(profileUpdate).eq("id", userId);
    }

    // Update member data
    const memberUpdate: Record<string, string> = {};
    if (tanggal_jatuh_tempo) memberUpdate.tanggal_jatuh_tempo = tanggal_jatuh_tempo;
    if (catatan !== undefined) memberUpdate.catatan = catatan;

    if (Object.keys(memberUpdate).length > 0) {
      // Jika tanggal_jatuh_tempo diupdate dan masih di masa depan, set aktif
      if (tanggal_jatuh_tempo) {
        const today = new Date().toISOString().split("T")[0];
        if (tanggal_jatuh_tempo > today) {
          memberUpdate.status = "aktif";
        }
      }
      await admin.from("members").update(memberUpdate).eq("id", memberId);
    }

    await logAction(auth.user!.id, auth.adminName, "edit_member", "member", memberId, nama || "", `Edit data member`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE — Delete member
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { memberId, memberNama, deleteUser } = await request.json();

    if (!memberId) {
      return NextResponse.json({ error: "memberId wajib." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Get member data first
    const { data: member } = await admin
      .from("members")
      .select("user_id")
      .eq("id", memberId)
      .single();

    // Delete member record
    await admin.from("members").delete().eq("id", memberId);

    // Optionally delete user account too
    if (deleteUser && member?.user_id) {
      await admin.from("profiles").delete().eq("id", member.user_id);
      await admin.auth.admin.deleteUser(member.user_id);
    }

    await logAction(auth.user!.id, auth.adminName, "hapus_member", "member", memberId, memberNama || "", `Hapus member${deleteUser ? " beserta akun" : ""}`);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PATCH — Verify / Activate / Pay
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { action, memberId, userId, memberNama } = body;
    // Jumlah dan catatan dari input admin (wajib untuk aksi pembayaran)
    const jumlahBayar = Number(body.jumlah_bayar ?? 0);
    const catatanBayar: string = body.catatan_bayar?.trim() || "";

    const admin = createAdminClient();

    // ── verify: konfirmasi member baru yg sudah punya member record ──
    if (action === "verify") {
      if (jumlahBayar <= 0) {
        return NextResponse.json({ error: "Jumlah pembayaran harus diisi dan lebih dari 0." }, { status: 400 });
      }

      const durasiHari = Math.max(1, Number(body.durasi_hari ?? 30));
      const today = new Date();
      const expiry = new Date(today.getTime() + durasiHari * 24 * 60 * 60 * 1000);
      const expiryStr = expiry.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];

      await admin.from("profiles").update({ is_verified: true }).eq("id", userId);
      await admin.from("members").update({
        tanggal_jatuh_tempo: expiryStr,
        status: "aktif",
      }).eq("id", memberId);

      // Catat pembayaran ke tabel payments (otomatis masuk arus kas pemasukan)
      await admin.from("payments").insert({
        member_id: memberId,
        bulan_dibayar: todayStr.slice(0, 7),
        jumlah: jumlahBayar,
        tanggal_bayar: todayStr,
        dicatat_oleh: auth.user!.id,
        catatan: catatanBayar || `Pembayaran pertama — aktivasi member ${memberNama ?? ""} (${durasiHari} hari)`,
      });

      await logAction(
        auth.user!.id, auth.adminName,
        "verifikasi_member", "member", memberId, memberNama || "",
        `Verifikasi + aktivasi member baru (${durasiHari} hari, s/d ${expiryStr}) — bayar Rp${jumlahBayar.toLocaleString("id")}`
      );

      return NextResponse.json({ success: true });
    }

    // ── extend: perpanjang member yang sudah aktif/expired ──
    if (action === "extend") {
      if (jumlahBayar <= 0) {
        return NextResponse.json({ error: "Jumlah pembayaran harus diisi dan lebih dari 0." }, { status: 400 });
      }

      const durasiHari = Math.max(1, Number(body.durasi_hari ?? 30));

      const { data: member } = await admin
        .from("members")
        .select("tanggal_jatuh_tempo")
        .eq("id", memberId)
        .single();

      const baseDate = member?.tanggal_jatuh_tempo
        ? new Date(Math.max(new Date(member.tanggal_jatuh_tempo).getTime(), Date.now()))
        : new Date();
      const newExpiry = new Date(baseDate.getTime() + durasiHari * 24 * 60 * 60 * 1000);
      const newExpiryStr = newExpiry.toISOString().split("T")[0];
      const todayStr = new Date().toISOString().split("T")[0];

      await admin.from("members").update({
        tanggal_jatuh_tempo: newExpiryStr,
        status: "aktif",
      }).eq("id", memberId);

      // Catat pembayaran ke tabel payments (otomatis masuk arus kas pemasukan)
      await admin.from("payments").insert({
        member_id: memberId,
        bulan_dibayar: todayStr.slice(0, 7),
        jumlah: jumlahBayar,
        tanggal_bayar: todayStr,
        dicatat_oleh: auth.user!.id,
        catatan: catatanBayar || `Perpanjangan keanggotaan ${memberNama ?? ""} (${durasiHari} hari) s/d ${newExpiryStr}`,
      });

      await logAction(
        auth.user!.id, auth.adminName,
        "perpanjang_member", "member", memberId, memberNama || "",
        `Perpanjang ${durasiHari} hari hingga ${newExpiryStr} — bayar Rp${jumlahBayar.toLocaleString("id")}`
      );

      return NextResponse.json({ success: true });
    }

    // ── activate_pending: user self-register belum punya member record ──
    if (action === "activate_pending") {
      if (jumlahBayar <= 0) {
        return NextResponse.json({ error: "Jumlah pembayaran harus diisi dan lebih dari 0." }, { status: 400 });
      }

      const durasiHari = Math.max(1, Number(body.durasi_hari ?? 30));
      const todayStr = new Date().toISOString().split("T")[0];
      const expiry = new Date(Date.now() + durasiHari * 24 * 60 * 60 * 1000);
      const expiryStr = expiry.toISOString().split("T")[0];

      // Buat member record baru
      const { data: newMember, error: insertErr } = await admin.from("members").insert({
        user_id: userId,
        tanggal_daftar: todayStr,
        tanggal_jatuh_tempo: expiryStr,
        status: "aktif",
      }).select("id").single();

      if (insertErr) {
        return NextResponse.json({ error: "Gagal membuat member record: " + insertErr.message }, { status: 500 });
      }

      // Verifikasi profile
      await admin.from("profiles").update({ is_verified: true }).eq("id", userId);

      // Catat pembayaran ke tabel payments (otomatis masuk arus kas pemasukan)
      await admin.from("payments").insert({
        member_id: newMember.id,
        bulan_dibayar: todayStr.slice(0, 7),
        jumlah: jumlahBayar,
        tanggal_bayar: todayStr,
        dicatat_oleh: auth.user!.id,
        catatan: catatanBayar || `Pembayaran pertama — aktivasi pendaftaran mandiri ${memberNama ?? ""} (${durasiHari} hari)`,
      });

      await logAction(
        auth.user!.id, auth.adminName,
        "verifikasi_member", "member", newMember.id, memberNama || "",
        `Aktivasi pendaftaran mandiri ${durasiHari} hari (s/d ${expiryStr}) — bayar Rp${jumlahBayar.toLocaleString("id")}`
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
  } catch (e) {
    console.error("PATCH /api/admin/members error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
