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

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan. Coba lagi.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Periksa koneksi internet.");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-dark-800)" }}
    >
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 flex-shrink-0">
              <Image src="/logo.png" alt="Cahaya Gym" width={48} height={48} className="object-contain" style={{ mixBlendMode: "screen" }} />
            </div>
            <div className="text-left">
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-text-primary)" }}>GYM</div>
            </div>
          </Link>
        </div>

        {sent ? (
          <div className="card text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: "var(--color-status-active)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Email Terkirim!
            </h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
              Link reset password telah dikirim ke <strong>{email}</strong>. Cek inbox atau folder spam kamu.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">
              Kembali ke Login
            </Link>
          </div>
        ) : (
          <div className="card">
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Lupa Password?
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              Masukkan email akunmu. Kami akan kirimkan link untuk reset password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  className="flex items-center gap-3 p-4 rounded-xl text-sm"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="input-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    id="forgot-email"
                    type="email"
                    className="input pl-10"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                id="forgot-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
                ) : (
                  <><Mail className="w-4 h-4" /> Kirim Link Reset</>
                )}
              </button>
            </form>

            <div className="divider my-5" />

            <Link href="/login" className="flex items-center justify-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
