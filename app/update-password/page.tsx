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
    // Check if we have a valid session (from reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Good — user came from reset link
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Gagal mengubah password. Coba minta link baru.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
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
              <Image src="/logo.png" alt="Cahaya Gym" width={48} height={48} className="object-contain" />
            </div>
            <div className="text-left">
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
              <div className="font-bebas text-xl leading-none" style={{ color: "var(--color-text-primary)" }}>GYM</div>
            </div>
          </Link>
        </div>

        {success ? (
          <div className="card text-center py-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(34,197,94,0.1)", border: "2px solid rgba(34,197,94,0.3)" }}
            >
              <CheckCircle className="w-8 h-8" style={{ color: "var(--color-status-active)" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Password Berhasil Diubah!
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Mengalihkan ke halaman login...
            </p>
          </div>
        ) : (
          <div className="card">
            <h1 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
              Buat Password Baru
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
              Masukkan password baru untuk akunmu.
            </p>

            <form onSubmit={handleUpdate} className="space-y-4">
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
                <label htmlFor="new-password" className="input-label">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    className="input pl-10 pr-12"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div>
                <label htmlFor="confirm-new-password" className="input-label">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-text-muted)" }} />
                  <input
                    id="confirm-new-password"
                    type={showPassword ? "text" : "password"}
                    className="input pl-10"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                id="update-password-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center mt-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Lock className="w-4 h-4" /> Simpan Password Baru</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
