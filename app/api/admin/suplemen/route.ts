import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ── Auth helper ──────────────────────────────────────────────────
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401, user: null };
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("role, nama").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") return { error: "Forbidden", status: 403, user: null };
  return { error: null, status: 200, user, adminNama: profile.nama as string };
}

// ── GET — List suplemen + riwayat stok per supplement ────────────
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const supplementId = searchParams.get("id");

  const admin = createAdminClient();

  if (supplementId) {
    // Detail 1 suplemen + riwayat stok
    const [{ data: supp }, { data: history }] = await Promise.all([
      admin.from("supplements").select("*").eq("id", supplementId).single(),
      admin.from("stock_adjustments")
        .select("id, tipe, qty, stok_sebelum, stok_sesudah, harga_satuan, total_nilai, catatan, dicatat_ke_arus_kas, created_at")
        .eq("supplement_id", supplementId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    return NextResponse.json({ supplement: supp, history: history ?? [] });
  }

  // List all suplemen — aktif atau nonaktif
  const showInactive = searchParams.get("inactive") === "true";
  const { data, error } = await admin
    .from("supplements")
    .select("*")
    .eq("is_active", !showInactive)
    .order("nama_produk");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ supplements: data ?? [] });
}

// ── POST — Tambah suplemen baru ───────────────────────────────────
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { nama_produk, harga_jual, harga_beli, stok, satuan, stok_minimum, catat_arus_kas } = await request.json();

    if (!nama_produk?.trim()) return NextResponse.json({ error: "Nama produk wajib." }, { status: 400 });
    if (!harga_jual || Number(harga_jual) <= 0) return NextResponse.json({ error: "Harga jual harus > 0." }, { status: 400 });
    if (Number(stok) < 0) return NextResponse.json({ error: "Stok tidak boleh negatif." }, { status: 400 });

    const admin = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // Insert suplemen baru
    const { data: newSupp, error: suppErr } = await admin
      .from("supplements")
      .insert({
        nama_produk: nama_produk.trim(),
        harga_jual: Number(harga_jual),
        harga_beli: Number(harga_beli ?? 0),
        stok: Number(stok ?? 0),
        satuan: satuan?.trim() || "pcs",
        stok_minimum: Number(stok_minimum ?? 5),
      })
      .select("id, stok, harga_beli")
      .single();

    if (suppErr) return NextResponse.json({ error: suppErr.message }, { status: 500 });

    // Catat initial stock adjustment
    if (Number(stok) > 0) {
      await admin.from("stock_adjustments").insert({
        supplement_id: newSupp.id,
        tipe: "initial",
        qty: Number(stok),
        stok_sebelum: 0,
        stok_sesudah: Number(stok),
        harga_satuan: Number(harga_beli ?? 0),
        total_nilai: Number(harga_beli ?? 0) * Number(stok),
        catatan: "Stok awal saat produk ditambahkan",
        dicatat_ke_arus_kas: !!catat_arus_kas,
        dicatat_oleh: auth.user!.id,
      });
    }

    // Catat ke arus kas jika diminta
    let expenseId: string | null = null;
    if (catat_arus_kas && Number(harga_beli) > 0 && Number(stok) > 0) {
      const totalModal = Number(harga_beli) * Number(stok);
      const { data: exp } = await admin.from("expenses").insert({
        kategori: "suplemen",
        jumlah: totalModal,
        tanggal: today,
        catatan: `Modal awal suplemen: ${nama_produk} (${stok} ${satuan || "pcs"} × ${harga_beli})`,
        dicatat_oleh: auth.user!.id,
      }).select("id").single();
      expenseId = exp?.id ?? null;

      // Update expense_id di stock_adjustment
      if (expenseId) {
        await admin.from("stock_adjustments")
          .update({ expense_id: expenseId })
          .eq("supplement_id", newSupp.id)
          .eq("tipe", "initial");
      }
    }

    return NextResponse.json({ success: true, id: newSupp.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// ── PUT — Edit data produk suplemen ──────────────────────────────
export async function PUT(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, nama_produk, harga_jual, harga_beli, satuan, stok_minimum } = await request.json();
    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("supplements").update({
      nama_produk: nama_produk?.trim(),
      harga_jual: Number(harga_jual),
      harga_beli: Number(harga_beli ?? 0),
      satuan: satuan?.trim() || "pcs",
      stok_minimum: Number(stok_minimum ?? 5),
      updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// ── PATCH — Jual / Restock / Koreksi stok ────────────────────────
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const { action, id } = body;
    const admin = createAdminClient();

    // Ambil data suplemen terkini
    const { data: supp, error: suppErr } = await admin
      .from("supplements")
      .select("id, stok, harga_beli, harga_jual, nama_produk, satuan")
      .eq("id", id)
      .single();

    if (suppErr || !supp) return NextResponse.json({ error: "Suplemen tidak ditemukan." }, { status: 404 });

    const today = new Date().toISOString().split("T")[0];

    // ── ACTION: jual ──────────────────────────────────────────────
    if (action === "jual") {
      const qty = Number(body.qty);
      if (qty <= 0) return NextResponse.json({ error: "Jumlah harus > 0." }, { status: 400 });
      if (qty > supp.stok) return NextResponse.json({ error: "Stok tidak mencukupi." }, { status: 400 });

      const totalHarga = qty * supp.harga_jual;
      const stokBaru = supp.stok - qty;

      await admin.from("supplement_sales").insert({
        supplement_id: id,
        qty,
        harga_satuan: supp.harga_jual,
        total_harga: totalHarga,
        tanggal: today,
        dicatat_oleh: auth.user!.id,
        catatan: body.catatan || null,
      });

      await admin.from("supplements").update({ stok: stokBaru, updated_at: new Date().toISOString() }).eq("id", id);

      await admin.from("stock_adjustments").insert({
        supplement_id: id,
        tipe: "jual",
        qty: -qty,
        stok_sebelum: supp.stok,
        stok_sesudah: stokBaru,
        harga_satuan: supp.harga_jual,
        total_nilai: totalHarga,
        catatan: body.catatan || `Penjualan ${qty} ${supp.satuan}`,
        // dicatat_ke_arus_kas: false — penjualan sudah tercatat via supplement_sales
        dicatat_ke_arus_kas: false,
        dicatat_oleh: auth.user!.id,
      });

      return NextResponse.json({ success: true });
    }

    // ── ACTION: restock ───────────────────────────────────────────
    if (action === "restock") {
      const qty = Number(body.qty);
      const hargaBeli = Number(body.harga_beli ?? supp.harga_beli ?? 0);
      const catatArusKas: boolean = !!body.catat_arus_kas;
      const catatan = body.catatan || `Restock ${qty} ${supp.satuan}`;

      if (qty <= 0) return NextResponse.json({ error: "Jumlah harus > 0." }, { status: 400 });

      const stokBaru = supp.stok + qty;
      const totalNilai = hargaBeli * qty;

      await admin.from("supplements").update({
        stok: stokBaru,
        harga_beli: hargaBeli, // update harga beli terbaru
        updated_at: new Date().toISOString(),
      }).eq("id", id);

      await admin.from("supplement_restock").insert({
        supplement_id: id,
        qty_masuk: qty,
        harga_beli: hargaBeli,
        tanggal: today,
        catatan,
        dicatat_oleh: auth.user!.id,
      });

      let expenseId: string | null = null;
      if (catatArusKas && totalNilai > 0) {
        const { data: exp } = await admin.from("expenses").insert({
          kategori: "suplemen",
          jumlah: totalNilai,
          tanggal: today,
          catatan: `Restock: ${supp.nama_produk} (${qty} ${supp.satuan} × Rp${hargaBeli.toLocaleString("id")})`,
          dicatat_oleh: auth.user!.id,
        }).select("id").single();
        expenseId = exp?.id ?? null;
      }

      await admin.from("stock_adjustments").insert({
        supplement_id: id,
        tipe: "restock",
        qty,
        stok_sebelum: supp.stok,
        stok_sesudah: stokBaru,
        harga_satuan: hargaBeli,
        total_nilai: totalNilai,
        catatan,
        dicatat_ke_arus_kas: catatArusKas,
        expense_id: expenseId,
        dicatat_oleh: auth.user!.id,
      });

      return NextResponse.json({ success: true });
    }

    // ── ACTION: koreksi stok ──────────────────────────────────────
    if (action === "koreksi") {
      const stokBaru = Number(body.stok_baru);
      const catatArusKas: boolean = !!body.catat_arus_kas;
      const catatan = body.catatan?.trim();
      const selisih = stokBaru - supp.stok;

      if (stokBaru < 0) return NextResponse.json({ error: "Stok tidak boleh negatif." }, { status: 400 });
      if (selisih === 0) return NextResponse.json({ error: "Stok tidak berubah." }, { status: 400 });
      if (selisih < 0 && !catatan) {
        return NextResponse.json({ error: "Catatan wajib diisi saat mengurangi stok." }, { status: 400 });
      }

      const tipe = selisih > 0 ? "koreksi_tambah" : "koreksi_kurang";
      const absQty = Math.abs(selisih);
      const totalNilai = supp.harga_beli * absQty;

      await admin.from("supplements").update({
        stok: stokBaru,
        updated_at: new Date().toISOString(),
      }).eq("id", id);

      let expenseId: string | null = null;
      if (catatArusKas && totalNilai > 0) {
        const keteranganArusKas = selisih < 0
          ? `Kerugian stok: ${supp.nama_produk} (${absQty} ${supp.satuan} × Rp${supp.harga_beli.toLocaleString("id")}) — ${catatan}`
          : `Penambahan modal stok: ${supp.nama_produk} (${absQty} ${supp.satuan} × Rp${supp.harga_beli.toLocaleString("id")})`;

        const { data: exp } = await admin.from("expenses").insert({
          kategori: "suplemen",
          jumlah: totalNilai,
          tanggal: today,
          catatan: keteranganArusKas,
          dicatat_oleh: auth.user!.id,
        }).select("id").single();
        expenseId = exp?.id ?? null;
      }

      await admin.from("stock_adjustments").insert({
        supplement_id: id,
        tipe,
        qty: selisih,
        stok_sebelum: supp.stok,
        stok_sesudah: stokBaru,
        harga_satuan: supp.harga_beli,
        total_nilai: totalNilai,
        catatan: catatan || `Koreksi stok`,
        dicatat_ke_arus_kas: catatArusKas,
        expense_id: expenseId,
        dicatat_oleh: auth.user!.id,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Action tidak valid." }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}

// ── DELETE — Nonaktifkan / Aktifkan kembali suplemen ─────────────────
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id, restore } = await request.json();
    if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });
    const admin = createAdminClient();

    if (restore) {
      // Aktifkan kembali suplemen yang dinonaktifkan
      const { error } = await admin.from("supplements").update({ is_active: true, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, action: "restored" });
    }

    // Nonaktifkan (soft delete)
    const { error } = await admin.from("supplements").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, action: "deactivated" });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
