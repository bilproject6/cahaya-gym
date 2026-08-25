-- ================================================================
-- MIGRATION: Suplemen Revisi
-- Jalankan di Supabase SQL Editor
-- ================================================================

-- 1. Tambah kolom harga_beli ke tabel supplements
ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS harga_beli INTEGER NOT NULL DEFAULT 0;

-- 2. Buat tabel stock_adjustments untuk riwayat perubahan stok
CREATE TABLE IF NOT EXISTS public.stock_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE CASCADE,
  tipe TEXT NOT NULL CHECK (tipe IN ('restock', 'jual', 'koreksi_tambah', 'koreksi_kurang', 'initial')),
  qty INTEGER NOT NULL,
  stok_sebelum INTEGER NOT NULL,
  stok_sesudah INTEGER NOT NULL,
  harga_satuan INTEGER DEFAULT 0,
  total_nilai INTEGER DEFAULT 0,
  catatan TEXT,
  dicatat_ke_arus_kas BOOLEAN NOT NULL DEFAULT false,
  expense_id UUID REFERENCES public.expenses(id),
  dicatat_oleh UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.stock_adjustments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy — admin only
DROP POLICY IF EXISTS "stock_adjustments: admin all" ON public.stock_adjustments;
CREATE POLICY "stock_adjustments: admin all" ON public.stock_adjustments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. Index for performance
CREATE INDEX IF NOT EXISTS idx_stock_adj_supplement ON public.stock_adjustments(supplement_id);
CREATE INDEX IF NOT EXISTS idx_stock_adj_created ON public.stock_adjustments(created_at DESC);
