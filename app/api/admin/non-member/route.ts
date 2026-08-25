import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Verify admin helper
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, user: null };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Forbidden", status: 403, user: null };

  return { error: null, status: 200, user };
}

// GET — Fetch daily visitors
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? 50);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("daily_visitors")
    .select("id, nama, jumlah_bayar, tanggal, catatan, created_at")
    .order("tanggal", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ visitors: data ?? [] });
}

// POST — Add visitor
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { nama, jumlah_bayar, tanggal, catatan } = await request.json();

    if (!jumlah_bayar || jumlah_bayar <= 0) {
      return NextResponse.json({ error: "Jumlah bayar harus lebih dari 0." }, { status: 400 });
    }
    if (!tanggal) {
      return NextResponse.json({ error: "Tanggal wajib diisi." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("daily_visitors").insert({
      nama: nama?.trim() || null,
      jumlah_bayar: Number(jumlah_bayar),
      tanggal,
      catatan: catatan?.trim() || null,
      dicatat_oleh: auth.user!.id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE — Remove visitor
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("daily_visitors").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
