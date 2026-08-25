import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/member/dashboard";

  // ── FIX: Validasi next harus relative path, cegah open redirect ──
  const safeNext = (next.startsWith("/") && !next.startsWith("//")) ? next : "/member/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Gunakan role dari database, bukan user_metadata
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const role = profile?.role || data.user.user_metadata?.role;

      const redirectTo =
        safeNext !== "/member/dashboard"
          ? safeNext
          : role === "admin"
          ? "/admin/dashboard"
          : "/member/dashboard";

      return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL("/login?error=callback", requestUrl.origin));
}
