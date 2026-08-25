-- =============================================================
-- CAHAYA GYM — SEED DATA FOR TESTING
-- Jalankan file ini SETELAH schema.sql berhasil dijalankan
-- =============================================================

-- ============================================================
-- CATATAN PENTING:
-- 1. Buat user admin DULU melalui Supabase Auth Dashboard atau register
-- 2. Copy UUID user admin dari Supabase Auth
-- 3. Update profile user tersebut jadi admin:
--
-- UPDATE public.profiles
-- SET role = 'admin', is_verified = true, nama = 'Admin Cahaya'
-- WHERE id = 'UUID-USER-KAMU-DI-SINI';
-- ============================================================

-- ============================================================
-- SAMPLE: Suplemen
-- ============================================================
INSERT INTO public.supplements (nama_produk, harga_jual, stok, satuan, stok_minimum, deskripsi)
VALUES
  ('Whey Protein Gold Standard 1kg', 450000, 12, 'kaleng', 3, 'Protein supplement premium untuk muscle recovery'),
  ('Creatine Monohydrate 500g', 180000, 8, 'kaleng', 2, 'Meningkatkan kekuatan dan performa latihan'),
  ('BCAA Amino X 30 serv', 120000, 5, 'pack', 2, 'Branched Chain Amino Acids untuk muscle recovery'),
  ('Pre-Workout C4 Original', 200000, 15, 'pack', 5, 'Meningkatkan energi dan fokus sebelum latihan'),
  ('Protein Bar Quest 1 box', 95000, 20, 'kotak', 5, 'Protein bar praktis untuk snack sehat'),
  ('Glutamine 300g', 150000, 3, 'pack', 3, 'Mendukung pemulihan otot dan sistem imun')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE: Daily visitors hari ini (untuk test dashboard)
-- ============================================================
INSERT INTO public.daily_visitors (nama, jumlah_bayar, tanggal, catatan)
VALUES
  ('Budi Santoso', 10000, CURRENT_DATE, NULL),
  ('Rika Amelia', 10000, CURRENT_DATE, NULL),
  (NULL, 10000, CURRENT_DATE, 'Pengunjung tanpa nama'),
  ('Deni Kurniawan', 15000, CURRENT_DATE, 'Bayar lebih')
ON CONFLICT DO NOTHING;

-- Visitors minggu lalu
INSERT INTO public.daily_visitors (nama, jumlah_bayar, tanggal)
VALUES
  ('Sari', 10000, CURRENT_DATE - 1),
  ('Hendra', 10000, CURRENT_DATE - 1),
  ('Wahyu', 10000, CURRENT_DATE - 2),
  ('Fitri', 10000, CURRENT_DATE - 3),
  ('Bambang', 10000, CURRENT_DATE - 5)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE: Supplement Sales (bulan ini)
-- ============================================================
INSERT INTO public.supplement_sales (supplement_id, qty, harga_satuan, total_harga, tanggal)
SELECT 
  id, 
  1,
  harga_jual,
  harga_jual * 1,
  CURRENT_DATE - (floor(random() * 20))::int
FROM public.supplements
WHERE nama_produk = 'Whey Protein Gold Standard 1kg'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.supplement_sales (supplement_id, qty, harga_satuan, total_harga, tanggal)
SELECT 
  id, 
  2,
  harga_jual,
  harga_jual * 2,
  CURRENT_DATE - (floor(random() * 15))::int
FROM public.supplements
WHERE nama_produk = 'BCAA Amino X 30 serv'
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================
-- SAMPLE: Expenses bulan ini
-- ============================================================
INSERT INTO public.expenses (kategori, jumlah, tanggal, catatan)
VALUES
  ('listrik', 450000, DATE_TRUNC('month', CURRENT_DATE)::date + 3, 'Tagihan listrik bulan ini'),
  ('maintenance', 200000, DATE_TRUNC('month', CURRENT_DATE)::date + 7, 'Servis treadmill'),
  ('sewa', 2500000, DATE_TRUNC('month', CURRENT_DATE)::date + 1, 'Sewa tempat bulanan'),
  ('lainnya', 75000, CURRENT_DATE - 2, 'Pembelian alat kebersihan')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFIKASI: Cek data sudah masuk
-- ============================================================
SELECT 'supplements' as tabel, COUNT(*) as jumlah FROM public.supplements
UNION ALL
SELECT 'daily_visitors', COUNT(*) FROM public.daily_visitors
UNION ALL
SELECT 'expenses', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'supplement_sales', COUNT(*) FROM public.supplement_sales;
