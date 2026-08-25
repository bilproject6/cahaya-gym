"use client";

import Link from "next/link";
import { Dumbbell, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-dark-800)" }}
    >
      {/* Decorative elements */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "var(--color-brand-orange)" }}
      />

      <div className="text-center max-w-md animate-fade-in-up">
        {/* 404 number */}
        <div
          className="font-bebas text-8xl leading-none mb-4"
          style={{
            background: "linear-gradient(135deg, #ff6b2c, #ffb347)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(255,107,44,0.08)", border: "1px solid rgba(255,107,44,0.15)" }}
        >
          <Dumbbell className="w-10 h-10" style={{ color: "var(--color-brand-orange)" }} />
        </div>

        <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
          Sepertinya kamu salah ruangan! Halaman yang kamu cari tidak ada atau sudah dipindahkan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-ghost"
          >
            <ArrowLeft className="w-4 h-4" />
            Halaman Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
}
