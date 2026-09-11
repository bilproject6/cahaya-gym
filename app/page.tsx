"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Star, MapPin, Clock, Phone, ChevronRight, MessageCircle } from "lucide-react";

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Reveal wrapper ───────────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`gym-reveal ${className}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

// ─── Section Kicker label ─────────────────────────────────────────────────────
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-barlow" style={{
      fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em",
      textTransform: "uppercase", color: "#D4A73B", marginBottom: "0.75rem",
    }}>
      {children}
    </p>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const WA_BASE = "https://wa.me/6281330256204";
  const WA_MEMBER = `${WA_BASE}?text=Halo%20Cahaya%20Gym%2C%20saya%20ingin%20daftar%20member%20bulanan.`;
  const WA_INFO   = `${WA_BASE}?text=Halo%2C%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20Cahaya%20Gym.`;
  const WA_TANYA  = `${WA_BASE}?text=Halo%20Cahaya%20Gym%2C%20saya%20ingin%20bertanya.`;
  const WA_NONMEMBER = `${WA_BASE}?text=Halo%2C%20saya%20ingin%20datang%20sebagai%20pengunjung%20non-member.`;

  const navLinks = ["Beranda", "Harga", "Tutorial", "Lokasi"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#F5F3EE", color: "#0A0A0A" }}>

      {/* ══════════════════════════════════════════════════════════
          NAVBAR
          ══════════════════════════════════════════════════════════ */}
      <nav
        id="navbar"
        style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "#0A0A0A",
          borderBottom: "3px solid #B3141C",
          transition: "box-shadow 0.3s",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.5)" : "none",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <Image src="/logo.png" alt="Cahaya Gym logo" width={40} height={40} style={{ objectFit: "contain" }} />
            <span className="font-barlow" style={{ color: "#fff", fontSize: "1.25rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              CAHAYA <span style={{ color: "#B3141C" }}>GYM</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="hidden-mobile">
            {navLinks.map(item => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="font-barlow"
                style={{ color: "#aaa", fontSize: "0.9375rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#D4A73B")}
                onMouseLeave={e => (e.currentTarget.style.color = "#aaa")}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }} className="hidden-mobile">
            <Link href="/login" className="gym-btn-outline-white" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem" }}>Masuk</Link>
            <Link href="/register" className="gym-btn-red" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8125rem" }}>Daftar Member</Link>
          </div>

          {/* Hamburger */}
          <button
            id="hamburger-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
            style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: "0.5rem" }}
            className="show-mobile"
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: "#111", borderTop: "1px solid #222", padding: "1rem 1.5rem 1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "1rem" }}>
              {navLinks.map(item => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="font-barlow"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "0.625rem 0", borderBottom: "1px solid #222" }}
                >
                  {item}
                </a>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <Link href="/login" className="gym-btn-outline-white" style={{ width: "100%", justifyContent: "center" }}>Masuk</Link>
              <Link href="/register" className="gym-btn-red" style={{ width: "100%", justifyContent: "center" }}>Daftar Member</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════════════════════════
          HERO
          ══════════════════════════════════════════════════════════ */}
      <section id="beranda" style={{ position: "relative", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        {/* Background image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image src="/hero-bg.jpg" alt="Cahaya Gym interior" fill style={{ objectFit: "cover", objectPosition: "center" }} priority />
          {/* Overlay gradient */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.88) 0%, rgba(10,10,10,0.75) 50%, rgba(120,20,20,0.35) 100%)" }} />
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", paddingTop: "8rem", paddingBottom: "0", width: "100%" }}>
          {/* Kicker label */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: "1px solid rgba(212,167,59,0.5)", padding: "0.375rem 0.875rem", marginBottom: "1.5rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
            <span className="font-barlow" style={{ color: "#D4A73B", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Gym Lokal Surabaya · Buka Setiap Hari
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-anton" style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", color: "#fff", lineHeight: 1.0, marginBottom: "1.25rem", textTransform: "uppercase" }}>
            LATIHAN KERAS.<br />
            HASIL LEBIH{" "}
            <span style={{ WebkitTextStroke: "2px #D4A73B", color: "transparent" }}>KERAS.</span>
          </h1>

          {/* Sub */}
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.0625rem", maxWidth: 480, lineHeight: 1.6, marginBottom: "2rem" }}>
            Fasilitas gym lengkap, harga terjangkau, komunitas solid. Mulai perjalanan fitnesmu di Cahaya Gym — gym terpercaya di Surabaya.
          </p>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", marginBottom: "4rem" }}>
            <a href={WA_MEMBER} target="_blank" rel="noopener noreferrer" className="gym-btn-red">
              Daftar Jadi Member
            </a>
            <a href={WA_INFO} target="_blank" rel="noopener noreferrer" className="gym-btn-outline-white">
              <MessageCircle size={16} /> Hubungi via WhatsApp
            </a>
          </div>
        </div>

        {/* Stats panel */}
        <div style={{ position: "relative", zIndex: 1, background: "rgba(0,0,0,0.65)", borderTop: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
            {[
              { num: "500+", label: "Member Aktif" },
              { num: "5+ Tahun", label: "Tahun Berdiri" },
              { num: "30+ Unit", label: "Alat Gym" },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: "1.5rem 1rem", textAlign: "center",
                borderRight: i < 2 ? "1px solid rgba(255,255,255,0.1)" : "none",
              }}>
                <div className="font-barlow" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 700, color: "#fff" }}>{stat.num}</div>
                <div style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", marginTop: "0.25rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          MARQUEE
          ══════════════════════════════════════════════════════════ */}
      <div style={{ background: "#B3141C", borderTop: "3px solid #0A0A0A", borderBottom: "3px solid #0A0A0A", overflow: "hidden", padding: "0.875rem 0" }}>
        <div className="gym-marquee-track" aria-hidden="true">
          {[1, 2].map(idx => (
            <div key={idx} className="font-barlow" style={{ display: "flex", alignItems: "center", gap: "1.5rem", paddingRight: "1.5rem", whiteSpace: "nowrap", fontWeight: 700, fontSize: "0.9375rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff" }}>
              {["CAHAYA GYM", "ALAT LENGKAP", "HARGA TERJANGKAU", "BUKA SETIAP HARI", "KOMUNITAS SOLID", "MULAI SEKARANG"].map((text, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  {text}
                  <Star size={12} fill="#D4A73B" stroke="none" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          KENAPA CAHAYA GYM
          ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0A0A0A", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal>
            <Kicker>Keunggulan Kami</Kicker>
            <h2 className="font-anton" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "#fff", textTransform: "uppercase", marginBottom: "3rem" }}>
              KENAPA CAHAYA GYM?
            </h2>
          </Reveal>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {[
              { num: "01", title: "Alat Lengkap", desc: "30+ unit alat fitness modern mencakup cardio, beban, dan functional training untuk semua level." },
              { num: "02", title: "Aman & Bersih", desc: "Fasilitas dirawat rutin, lingkungan bersih, dan aman — nyaman untuk latihan harian." },
              { num: "03", title: "Komunitas Solid", desc: "Bergabung bersama ratusan member aktif yang saling mendukung dan memotivasi satu sama lain." },
              { num: "04", title: "Harga Terjangkau", desc: "Member bulanan hanya Rp100.000, non-member Rp10.000/kunjungan. Gym berkualitas tanpa harga mahal." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="gym-feature-col" style={{
                  padding: "2.5rem 2rem",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  height: "100%",
                }}>
                  <div className="font-barlow" style={{ fontSize: "3rem", fontWeight: 700, color: "#B3141C", lineHeight: 1, marginBottom: "1rem" }}>{item.num}</div>
                  <h3 className="font-anton" style={{ fontSize: "1.375rem", color: "#fff", textTransform: "uppercase", marginBottom: "0.75rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "#8A8A82", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          HARGA
          ══════════════════════════════════════════════════════════ */}
      <section id="harga" style={{ background: "#F5F3EE", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Kicker>Harga Terjangkau</Kicker>
            <h2 className="font-anton" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "#0A0A0A", textTransform: "uppercase" }}>
              PILIH PAKETMU.
            </h2>
          </Reveal>

          <Reveal>
            <div style={{ border: "3px solid #0A0A0A", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
              {/* Non-member */}
              <div className="gym-pricing-left" style={{ padding: "2.5rem 2rem", background: "#fff", borderRight: "3px solid #0A0A0A" }}>
                <div className="font-barlow" style={{ fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8A8A82", marginBottom: "1rem" }}>Non-Member</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.375rem", marginBottom: "0.375rem" }}>
                  <span className="font-anton" style={{ fontSize: "3.5rem", color: "#0A0A0A", lineHeight: 1 }}>10K</span>
                  <span style={{ fontSize: "0.9375rem", color: "#8A8A82", marginBottom: "0.5rem" }}>/kunjungan</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#8A8A82", marginBottom: "1.75rem" }}>Bayar setiap kunjungan, tanpa komitmen.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                  {["Akses semua alat gym", "Bebas pilih waktu latihan", "Tanpa pendaftaran", "Bayar per kunjungan"].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <ChevronRight size={14} color="#B3141C" />
                      <span style={{ fontSize: "0.9375rem", color: "#333" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href={WA_NONMEMBER} target="_blank" rel="noopener noreferrer" className="gym-btn-outline-black" style={{ width: "100%", justifyContent: "center" }}>
                  Kunjungi Sekarang
                </a>
              </div>

              {/* Member bulanan */}
              <div style={{ padding: "2.5rem 2rem", background: "#0A0A0A", position: "relative", overflow: "hidden" }}>
                {/* Badge */}
                <div style={{ position: "absolute", top: "1rem", right: "1rem" }}>
                  <span className="font-barlow" style={{ background: "#B3141C", color: "#fff", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.25rem 0.75rem" }}>
                    Terpopuler
                  </span>
                </div>
                <div className="font-barlow" style={{ fontSize: "0.8125rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "1rem" }}>Member Bulanan</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: "0.375rem", marginBottom: "0.375rem" }}>
                  <span className="font-anton" style={{ fontSize: "3.5rem", color: "#fff", lineHeight: 1 }}>100K</span>
                  <span style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem" }}>/bulan</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)", marginBottom: "1.75rem" }}>Akses tak terbatas, hemat lebih banyak.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
                  {["Akses tak terbatas 30 hari", "Semua alat gym tersedia", "Jam operasional penuh", "Komunitas member aktif", "Bisa perpanjang kapan saja"].map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                      <ChevronRight size={14} color="#D4A73B" />
                      <span style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/register" className="gym-btn-red" style={{ width: "100%", justifyContent: "center" }}>
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TIGA LANGKAH MUDAH
          ══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0A0A0A", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <Kicker>Cara Bergabung</Kicker>
            <h2 className="font-anton" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "#fff", textTransform: "uppercase" }}>
              TIGA LANGKAH MUDAH.
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0" }}>
            {[
              { step: "01", title: "Datang ke Gym", desc: "Kunjungi Cahaya Gym di Surabaya. Tidak perlu janji dulu — langsung datang dan kami siap menyambut." },
              { step: "02", title: "Pilih Paket", desc: "Pilih paket Non-Member (Rp10K/kunjungan) atau Member Bulanan (Rp100K/bulan) sesuai kebutuhanmu." },
              { step: "03", title: "Mulai Latihan", desc: "Langsung gunakan semua fasilitas — alat lengkap, suasana bersemangat, komunitas yang mendukung." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="gym-step-col" style={{
                  padding: "2.5rem 2rem",
                  borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  textAlign: "center", height: "100%",
                }}>
                  <div className="font-anton" style={{
                    fontSize: "6rem", color: "transparent",
                    WebkitTextStroke: "2px #D4A73B",
                    lineHeight: 1, marginBottom: "1.25rem",
                  }}>
                    {item.step}
                  </div>
                  <h3 className="font-anton" style={{ fontSize: "1.5rem", color: "#fff", textTransform: "uppercase", marginBottom: "0.875rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "#8A8A82", lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TUTORIAL GERAKAN
          ══════════════════════════════════════════════════════════ */}
      <section id="tutorial" style={{ background: "#F5F3EE", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: "2.5rem" }}>
            <Kicker>Tutorial Gratis</Kicker>
            <h2 className="font-anton" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "#0A0A0A", textTransform: "uppercase" }}>
              GERAKAN GYM.
            </h2>
          </Reveal>

          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", border: "3px solid #0A0A0A" }}>
              {[
                { img: "/tutorial-squat.jpg", cat: "Kaki", title: "Squat" },
                { img: "/tutorial-bench-press.jpg", cat: "Dada", title: "Bench Press" },
                { img: "/tutorial-deadlift.jpg", cat: "Punggung", title: "Deadlift" },
                { img: "/tutorial-pullup.jpg", cat: "Punggung & Bisep", title: "Pull-Up" },
              ].map((item, i) => (
                <div key={i} className="gym-tutorial-card" style={{
                  position: "relative", overflow: "hidden", aspectRatio: "4/5",
                  borderRight: i < 3 ? "3px solid #0A0A0A" : "none",
                  cursor: "pointer",
                }}>
                  <img src={item.img} alt={item.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {/* Overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "1.25rem 1rem" }}>
                    <div className="font-barlow" style={{ fontSize: "0.7rem", fontWeight: 700, color: "#D4A73B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.25rem" }}>{item.cat}</div>
                    <h3 className="font-anton" style={{ fontSize: "1.5rem", color: "#fff", textTransform: "uppercase" }}>{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LOKASI & KONTAK
          ══════════════════════════════════════════════════════════ */}
      <section id="lokasi" style={{ background: "#0A0A0A", padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <Reveal style={{ marginBottom: "2.5rem" }}>
            <Kicker>Temukan Kami</Kicker>
            <h2 className="font-anton" style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", color: "#fff", textTransform: "uppercase" }}>
              LOKASI & KONTAK.
            </h2>
          </Reveal>

          <Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", border: "3px solid rgba(255,255,255,0.12)" }}>
              {/* Info */}
              <div className="gym-location-left" style={{ padding: "2.5rem 2rem", background: "#0A0A0A", borderRight: "3px solid rgba(255,255,255,0.12)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                  <div>
                    <div className="font-barlow" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: "#D4A73B", textTransform: "uppercase", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <MapPin size={12} /> Lokasi
                    </div>
                    <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
                      Surabaya, Jawa Timur
                    </p>
                  </div>
                  <div>
                    <div className="font-barlow" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: "#D4A73B", textTransform: "uppercase", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Clock size={12} /> Jam Operasional
                    </div>
                    <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.8 }}>
                      Senin – Kamis: 06.00 – 22.00<br />
                      Jumat: 14.00 – 22.00<br />
                      Sabtu – Minggu: 07.00 – 21.00
                    </p>
                  </div>
                  <div>
                    <div className="font-barlow" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: "#D4A73B", textTransform: "uppercase", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                      <Phone size={12} /> Kontak
                    </div>
                    <a href={WA_BASE} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
                      +62 813-3025-6204 (WhatsApp)
                    </a>
                  </div>
                </div>
                <div style={{ marginTop: "2rem" }}>
                  <a href={WA_TANYA} target="_blank" rel="noopener noreferrer" className="gym-btn-red" style={{ width: "100%", justifyContent: "center" }}>
                    <MessageCircle size={16} /> Chat via WhatsApp
                  </a>
                </div>
              </div>

              {/* Map */}
              <div style={{ overflow: "hidden", minHeight: 320 }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.3!2d112.6072!3d-7.2452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTQnNDIuNyJTIDExMsKwMzYnMjUuOSJF!5e0!3m2!1sid!2sid!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0, display: "block", minHeight: 320, filter: "grayscale(30%) contrast(1.05)" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Cahaya Gym"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          CTA PENUTUP
          ══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", padding: "7rem 1.5rem", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Image src="/hero-bg.jpg" alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(120,10,14,0.75) 100%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <Kicker>Bergabung Sekarang</Kicker>
            <h2 className="font-anton" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#fff", textTransform: "uppercase", lineHeight: 1.05, marginBottom: "1.25rem" }}>
              SIAP MULAI<br />LATIHANMU?
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "rgba(255,255,255,0.7)", marginBottom: "2.25rem", maxWidth: 480, margin: "0 auto 2.25rem" }}>
              Jangan tunda lagi. Mulai hari ini, ubah kebiasaanmu dan rasakan perbedaannya.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" className="gym-btn-red" style={{ fontSize: "1rem", padding: "1rem 2rem" }}>
                Daftar Member Sekarang
              </Link>
              <a href={WA_INFO} target="_blank" rel="noopener noreferrer" className="gym-btn-outline-white" style={{ fontSize: "1rem", padding: "1rem 2rem" }}>
                <MessageCircle size={18} /> Tanya via WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
          ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#0A0A0A", borderTop: "3px solid #B3141C" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "3.5rem 1.5rem 2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "2.5rem", marginBottom: "2.5rem" }}>
            {/* Col 1: Logo + tagline */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <Image src="/logo.png" alt="Cahaya Gym" width={36} height={36} style={{ objectFit: "contain" }} />
                <span className="font-barlow" style={{ color: "#fff", fontSize: "1.125rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  CAHAYA <span style={{ color: "#B3141C" }}>GYM</span>
                </span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "#8A8A82", lineHeight: 1.7 }}>
                Latihan keras, hasil lebih keras.<br />Gym terpercaya di Surabaya sejak 2019.
              </p>
            </div>

            {/* Col 2: Navigasi */}
            <div>
              <div className="font-barlow" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "1rem" }}>Navigasi</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {navLinks.map(item => (
                  <a key={item} href={`#${item.toLowerCase()}`}
                    style={{ fontSize: "0.9375rem", color: "#8A8A82", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#8A8A82")}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Col 3: Kontak */}
            <div>
              <div className="font-barlow" style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#D4A73B", marginBottom: "1rem" }}>Kontak</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <a href={WA_BASE} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9375rem", color: "#8A8A82", textDecoration: "none" }}>
                  <MessageCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 6 }} />
                  +62 813-3025-6204
                </a>
                <p style={{ fontSize: "0.875rem", color: "#8A8A82", lineHeight: 1.6, margin: 0 }}>
                  Sen–Kam: 06.00–22.00<br />
                  Jum: 14.00–22.00<br />
                  Sab–Min: 07.00–21.00
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ fontSize: "0.8125rem", color: "#555", margin: 0 }}>
              © {new Date().getFullYear()} Cahaya Gym. Hak cipta dilindungi.
            </p>
            <div style={{ display: "flex", gap: "1.25rem" }}>
              <Link href="/login" style={{ fontSize: "0.8125rem", color: "#555", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#555")}
              >Login</Link>
              <Link href="/register" style={{ fontSize: "0.8125rem", color: "#555", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "#555")}
              >Daftar Member</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .gym-feature-col { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .gym-tutorial-card { border-right: none !important; border-bottom: 3px solid #0A0A0A; }
          .gym-pricing-left { border-right: none !important; border-bottom: 3px solid #0A0A0A; }
          .gym-step-col { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.08); }
          .gym-location-left { border-right: none !important; border-bottom: 3px solid rgba(255,255,255,0.12); }
        }
        @media (min-width: 768px) {
          .show-mobile { display: none !important; }
        }
        .gym-tutorial-card { overflow: hidden; }
      `}</style>
    </div>
  );
}
