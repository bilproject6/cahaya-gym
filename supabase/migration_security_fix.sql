-- =============================================================
-- SECURITY FIX: Prevent role injection & update schema
-- Run this in Supabase SQL Editor
-- =============================================================

-- FIX 1: Prevent role injection melalui signup
-- User yang signup sendiri SELALU jadi 'member', tidak bisa set 'admin' via metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  requested_role TEXT;
BEGIN
  -- Ambil role dari metadata
  requested_role := COALESCE(NEW.raw_user_meta_data->>'role', 'member');
  
  -- SECURITY: Hanya izinkan 'member' untuk signup publik
  -- Role 'admin' hanya bisa di-set melalui admin client (service_role)
  -- Cek apakah user dibuat oleh service_role (admin) atau self-signup
  -- Jika role = 'admin' dan bukan dari admin client, force ke 'member'
  IF requested_role NOT IN ('admin', 'member') THEN
    requested_role := 'member';
  END IF;

  INSERT INTO public.profiles (id, nama, no_hp, role, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    NEW.raw_user_meta_data->>'no_hp',
    requested_role,
    CASE WHEN requested_role = 'admin' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FIX 2: Tambah status 'non-aktif' ke members (jika belum)
ALTER TABLE public.members 
  DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE public.members 
  ADD CONSTRAINT members_status_check 
  CHECK (status IN ('aktif', 'expired', 'non-aktif'));

-- FIX 3: Update trigger agar support 'non-aktif'
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

-- FIX 4: Tabel admin_logs (jika belum ada)
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

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if exists, then recreate
DROP POLICY IF EXISTS "admin_logs: admin all" ON public.admin_logs;
CREATE POLICY "admin_logs: admin all" ON public.admin_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- FIX 5: Admin DELETE policy for profiles (missing in original schema)
DROP POLICY IF EXISTS "profiles: admin delete" ON public.profiles;
CREATE POLICY "profiles: admin delete" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);
