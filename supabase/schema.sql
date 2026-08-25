-- =============================================================
-- CAHAYA GYM — DATABASE SCHEMA WITH RLS
-- Run this in Supabase SQL Editor
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- TABLE: profiles (extends auth.users)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  no_hp TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: members
-- =============================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal_daftar DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_jatuh_tempo DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'expired')),
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: payments (pembayaran member bulanan)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  bulan_dibayar TEXT NOT NULL, -- format: "2025-08" (YYYY-MM)
  jumlah INTEGER NOT NULL DEFAULT 100000,
  tanggal_bayar DATE NOT NULL DEFAULT CURRENT_DATE,
  dicatat_oleh UUID REFERENCES public.profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: daily_visitors (non-member harian)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.daily_visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT,
  jumlah_bayar INTEGER NOT NULL DEFAULT 10000,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  dicatat_oleh UUID REFERENCES public.profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: supplements
-- =============================================================
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_produk TEXT NOT NULL,
  harga_jual INTEGER NOT NULL,
  stok INTEGER NOT NULL DEFAULT 0,
  satuan TEXT NOT NULL DEFAULT 'pcs',
  stok_minimum INTEGER NOT NULL DEFAULT 5,
  deskripsi TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: supplement_sales
-- =============================================================
CREATE TABLE IF NOT EXISTS public.supplement_sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE RESTRICT,
  qty INTEGER NOT NULL DEFAULT 1,
  harga_satuan INTEGER NOT NULL,
  total_harga INTEGER NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  dicatat_oleh UUID REFERENCES public.profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: supplement_restock
-- =============================================================
CREATE TABLE IF NOT EXISTS public.supplement_restock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplement_id UUID NOT NULL REFERENCES public.supplements(id) ON DELETE RESTRICT,
  qty_masuk INTEGER NOT NULL,
  harga_beli INTEGER,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  dicatat_oleh UUID REFERENCES public.profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: expenses (pengeluaran)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kategori TEXT NOT NULL CHECK (kategori IN ('maintenance', 'listrik', 'sewa', 'gaji', 'suplemen', 'lainnya')),
  jumlah INTEGER NOT NULL,
  tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
  catatan TEXT,
  dicatat_oleh UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TABLE: tutorials
-- =============================================================
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul TEXT NOT NULL,
  deskripsi TEXT,
  tipe_file TEXT NOT NULL CHECK (tipe_file IN ('jpg', 'png', 'mp4', 'webp')),
  url_file TEXT NOT NULL,
  thumbnail_url TEXT,
  kategori_gerakan TEXT NOT NULL DEFAULT 'umum',
  urutan INTEGER NOT NULL DEFAULT 0,
  is_member_only BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- TRIGGERS: auto-update updated_at
-- =============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER supplements_updated_at
  BEFORE UPDATE ON public.supplements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- TRIGGER: auto-create profile on signup
-- =============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, no_hp, role, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nama', NEW.email),
    NEW.raw_user_meta_data->>'no_hp',
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    -- Admin verified immediately, member needs admin verification
    CASE WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN true ELSE false END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================
-- TRIGGER: auto-update member status
-- =============================================================
CREATE OR REPLACE FUNCTION update_member_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.status = CASE 
    WHEN NEW.tanggal_jatuh_tempo < CURRENT_DATE THEN 'expired'
    ELSE 'aktif'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_member_status
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION update_member_status();

-- =============================================================
-- RLS: Enable on all tables
-- =============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplement_restock ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- RLS POLICIES: profiles
-- =============================================================
-- Users can read their own profile
CREATE POLICY "profiles: read own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles: update own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles: admin read all" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can insert profiles (create member accounts)
CREATE POLICY "profiles: admin insert" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "profiles: admin update all" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: members
-- =============================================================
CREATE POLICY "members: read own" ON public.members
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "members: admin all" ON public.members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: payments
-- =============================================================
CREATE POLICY "payments: member read own" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = payments.member_id AND m.user_id = auth.uid()
    )
  );

CREATE POLICY "payments: admin all" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: daily_visitors
-- =============================================================
CREATE POLICY "daily_visitors: admin all" ON public.daily_visitors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: supplements
-- =============================================================
-- Members/public can read active supplements
CREATE POLICY "supplements: read active" ON public.supplements
  FOR SELECT USING (is_active = true);

-- Admins can do everything
CREATE POLICY "supplements: admin all" ON public.supplements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: supplement_sales
-- =============================================================
CREATE POLICY "supplement_sales: admin all" ON public.supplement_sales
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: supplement_restock
-- =============================================================
CREATE POLICY "supplement_restock: admin all" ON public.supplement_restock
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: expenses
-- =============================================================
CREATE POLICY "expenses: admin all" ON public.expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- RLS POLICIES: tutorials
-- =============================================================
-- Anyone can read public tutorials
CREATE POLICY "tutorials: read public" ON public.tutorials
  FOR SELECT USING (is_active = true AND is_member_only = false);

-- Members can read all active tutorials
CREATE POLICY "tutorials: member read all active" ON public.tutorials
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
    )
  );

-- Admins can manage tutorials
CREATE POLICY "tutorials: admin all" ON public.tutorials
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- =============================================================
-- INDEXES for performance
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_members_user_id ON public.members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_jatuh_tempo ON public.members(tanggal_jatuh_tempo);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_tanggal ON public.payments(tanggal_bayar);
CREATE INDEX IF NOT EXISTS idx_daily_visitors_tanggal ON public.daily_visitors(tanggal);
CREATE INDEX IF NOT EXISTS idx_supplement_sales_tanggal ON public.supplement_sales(tanggal);
CREATE INDEX IF NOT EXISTS idx_expenses_tanggal ON public.expenses(tanggal);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
