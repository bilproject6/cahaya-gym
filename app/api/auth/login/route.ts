import { createAdminClient, createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier dan password wajib diisi." }, { status: 400 });
    }

    const input = identifier.trim();
    let email: string | null = null;

    // Deteksi tipe identifier
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    const isPhone = /^[\d\s\-+()]{8,15}$/.test(input);

    if (isEmail) {
      // Langsung pakai sebagai email
      email = input.toLowerCase();
    } else {
      // Cari di profiles via admin client (bypass RLS)
      const admin = createAdminClient();
      let profileData = null;

      if (isPhone) {
        // Cari berdasarkan no_hp — normalisasi format
        const cleanPhone = input.replace(/\D/g, "");
        const phoneVariants = [
          cleanPhone,
          cleanPhone.startsWith("62") ? "0" + cleanPhone.slice(2) : cleanPhone,
          cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone,
        ];

        for (const phone of phoneVariants) {
          const { data } = await admin
            .from("profiles")
            .select("id")
            .eq("no_hp", phone)
            .single();
          if (data) { profileData = data; break; }
        }

        // Juga coba LIKE match untuk format berbeda
        if (!profileData) {
          const { data } = await admin
            .from("profiles")
            .select("id")
            .ilike("no_hp", `%${cleanPhone.slice(-8)}%`)
            .limit(1)
            .maybeSingle();
          profileData = data;
        }
      } else {
        // Cari berdasarkan nama (case-insensitive)
        // Ambil max 2 agar bisa deteksi nama duplikat
        const { data: namaResults } = await admin
          .from("profiles")
          .select("id")
          .ilike("nama", input)
          .limit(2);

        if (namaResults && namaResults.length > 1) {
          return NextResponse.json(
            { error: "Ditemukan beberapa akun dengan nama tersebut. Gunakan email atau nomor HP untuk login." },
            { status: 400 }
          );
        }
        profileData = namaResults?.[0] ?? null;
      }

      if (!profileData) {
        return NextResponse.json({ error: "Nama, nomor HP, atau email tidak ditemukan." }, { status: 401 });
      }

      // Ambil email dari auth.users via admin
      const { data: authUser } = await admin.auth.admin.getUserById(profileData.id);
      if (!authUser?.user?.email) {
        return NextResponse.json({ error: "Akun tidak ditemukan atau belum terdaftar." }, { status: 401 });
      }
      email = authUser.user.email;
    }

    // Login menggunakan email yang sudah diresolved
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email!,
      password,
    });

    if (authError) {
      if (authError.message.includes("Email not confirmed")) {
        return NextResponse.json({ error: "Email belum dikonfirmasi. Hubungi admin." }, { status: 401 });
      }
      return NextResponse.json({ error: "Password salah. Silakan coba lagi." }, { status: 401 });
    }

    // Ambil role — gunakan instance baru (bukan redeclare)
    const roleClient = createAdminClient();
    const { data: profile } = await roleClient
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    const role = profile?.role || authData.user.user_metadata?.role || "member";

    return NextResponse.json({ success: true, role });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
