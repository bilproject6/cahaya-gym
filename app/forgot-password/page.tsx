"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Mail, AlertCircle, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Terjadi kesalahan. Coba lagi."); }
      else { setSent(true); }
    } catch {
      setError("Terjadi kesalahan jaringan. Periksa koneksi internet.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0A0A", padding: "2rem 1.5rem", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <Image src="/logo.png" alt="Cahaya Gym" width={44} height={44} style={{ objectFit: "contain" }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1.25rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
              CAHAYA <span style={{ color: "#B3141C" }}>GYM</span>
            </span>
          </Link>
        </div>

        {sent ? (
          <div style={{ background: "#111", border: "2px solid #222", padding: "2.5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, background: "rgba(34,197,94,0.1)", border: "3px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.75rem" }}>Berhasil</p>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.75rem", color: "#fff", textTransform: "uppercase", marginBottom: "1rem" }}>EMAIL TERKIRIM!</h2>
            <p style={{ fontSize: "0.9375rem", color: "#8A8A82", lineHeight: 1.7, marginBottom: "1.75rem" }}>
              Link reset password telah dikirim ke <strong style={{ color: "#fff" }}>{email}</strong>. Cek inbox atau folder spam kamu.
            </p>
            <Link href="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", background: "#B3141C", border: "2px solid #B3141C", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.875rem", textDecoration: "none" }}>
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <div style={{ background: "#111", border: "2px solid #222", padding: "2.5rem 2rem" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.5rem" }}>Reset Password</p>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.75rem", color: "#fff", textTransform: "uppercase", marginBottom: "0.5rem" }}>LUPA PASSWORD?</h1>
            <p style={{ fontSize: "0.9rem", color: "#8A8A82", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              Masukkan email yang terdaftar. Kami akan mengirimkan link untuk reset password.
            </p>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", background: "rgba(179,20,28,0.1)", border: "1px solid rgba(179,20,28,0.4)", color: "#ef4444", fontSize: "0.875rem" }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label htmlFor="forgot-email" style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A82", marginBottom: "0.5rem" }}>
                  Alamat Email
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@contoh.com"
                    required
                    style={{ width: "100%", background: "#1a1a1a", border: "2px solid #333", borderRadius: 0, color: "#fff", fontSize: "0.9375rem", padding: "0.875rem 1rem 0.875rem 2.5rem", outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                    onBlur={e => e.currentTarget.style.borderColor = "#333"}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", background: loading ? "#7a0d12" : "#B3141C", border: "2px solid #B3141C", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "1rem", borderRadius: 0, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background 0.2s" }}
              >
                {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Mengirim...</> : "KIRIM LINK RESET"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#555", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#555")}
              >
                <ArrowLeft size={15} /> Kembali ke login
              </Link>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
