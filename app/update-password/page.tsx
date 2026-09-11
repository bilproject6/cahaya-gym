"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") { /* valid */ }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password minimal 8 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi password tidak cocok.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError("Gagal mengubah password. Coba minta link baru."); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "#1a1a1a", border: "2px solid #333", borderRadius: 0,
    color: "#fff", fontSize: "0.9375rem", padding: "0.875rem 3rem 0.875rem 2.5rem",
    outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif",
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

        {success ? (
          <div style={{ background: "#111", border: "2px solid #222", padding: "2.5rem 2rem", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, background: "rgba(34,197,94,0.1)", border: "3px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.75rem" }}>Berhasil</p>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.75rem", color: "#fff", textTransform: "uppercase", marginBottom: "1rem" }}>PASSWORD DIUBAH!</h2>
            <p style={{ fontSize: "0.9375rem", color: "#8A8A82", lineHeight: 1.7, marginBottom: "1.5rem" }}>
              Password baru kamu sudah aktif. Mengarahkan ke halaman login...
            </p>
            <Loader2 size={24} color="#B3141C" style={{ animation: "spin 1s linear infinite", margin: "0 auto" }} />
          </div>
        ) : (
          <div style={{ background: "#111", border: "2px solid #222", padding: "2.5rem 2rem" }}>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.5rem" }}>Reset Password</p>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.75rem", color: "#fff", textTransform: "uppercase", marginBottom: "0.5rem" }}>BUAT PASSWORD BARU</h1>
            <p style={{ fontSize: "0.9rem", color: "#8A8A82", marginBottom: "1.75rem", lineHeight: 1.6 }}>
              Masukkan password baru yang kuat — minimal 8 karakter.
            </p>

            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.875rem 1rem", marginBottom: "1.25rem", background: "rgba(179,20,28,0.1)", border: "1px solid rgba(179,20,28,0.4)", color: "#ef4444", fontSize: "0.875rem" }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />{error}
              </div>
            )}

            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A82", marginBottom: "0.5rem" }}>
                  Password Baru *
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 karakter" required minLength={8} style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                    onBlur={e => e.currentTarget.style.borderColor = "#333"} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#555", cursor: "pointer" }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A82", marginBottom: "0.5rem" }}>
                  Konfirmasi Password *
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }} />
                  <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" required style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = "#B3141C"}
                    onBlur={e => e.currentTarget.style.borderColor = "#333"} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{ width: "100%", background: loading ? "#7a0d12" : "#B3141C", border: "2px solid #B3141C", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "1rem", borderRadius: 0, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", transition: "background 0.2s" }}
              >
                {loading ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />Menyimpan...</> : "SIMPAN PASSWORD BARU"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#555", textDecoration: "none" }}>
                Kembali ke login
              </Link>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
