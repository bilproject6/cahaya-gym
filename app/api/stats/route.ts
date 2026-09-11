import { createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 300; // cache 5 menit

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Hitung member aktif (is_verified = true & role = member)
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "member")
      .eq("is_verified", true);

    return NextResponse.json({ memberCount: count ?? 0 });
  } catch {
    return NextResponse.json({ memberCount: 0 });
  }
}
