"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Dumbbell, AlertCircle, Loader2, CheckCircle, User, Mail, Phone, Lock, ArrowLeft } from "lucide-react";

// Shared input style
const inputStyle: React.CSSProperties = {
  width: "100%", background: "#1a1a1a", border: "2px solid #333", borderRadius: 0,
  color: "#fff", fontSize: "0.9375rem", padding: "0.875rem 1rem 0.875rem 2.5rem",
  outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontFamily: "'Barlow Condensed', sans-serif",
  fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em",
  textTransform: "uppercase" as const, color: "#8A8A82", marginBottom: "0.5rem",
};

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: "", email: "", no_hp: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.name === "no_hp" ? e.target.value.replace(/[^0-9]/g, "") : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.nama.trim()) return setError("Nama lengkap wajib diisi.");
    if (form.password.length < 8) return setError("Password minimal 8 karakter.");
    if (form.password !== form.confirmPassword) return setError("Konfirmasi password tidak cocok.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: form.nama.trim(), email: form.email.trim(), no_hp: form.no_hp.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Pendaftaran gagal. Coba lagi."); setLoading(false); return; }
      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Periksa koneksi internet.");
    }
    setLoading(false);
  };

  // Success screen
  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", padding: "2rem 1.5rem", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, background: "rgba(34,197,94,0.1)", border: "3px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.75rem" }}>
            <CheckCircle size={40} color="#22c55e" />
          </div>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.75rem" }}>Berhasil</p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "2.25rem", color: "#fff", textTransform: "uppercase", marginBottom: "1rem" }}>PENDAFTARAN BERHASIL!</h2>
          <p style={{ fontSize: "0.9375rem", color: "#8A8A82", lineHeight: 1.7, marginBottom: "0.75rem" }}>
            Akun kamu telah dibuat dan sedang menunggu verifikasi admin.
          </p>
          <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.7, marginBottom: "2rem" }}>
            Setelah diverifikasi, kamu bisa login dan akses dashboard member. Silakan cek email untuk konfirmasi.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={() => router.push("/login")}
              style={{ width: "100%", background: "#B3141C", border: "2px solid #B3141C", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.875rem", borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <Dumbbell size={16} /> Pergi ke Halaman Login
            </button>
            <Link href="/" style={{ display: "block", textAlign: "center", fontSize: "0.875rem", color: "#555", textDecoration: "none", padding: "0.5rem" }}>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'Inter', sans-serif", background: "#0A0A0A" }}>

      {/* Panel Kiri — Desktop only */}
      <div style={{ display: "none", position: "relative", flexDirection: "column", justifyContent: "space-between", padding: "3rem", width: "45%", flexShrink: 0, overflow: "hidden" }} className="auth-left-panel">
        <div style={{ position: "absolute", inset: 0 }}>
          <Image src="/hero-bg.jpg" alt="" fill style={{ objectFit: "cover", objectPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(120,10,14,0.65) 100%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Image src="/logo.png" alt="Cahaya Gym" width={48} height={48} style={{ objectFit: "contain" }} />
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.375rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
            CAHAYA <span style={{ color: "#B3141C" }}>GYM</span>
          </span>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "1rem" }}>Bergabung Sekarang</p>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "clamp(2.5rem, 3.5vw, 4rem)", color: "#fff", textTransform: "uppercase", lineHeight: 1.0, marginBottom: "1.25rem" }}>
            MULAI<br />PERJALANAN<br /><span style={{ WebkitTextStroke: "2px #D4A73B", color: "transparent" }}>FITNESMU.</span>
          </h2>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 320 }}>
            Daftar sebagai member dan nikmati akses penuh — pantau keanggotaan, riwayat bayar, dan tutorial gym digital.
          </p>
          <div style={{ padding: "1.25rem 1.5rem", background: "rgba(255,255,255,0.05)", borderLeft: "3px solid #B3141C" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.5rem" }}>Member Bulanan</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: "2.5rem", color: "#fff", lineHeight: 1 }}>Rp 100.000</div>
            <div style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem" }}>per bulan · akses tak terbatas</div>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
          SEN–KAM 06.00–22.00 &nbsp;·&nbsp; JUM 14.00–22.00 &nbsp;·&nbsp; SAB–MIN 07.00–21.00
        </div>
      </div>

      {/* Panel Kanan — Form */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem 1.5rem", background: "#111", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 460, paddingTop: "1rem", paddingBottom: "1rem" }}>

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
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.5rem" }}>Bergabung Sekarang</p>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "2rem", color: "#fff", textTransform: "uppercase", marginBottom: "0.375rem" }}>DAFTAR MEMBER</h1>
            <p style={{ fontSize: "0.9rem", color: "#8A8A82" }}>Isi data diri untuk membuat akun</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", background: "rgba(179,20,28,0.1)", border: "1px solid rgba(179,20,28,0.4)", color: "#ef4444", fontSize: "0.875rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            {/* Nama */}
            <div>
              <label style={labelStyle}>Nama Lengkap *</label>
              <div style={{ position: "relative" }}>
                <User size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                <input name="nama" type="text" value={form.nama} onChange={handleChange} placeholder="Nama lengkap kamu" required style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle}>Email *</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@contoh.com" required style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"} />
              </div>
            </div>

            {/* No HP */}
            <div>
              <label style={labelStyle}>Nomor HP</label>
              <div style={{ position: "relative" }}>
                <Phone size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                <input name="no_hp" type="tel" value={form.no_hp} onChange={handleChange} placeholder="08123456789" inputMode="numeric" style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password * <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, fontSize: "0.7rem", color: "#555" }}>(min. 8 karakter)</span></label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Buat password" required minLength={8} style={{ ...inputStyle, paddingRight: "3rem" }}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer" }}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle}>Konfirmasi Password *</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                <input name="confirmPassword" type={showPassword ? "text" : "password"} value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi password" required style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                  onBlur={e => e.currentTarget.style.borderColor = "#333"} />
              </div>
            </div>

            {/* Notice */}
            <div style={{ padding: "0.875rem 1rem", background: "rgba(212,167,59,0.08)", borderLeft: "3px solid #D4A73B", fontSize: "0.8125rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              Akun akan aktif setelah diverifikasi admin. Kamu akan mendapat notifikasi via email.
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              style={{ width: "100%", background: loading ? "#7a0d12" : "#B3141C", border: "2px solid #B3141C", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "1rem", borderRadius: 0, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background 0.2s", marginTop: "0.25rem" }}
            >
              {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Mendaftarkan...</> : <><Dumbbell size={18} />DAFTAR SEKARANG</>}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: 1, background: "#222" }} />
            <span style={{ fontSize: "0.8125rem", color: "#555" }}>atau</span>
            <div style={{ flex: 1, height: 1, background: "#222" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: "0.9375rem", color: "#8A8A82" }}>
            Sudah punya akun?{" "}
            <Link href="/login" style={{ color: "#D4A73B", fontWeight: 600, textDecoration: "none" }}>Masuk di sini</Link>
          </p>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
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
