"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, AlertCircle, Loader2, AtSign, Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "@/lib/theme-context";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

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
    <div className="min-h-screen flex" style={{ background: "var(--color-dark-800)" }}>
      {/* Panel Kiri - Desktop only */}
      <div className="hidden lg:flex lg:w-3/5 relative flex-col justify-between p-12 overflow-hidden" style={{ background: "var(--color-dark-900)" }}>
        <div className="absolute inset-0" style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(12,18,8,0.88) 0%, rgba(26,34,16,0.72) 50%, rgba(12,18,8,0.85) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-64" style={{ background: "linear-gradient(to top, rgba(217,79,30,0.12), transparent)" }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 flex-shrink-0">
            <Image src="/logo.png" alt="Cahaya Gym" width={48} height={48} className="object-contain w-full h-full" />
          </div>
          <div>
            <div className="font-bebas text-2xl leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
            <div className="font-bebas text-2xl leading-none" style={{ color: "#f0ead6" }}>GYM</div>
          </div>
        </div>
        <div className="relative z-10">
          <h2 className="font-bebas mb-4 leading-tight" style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)", color: "var(--color-text-primary)" }}>
            BANGKITKAN<br /><span className="gradient-text">POTENSIMU</span><br />BERSAMA KAMI
          </h2>
          <p className="text-base mb-8" style={{ color: "var(--color-text-muted)" }}>Gym dengan fasilitas lengkap dan harga terjangkau di Beji.</p>
          <div className="space-y-4">
            {["Pantau status keanggotaan secara online", "Riwayat pembayaran tersimpan digital", "Akses tutorial gerakan gym eksklusif"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(217,79,30,0.2)", border: "1px solid var(--color-brand-orange)" }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#d94f1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs" style={{ color: "var(--color-text-muted)" }}>Sen-Kam 06.00-22.00 | Jum 14.00-22.00 | Sab-Min 07.00-21.00</div>
      </div>

      {/* Panel Kanan - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-xl z-50" style={{ background: "var(--color-dark-600)", border: "1px solid var(--color-border-default)", color: "var(--color-text-muted)" }} title={theme === "dark" ? "Light Mode" : "Dark Mode"}>
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          <div className="text-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex-shrink-0">
                <Image src="/logo.png" alt="Cahaya Gym" width={40} height={40} className="object-contain" />
              </div>
              <div className="text-left">
                <div className="font-bebas text-lg leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
                <div className="font-bebas text-lg leading-none" style={{ color: "var(--color-brand-orange)" }}>GYM</div>
              </div>
            </Link>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>Selamat Datang Kembali</h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Masuk menggunakan nama, nomor HP, atau email</p>
          </div>
          <div className="card">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl text-sm animate-fade-in" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <div>
                <label htmlFor="login-identifier" className="input-label">Nama / No. HP / Email</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
                  <input id="login-identifier" type="text" className="input" style={{ paddingLeft: "2.5rem" }} placeholder="Nama lengkap / 08xx / email@..." value={identifier} onChange={(e) => setIdentifier(e.target.value)} required autoComplete="username" autoCapitalize="none" />
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>Bisa menggunakan nama lengkap, nomor HP, atau email</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="login-password" className="input-label">Password</label>
                  <Link href="/forgot-password" className="text-sm font-semibold px-2 py-0.5 rounded" style={{ color: "var(--color-brand-orange)", background: "rgba(217,79,30,0.08)" }}>Lupa password?</Link>
                </div>
                <div className="relative">
                  <input id="login-password" type={showPassword ? "text" : "password"} className="input pr-12" placeholder="Masukkan password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded" style={{ color: "var(--color-text-muted)" }} onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button id="login-submit-btn" type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? (<><Loader2 className="w-4 h-4 animate-spin" />Memproses...</>) : (<><Dumbbell className="w-4 h-4" />MASUK</>)}
              </button>
            </form>
            <div className="divider my-6" />
            <p className="text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
              Belum punya akun?{" "}<Link href="/register" className="font-semibold" style={{ color: "var(--color-brand-orange)" }}>Daftar sebagai member</Link>
            </p>
          </div>
          <p className="text-center mt-6">
            <Link href="/" className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--color-text-muted)" }}><ArrowLeft className="w-4 h-4" /> Kembali ke beranda</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
