"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, AlertCircle, Loader2, AtSign } from "lucide-react";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal. Coba lagi.");
        setLoading(false);
        return;
      }

      // Redirect berdasarkan role
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/member/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Periksa koneksi internet kamu.");
      setLoading(false);
    }
  };

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
      <div
        className="fixed bottom-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "var(--color-brand-gold)" }}
      />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <Image src="/logo.jpg" alt="Cahaya Gym" width={48} height={48} className="object-cover" />
            </div>
            <div className="text-left">
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-brand-orange)" }}>
                CAHAYA
              </div>
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-text-primary)" }}>
                GYM
              </div>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Selamat Datang Kembali
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Masuk menggunakan nama, nomor HP, atau email
          </p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error message */}
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

            {/* Identifier */}
            <div>
              <label htmlFor="login-identifier" className="input-label">
                Nama / No. HP / Email
              </label>
              <div className="relative">
                <AtSign
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  id="login-identifier"
                  type="text"
                  className="input"
                  style={{ paddingLeft: "2.5rem" }}
                  placeholder="Nama lengkap / 08xx / email@..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                />
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                Bisa menggunakan nama lengkap, nomor HP, atau email
              </p>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="login-password" className="input-label">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: "var(--color-text-muted)" }}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Dumbbell className="w-4 h-4" />
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-6" />

          {/* Register link */}
          <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold"
              style={{ color: "var(--color-brand-orange)" }}
            >
              Daftar sebagai member
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6">
          <Link href="/" className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            ← Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  );
}
