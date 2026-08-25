"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, AlertCircle, Loader2, CheckCircle, User, Mail, Phone, Lock } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.nama.trim()) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama.trim(),
          email: form.email.trim(),
          no_hp: form.no_hp.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal. Coba lagi.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Periksa koneksi internet.");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--color-dark-800)" }}
      >
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
          >
            <CheckCircle className="w-10 h-10" style={{ color: "var(--color-status-active)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
            Pendaftaran Berhasil!
          </h2>
          <p className="mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Akun kamu telah dibuat dan sedang menunggu verifikasi admin.
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
            Setelah diverifikasi, kamu bisa login dan akses dashboard member.
            Silakan cek email untuk konfirmasi pendaftaran.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="btn-primary justify-center">
              Masuk ke Akun
            </Link>
            <Link href="/" className="btn-ghost justify-center">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--color-dark-800)" }}
    >
      {/* Background decorations */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "var(--color-brand-orange)" }}
      />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <Image src="/logo.jpg" alt="Cahaya Gym" width={48} height={48} className="object-cover" />
            </div>
            <div className="text-left">
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-text-primary)" }}>GYM</div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Daftar Sebagai Member
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Isi form berikut untuk mendaftar. Admin akan memverifikasi akunmu.
          </p>
        </div>

        {/* Notice */}
        <div
          className="flex gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{
            background: "rgba(255,107,44,0.06)",
            border: "1px solid rgba(255,107,44,0.15)",
            color: "var(--color-text-secondary)",
          }}
        >
          <Dumbbell className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--color-brand-orange)" }} />
          <span>
            Setelah daftar, akun kamu akan diverifikasi oleh admin sebelum bisa digunakan. Proses ini biasanya cepat.
          </span>
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl text-sm animate-fade-in"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#ef4444",
                }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Nama */}
            <div>
              <label htmlFor="reg-nama" className="input-label">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="reg-nama"
                  name="nama"
                  type="text"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Nama lengkapmu"
                  value={form.nama}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="input-label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="email@contoh.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* No HP */}
            <div>
              <label htmlFor="reg-hp" className="input-label">No. HP / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="reg-hp"
                  name="no_hp"
                  type="tel"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="08123456789"
                  value={form.no_hp}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="input-label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "var(--color-text-muted)" }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm-password" className="input-label">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Ulangi password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4" />
                  Daftar Sekarang
                </>
              )}
            </button>
          </form>

          <div className="divider my-6" />

          <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            Sudah punya akun?{" "}
            <Link href="/login" className="font-semibold" style={{ color: "var(--color-brand-orange)" }}>
              Masuk di sini
            </Link>
          </p>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
