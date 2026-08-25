import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session (penting agar cookie tetap valid)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Protected routes: redirect ke login jika belum auth ──
  const isProtectedRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/member");

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Auth pages: redirect ke dashboard jika sudah login ──
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role ?? user.user_metadata?.role ?? "member";
    const dashboardUrl = role === "admin" ? "/admin/dashboard" : "/member/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  return supabaseResponse;
}
