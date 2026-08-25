import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    const supabase = await createClient();
    const origin = request.headers.get("origin") || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    });

    if (error) {
      console.error("Reset password error:", error.message);
      // Jangan expose apakah email ada atau tidak — security through obscurity
    }

    // Selalu return success agar tidak bisa di-enumerate apakah email terdaftar
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Forgot password error:", e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
