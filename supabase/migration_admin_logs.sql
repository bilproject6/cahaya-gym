-- =============================================================
-- MIGRATION: Admin Activity Logs
-- Run this in Supabase SQL Editor
-- =============================================================

-- Tambah status 'non-aktif' ke members
ALTER TABLE public.members 
  DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE public.members 
  ADD CONSTRAINT members_status_check 
  CHECK (status IN ('aktif', 'expired', 'non-aktif'));

-- Update trigger agar support 'non-aktif'
CREATE OR REPLACE FUNCTION update_member_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Jangan ubah status jika masih non-aktif (belum bayar)
  IF NEW.status = 'non-aktif' THEN
    RETURN NEW;
  END IF;
  NEW.status = CASE 
    WHEN NEW.tanggal_jatuh_tempo < CURRENT_DATE THEN 'expired'
    ELSE 'aktif'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabel admin_logs
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id),
  admin_nama TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL DEFAULT 'member',
  target_id TEXT,
  target_nama TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_logs: admin all" ON public.admin_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);
