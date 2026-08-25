import { createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { nama, email, no_hp, password } = await request.json();

    // ── Validasi ──
    if (!nama?.trim()) {
      return NextResponse.json({ error: "Nama lengkap wajib diisi." }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    const admin = createAdminClient();

    // ── Cek email sudah dipakai ──
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (emailExists) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." },
        { status: 400 }
      );
    }

    // ── Buat user via admin (role SELALU member, tidak bisa di-override dari client) ──
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true, // Otomatis confirmed, tidak perlu cek email
      user_metadata: {
        nama: nama.trim(),
        no_hp: no_hp?.trim() || "",
        role: "member",
      },
    });

    if (authError) {
      if (authError.message.toLowerCase().includes("already")) {
        return NextResponse.json(
          { error: "Email sudah terdaftar. Silakan login atau gunakan email lain." },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // ── Pastikan profile is_verified = false (menunggu konfirmasi admin) ──
    // Trigger handle_new_user sudah buat profile, kita hanya set is_verified
    await admin.from("profiles").update({ is_verified: false }).eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
