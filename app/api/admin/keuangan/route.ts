import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, user: null, adminNama: "" };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role, nama").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Forbidden", status: 403, user: null, adminNama: "" };

  return { error: null, status: 200, user, adminNama: profile.nama as string };
}

// GET - Semua data keuangan (mode: month | year | all)
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const mode = searchParams.get("mode") ?? "month"; // "month" | "year" | "all"

  let firstDate: string;
  let lastDate: string;

  if (mode === "all") {
    firstDate = "2000-01-01";
    lastDate = "2099-12-31";
  } else if (mode === "year") {
    firstDate = `${year}-01-01`;
    lastDate = `${year}-12-31`;
  } else {
    const firstOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    firstDate = firstOfMonth;
    lastDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  const admin = createAdminClient();

  const [
    { data: payments },
    { data: visitors },
    { data: suppSales },
    { data: expenses },
  ] = await Promise.all([
    admin.from("payments").select("jumlah, tanggal_bayar, member_id, catatan").gte("tanggal_bayar", firstDate).lte("tanggal_bayar", lastDate).order("tanggal_bayar", { ascending: false }),
    admin.from("daily_visitors").select("jumlah_bayar, tanggal, nama").gte("tanggal", firstDate).lte("tanggal", lastDate).order("tanggal", { ascending: false }),
    admin.from("supplement_sales").select("id, total_harga, harga_satuan, qty, tanggal, supplements(nama_produk, harga_beli)").gte("tanggal", firstDate).lte("tanggal", lastDate).order("tanggal", { ascending: false }),
    admin.from("expenses").select("id, kategori, jumlah, tanggal, catatan").gte("tanggal", firstDate).lte("tanggal", lastDate).order("tanggal", { ascending: false }),
  ]);

  return NextResponse.json({
    payments: payments ?? [],
    visitors: visitors ?? [],
    suppSales: suppSales ?? [],
    expenses: expenses ?? [],
    period: { firstDate, lastDate, year, month, mode },
  });
}
// POST — Tambah pengeluaran
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { kategori, jumlah, tanggal, catatan } = await request.json();

    if (!kategori) return NextResponse.json({ error: "Kategori wajib." }, { status: 400 });
    if (!jumlah || Number(jumlah) <= 0) return NextResponse.json({ error: "Jumlah harus lebih dari 0." }, { status: 400 });
    if (!tanggal) return NextResponse.json({ error: "Tanggal wajib." }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("expenses").insert({
      kategori,
      jumlah: Number(jumlah),
      tanggal,
      catatan: catatan?.trim() || null,
      dicatat_oleh: auth.user!.id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log aksi admin
    await admin.from("admin_logs").insert({
      admin_id: auth.user!.id,
      admin_nama: auth.adminNama,
      action: "tambah_pengeluaran",
      target_type: "keuangan",
      target_id: "",
      target_nama: kategori,
      detail: `Tambah pengeluaran ${kategori}: Rp${Number(jumlah).toLocaleString("id")} (${tanggal})`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// PUT — Edit pengeluaran
export async function PUT(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, kategori, jumlah, tanggal, catatan } = await request.json();

    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });
    if (!kategori) return NextResponse.json({ error: "Kategori wajib." }, { status: 400 });
    if (!jumlah || Number(jumlah) <= 0) return NextResponse.json({ error: "Jumlah harus lebih dari 0." }, { status: 400 });
    if (!tanggal) return NextResponse.json({ error: "Tanggal wajib." }, { status: 400 });

    const admin = createAdminClient();

    // Cek apakah expense ini terkait dengan stock_adjustment (audit trail suplemen)
    // Jika ya, boleh edit catatan tapi tidak boleh ubah jumlah/kategori
    const { data: linked } = await admin
      .from("stock_adjustments")
      .select("id")
      .eq("expense_id", id)
      .limit(1)
      .maybeSingle();

    if (linked) {
      // Hanya izinkan edit catatan saja
      const { error } = await admin.from("expenses").update({
        catatan: catatan?.trim() || null,
      }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, note: "Hanya catatan yang diperbarui (terkait riwayat stok)." });
    }

    const { error } = await admin.from("expenses").update({
      kategori,
      jumlah: Number(jumlah),
      tanggal,
      catatan: catatan?.trim() || null,
    }).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log aksi admin
    await admin.from("admin_logs").insert({
      admin_id: auth.user!.id,
      admin_nama: auth.adminNama,
      action: "edit_pengeluaran",
      target_type: "keuangan",
      target_id: id,
      target_nama: kategori,
      detail: `Edit pengeluaran ${kategori}: Rp${Number(jumlah).toLocaleString("id")} (${tanggal})`,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// DELETE — Hapus pengeluaran
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

    const admin = createAdminClient();

    // Cek apakah expense ini terkait dengan stock_adjustment (audit trail suplemen)
    const { data: linked } = await admin
      .from("stock_adjustments")
      .select("id")
      .eq("expense_id", id)
      .limit(1)
      .maybeSingle();

    if (linked) {
      return NextResponse.json(
        { error: "Pengeluaran ini terkait dengan riwayat stok suplemen dan tidak dapat dihapus. Edit catatan jika diperlukan." },
        { status: 409 }
      );
    }

    const { error } = await admin.from("expenses").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
