"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2, AtSign, ArrowLeft, Dumbbell } from "lucide-react";

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
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif", background: "#0A0A0A" }}>

      {/* Panel Kiri — Desktop only */}
      <div style={{
        display: "none", position: "relative", flexDirection: "column",
        justifyContent: "space-between", padding: "3rem",
        width: "55%", flexShrink: 0, overflow: "hidden",
      }} className="auth-left-panel">
        {/* BG image */}
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/hero-bg.jpg" alt="" fill style={{ objectFit: "cover", objectPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(120,10,14,0.65) 100%)" }} />
        </div>

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Image src="/logo.png" alt="Cahaya Gym" width={48} height={48} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.375rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
            CAHAYA <span style={{ color: "#B3141C" }}>GYM</span>
          </span>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "1rem" }}>
            Member Portal
          </p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.75rem, 4vw, 4.5rem)", color: "#fff", textTransform: "uppercase", lineHeight: 1.0, marginBottom: "1.25rem" }}>
            SELAMAT<br />DATANG<br /><span style={{ WebkitTextStroke: "2px #D4A73B", color: "transparent" }}>KEMBALI.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 360 }}>
            Pantau keanggotaan, riwayat pembayaran, dan akses tutorial gerakan gym — semua dalam satu tempat.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {["Pantau status keanggotaan secara online", "Riwayat pembayaran tersimpan digital", "Akses tutorial gerakan gym eksklusif"].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 20, height: 20, background: "#B3141C", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.75)" }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom info */}
        <div style={{ position: "relative", zIndex: 1, fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          SEN–KAM 06.00–22.00 &nbsp;·&nbsp; JUM 14.00–22.00 &nbsp;·&nbsp; SAB–MIN 07.00–21.00
        </div>
      </div>

      {/* Panel Kanan — Form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem 1.5rem", background: "#111" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }} className="auth-mobile-logo">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
              <Image src="/logo.png" alt="Cahaya Gym" width={40} height={40} style={{ objectFit: "contain" }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.25rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
                CAHAYA <span style={{ color: "#B3141C" }}>GYM</span>
              </span>
            </Link>
          </div>

          {/* Title */}
          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.5rem" }}>
              Member Portal
            </p>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "2rem", color: "#fff", textTransform: "uppercase", marginBottom: "0.375rem" }}>
              MASUK
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#8A8A82" }}>Gunakan nama, nomor HP, atau email</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", background: "rgba(179,20,28,0.1)", border: "1px solid rgba(179,20,28,0.4)", color: "#ef4444", fontSize: "0.875rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div>
              <label htmlFor="login-identifier" style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A82", marginBottom: "0.5rem" }}>
                Nama / No. HP / Email
              </label>
              <div style={{ position: "relative" }}>
                <AtSign size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                <input
                  id="login-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Nama / 08xx / email@..."
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  style={{
                    width: "100%", background: "#1a1a1a", border: "2px solid #333", borderRadius: 0,
                    color: "#fff", fontSize: "0.9375rem", padding: "0.875rem 1rem 0.875rem 2.5rem",
                    outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="login-password" style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A82" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#D4A73B", textDecoration: "none" }}>
                  Lupa password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  style={{
                    width: "100%", background: "#1a1a1a", border: "2px solid #333", borderRadius: 0,
                    color: "#fff", fontSize: "0.9375rem", padding: "0.875rem 3rem 0.875rem 1rem",
                    outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif",
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer", padding: "0.25rem" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{
                width: "100%", background: loading ? "#7a0d12" : "#B3141C", border: "2px solid #B3141C",
                color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase",
                padding: "1rem", borderRadius: 0, cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "background 0.2s", marginTop: "0.5rem",
              }}
            >
              {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Memproses...</> : <><Dumbbell size={18} />MASUK</>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.75rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "#222" }} />
            <span style={{ fontSize: "0.8125rem", color: "#555" }}>atau</span>
            <div style={{ flex: 1, height: 1, background: "#222" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: "0.9375rem", color: "#8A8A82" }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "#D4A73B", fontWeight: 600, textDecoration: "none" }}>
              Daftar sebagai member
            </Link>
          </p>

          <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#555", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}
            >
              <ArrowLeft size={15} /> Kembali ke beranda
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 1024px) {
          .auth-left-panel { display: flex !important; }
          .auth-mobile-logo { display: none !important; }
        }
      `}</style>
    </div>
  );
}
