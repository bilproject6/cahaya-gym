import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// POST only — prevent CSRF via GET (image tags, links)
export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}

// GET — for backward compatibility (e.g. manual URL visit)
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/login", origin));
}
