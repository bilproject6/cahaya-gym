"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowLeft, ShieldAlert } from "lucide-react";

const WA_ADMIN = "https://wa.me/6281330256204?text=Halo%20Admin%20Cahaya%20Gym%2C%20saya%20ingin%20minta%20reset%20password%20akun%20saya.";

export default function ForgotPasswordPage() {
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

        {/* Card */}
        <div style={{ background: "#111", border: "2px solid #222", padding: "2.5rem 2rem", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, background: "rgba(179,20,28,0.1)", border: "3px solid rgba(179,20,28,0.35)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
            <ShieldAlert size={30} color="#B3141C" />
          </div>

          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.75rem" }}>
            Reset Password
          </p>

          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: "1.75rem", color: "#fff", textTransform: "uppercase", marginBottom: "1rem" }}>
            LUPA PASSWORD?
          </h1>

          <p style={{ fontSize: "0.9375rem", color: "#8A8A82", lineHeight: 1.75, marginBottom: "0.75rem" }}>
            Password hanya bisa direset oleh <strong style={{ color: "#fff" }}>admin Cahaya Gym</strong>.
          </p>

          <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.7, marginBottom: "2rem" }}>
            Hubungi admin via WhatsApp — sebutkan nama atau nomor HP yang terdaftar, dan admin akan membantu resetkan password kamu.
          </p>

          <a
            href={WA_ADMIN}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", width: "100%", background: "#B3141C", border: "2px solid #B3141C", color: "#fff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "1rem", textDecoration: "none", transition: "background 0.2s", marginBottom: "1rem" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#8f0f15")}
            onMouseLeave={e => (e.currentTarget.style.background = "#B3141C")}
          >
            <MessageCircle size={18} /> Hubungi Admin via WhatsApp
          </a>

          <div style={{ padding: "0.875rem", background: "rgba(212,167,59,0.07)", borderLeft: "3px solid #D4A73B", textAlign: "left", fontSize: "0.8125rem", color: "#8A8A82", lineHeight: 1.6 }}>
            <strong style={{ color: "#D4A73B", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>TIP:</strong> Sebutkan nama lengkap atau nomor HP yang terdaftar saat menghubungi admin.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem", color: "#555", textDecoration: "none" }}>
            <ArrowLeft size={15} /> Kembali ke login
          </Link>
        </div>
      </div>
    </div>
  );
}
