import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // ── AUTH CHECK: Hanya admin yang boleh create member ──
    const userClient = await createClient();
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role, nama")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ── VALIDASI INPUT ──
    const { nama, email, no_hp, password } = await request.json();

    if (!nama || !email || !password) {
      return NextResponse.json({ error: "Nama, email, dan password wajib diisi." }, { status: 400 });
    }

    if (typeof nama !== "string" || nama.trim().length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    // Sanitize input
    const cleanNama = nama.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanHp = (no_hp ?? "").trim();

    // Create user — email auto-confirmed
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nama: cleanNama,
        no_hp: cleanHp,
        role: "member", // SELALU member, tidak bisa di-override
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // Profile dibuat oleh trigger handle_new_user, tapi pastikan is_verified = false
    await supabase.from("profiles").update({ is_verified: false }).eq("id", userId);

    // Buat member record dengan status non-aktif (belum bayar)
    const today = new Date().toISOString().split("T")[0];

    const { error: memberError } = await supabase.from("members").insert({
      user_id: userId,
      tanggal_daftar: today,
      tanggal_jatuh_tempo: today, // belum ada masa aktif
      status: "non-aktif",
    });

    if (memberError) {
      // Rollback: hapus user jika gagal buat member
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json({ error: "Gagal membuat record member: " + memberError.message }, { status: 500 });
    }

    // ── LOG AKTIVITAS ADMIN ──
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      admin_nama: adminProfile.nama,
      action: "tambah_member",
      target_type: "member",
      target_id: userId,
      target_nama: cleanNama,
      detail: `Tambah member baru: ${cleanNama} (${cleanEmail})`,
    });

    return NextResponse.json({ success: true, userId });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
