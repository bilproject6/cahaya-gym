"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Dumbbell,
  Clock,
  MapPin,
  Phone,
  Star,
  ChevronRight,
  Menu,
  X,
  Zap,
  Shield,
  Users,
  Trophy,
  MessageCircle,
  CheckCircle,
  Play,
} from "lucide-react";

// ============ ANIMATED COUNTER ============
function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
}: {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  );
}

// ============ MAIN LANDING PAGE ============
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch jumlah member aktif secara real-time
  useEffect(() => {
    fetch("/api/admin/members")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.members) {
          const aktif = data.members.filter(
            (m: { status: string; profiles?: { is_verified?: boolean } }) =>
              m.status === "aktif" && m.profiles?.is_verified
          ).length;
          setMemberCount(aktif);
        }
      })
      .catch(() => {}); // fallback diam-diam
  }, []);

  const tutorials = [
    {
      id: 1,
      title: "Bench Press",
      kategori: "Dada & Triceps",
      image: "/tutorial-bench-press.jpg",
      desc: "Latihan dasar untuk membentuk otot dada, bahu, dan triceps. Cocok untuk pemula hingga mahir.",
    },
    {
      id: 2,
      title: "Barbell Squat",
      kategori: "Kaki & Core",
      image: "/tutorial-squat.jpg",
      desc: "Raja latihan kaki. Melatih quads, hamstrings, gluteus, dan seluruh otot core secara bersamaan.",
    },
    {
      id: 3,
      title: "Deadlift",
      kategori: "Punggung & Kaki",
      image: "/tutorial-deadlift.jpg",
      desc: "Latihan compound yang melatih hampir seluruh tubuh, terutama punggung bawah dan kaki.",
    },
    {
      id: 4,
      title: "Pull-Up",
      kategori: "Punggung & Biceps",
      image: "/tutorial-pullup.jpg",
      desc: "Latihan bodyweight terbaik untuk melatih otot punggung lebar (lat) dan biceps.",
    },
  ];

  const features = [
    {
      icon: <Dumbbell className="w-6 h-6" />,
      title: "Alat Lengkap",
      desc: "Peralatan gym modern dan terawat untuk hasil latihan optimal",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Aman & Bersih",
      desc: "Lingkungan bersih, aman, dan nyaman untuk semua kalangan",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Komunitas Solid",
      desc: "Bergabung dengan komunitas fitnes yang mendukung progress kamu",
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Harga Terjangkau",
      desc: "Fasilitas premium dengan harga yang bersahabat untuk semua kalangan",
    },
  ];

  return (
    <div
      style={{ background: "var(--color-dark-800)" }}
      className="min-h-screen"
    >
      {/* ============ NAVBAR ============ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "glass border-b border-white/5" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Cahaya Gym"
                width={40}
                height={40}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <span
                className="font-bebas text-xl leading-none"
                style={{ color: "var(--color-brand-orange)" }}
              >
                CAHAYA
              </span>
              <span
                className="font-bebas text-xl leading-none ml-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                GYM
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Beranda", "Harga", "Tutorial", "Lokasi"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "rgba(255,255,255,0.85)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#ffffff")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
                }
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Masuk
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Daftar Member
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: "var(--color-text-primary)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden glass border-t animate-fade-in"
            style={{ borderColor: "var(--color-border-default)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Beranda", "Harga", "Tutorial", "Lokasi"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium py-2"
                  style={{ color: "var(--color-text-secondary)" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t"
                style={{ borderColor: "var(--color-border-default)" }}>
                <Link href="/login" className="btn-ghost text-sm text-center">
                  Masuk
                </Link>
                <Link href="/register" className="btn-primary text-sm text-center">
                  Daftar Member
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO SECTION ============ */}
      <section
        id="beranda"
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Cahaya Gym interior"
            fill
            sizes="100vw"
            className="object-cover opacity-40"
            priority
          />
          {/* Overlays */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(6,8,16,0.88) 0%, rgba(11,15,26,0.65) 50%, rgba(6,8,16,0.82) 100%)",
            }}
          />
          {/* Orange glow bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-64"
            style={{
              background:
                "linear-gradient(to top, rgba(255,107,44,0.08), transparent)",
            }}
          />
        </div>

        {/* Decorative circles */}
        <div
          className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: "var(--color-brand-orange)" }}
        />
        <div
          className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] rounded-full opacity-5 blur-3xl"
          style={{ background: "var(--color-brand-gold)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex flex-col gap-1 mb-6 animate-fade-in-up">
              <div className="inline-flex items-center gap-2">
                <span className="badge badge-orange">
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#4ade80",
                      animation: "pulse 1.5s ease-in-out infinite",
                      flexShrink: 0,
                    }}
                  />{" "}
                  BUKA SEKARANG
                </span>
              </div>
              <div
                className="text-xs font-medium"
                style={{ color: "rgba(240,234,214,0.7)", letterSpacing: "0.03em" }}
              >
                Sen–Kam 06.00–22.00 &nbsp;·&nbsp; Jum 14.00–22.00 &nbsp;·&nbsp; Sab–Min 07.00–21.00
              </div>
            </div>

            {/* Main heading */}
            <h1
              className="font-bebas mb-6 leading-none animate-fade-in-up delay-100"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
            >
              <span style={{ color: "var(--color-text-primary)" }}>
                BANGKITKAN
              </span>
              <br />
              <span className="gradient-text">POTENSIMU</span>
              <br />
              <span style={{ color: "var(--color-text-primary)" }}>
                BERSAMA KAMI
              </span>
            </h1>

            <p
              className="text-lg mb-8 max-w-xl leading-relaxed animate-fade-in-up delay-200"
              style={{ color: "rgba(255,255,255,0.82)" }}
            >
              Cahaya Gym hadir untuk menemanimu dalam setiap langkah perjalanan
              fitness. Fasilitas lengkap, harga terjangkau, komunitas yang
              mendukung.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-16 animate-fade-in-up delay-300">
              <Link href="/register" className="btn-primary">
                <Zap className="w-4 h-4" />
                Daftar Jadi Member
              </Link>
              <a
                href="https://wa.me/6281330256204?text=Halo%2C%20saya%20ingin%20tahu%20lebih%20lanjut%20tentang%20Cahaya%20Gym"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <MessageCircle className="w-4 h-4" />
                Hubungi Kami
              </a>
            </div>

            <div
              className="grid grid-cols-3 pt-8 border-t animate-fade-in-up delay-400"
              style={{ borderColor: "rgba(200,185,122,0.3)" }}
            >
              {/* Member Aktif — real-time */}
              <div className="text-center px-4">
                <div
                  className="font-bebas text-3xl md:text-4xl"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  {memberCount !== null ? `${memberCount}+` : "..."}
                </div>
                <div className="text-sm mt-1" style={{ color: "rgba(240,234,214,0.7)" }}>
                  Member Aktif
                </div>
              </div>
              {/* Separator */}
              <div
                className="text-center px-4 border-x"
                style={{ borderColor: "rgba(200,185,122,0.25)" }}
              >
                <div
                  className="font-bebas text-3xl md:text-4xl"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  <AnimatedCounter end={10} suffix="+ Tahun" />
                </div>
                <div className="text-sm mt-1" style={{ color: "rgba(240,234,214,0.7)" }}>
                  Pengalaman
                </div>
              </div>
              {/* Alat Gym */}
              <div className="text-center px-4">
                <div
                  className="font-bebas text-3xl md:text-4xl"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  <AnimatedCounter end={20} suffix="+" />
                </div>
                <div className="text-sm mt-1" style={{ color: "rgba(240,234,214,0.7)" }}>
                  Alat Gym
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <div
            className="text-xs tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            SCROLL
          </div>
          <div
            className="w-px h-8"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-brand-orange), transparent)",
            }}
          />
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card text-center group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: "rgba(255, 107, 44, 0.1)",
                    color: "var(--color-brand-orange)",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="font-semibold mb-2 text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING SECTION ============ */}
      <section id="harga" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="badge badge-orange mb-4">Harga Terjangkau</span>
            <h2
              className="font-bebas text-5xl md:text-6xl mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              PILIH PAKET
              <span className="gradient-text ml-3">KAMU</span>
            </h2>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Tidak ada biaya tersembunyi. Bayar sesuai kebutuhan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Non-Member Card */}
            <div
              className="card relative overflow-hidden group"
              style={{ border: "1px solid var(--color-border-default)" }}
            >
              <div
                className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "var(--color-text-muted)" }}
              >
                Non-Member
              </div>
              <div className="mb-6">
                <div
                  className="font-bebas text-5xl"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Rp10.000
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  per kunjungan
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Akses seluruh area gym",
                  "Semua alat fitness tersedia",
                  "Loker & toilet",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    <CheckCircle
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--color-status-active)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/6281330256204?text=Halo%2C%20saya%20ingin%20datang%20sebagai%20pengunjung%20harian"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost w-full justify-center"
              >
                Datang Langsung
              </a>
            </div>

            {/* Member Card — Featured */}
            <div
              className="relative overflow-hidden rounded-2xl group"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,107,44,0.12), rgba(255,179,71,0.05))",
                border: "1px solid rgba(255,107,44,0.3)",
              }}
            >
              {/* Popular badge */}
              <div
                className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: "var(--color-brand-orange)",
                  color: "white",
                }}
              >
                ⭐ TERPOPULER
              </div>

              {/* Glow effect */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20"
                style={{ background: "var(--color-brand-orange)" }}
              />

              <div className="relative p-6">
                <div
                  className="text-xs font-bold tracking-widest uppercase mb-4"
                  style={{ color: "var(--color-brand-orange)" }}
                >
                  Member Bulanan
                </div>
                <div className="mb-6">
                  <div
                    className="font-bebas text-5xl"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Rp100.000
                  </div>
                  <div
                    className="text-sm mt-1"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    per bulan (30 hari akses)
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Akses tidak terbatas selama 30 hari",
                    "Semua alat fitness tersedia",
                    "Dashboard member digital",
                    "Pantau status keanggotaan",
                    "Riwayat pembayaran online",
                    "Tutorial gerakan gym eksklusif",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      <CheckCircle
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--color-brand-orange)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/register" className="btn-primary w-full justify-center">
                  <Zap className="w-4 h-4" />
                  Daftar Sekarang
                </Link>
              </div>
            </div>
          </div>

          {/* Note */}
          <p
            className="text-center text-xs mt-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            * Pembayaran dilakukan langsung di gym. Admin akan mengaktifkan
            keanggotaan Anda setelah verifikasi.
          </p>
        </div>
      </section>

      {/* ============ TUTORIAL SECTION ============ */}
      <section id="tutorial" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="badge badge-orange mb-4">Tutorial Gratis</span>
              <h2
                className="font-bebas text-5xl md:text-6xl"
                style={{ color: "var(--color-text-primary)" }}
              >
                GERAKAN
                <span className="gradient-text ml-3">GYM</span>
              </h2>
            </div>
            <p
              className="max-w-xs text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              Pelajari gerakan yang benar agar latihan lebih efektif dan
              menghindari cedera.
            </p>
          </div>

          {/* Tutorial Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tutorials.map((tutorial, i) => (
              <div
                key={tutorial.id}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
                style={{
                  background: "var(--color-dark-600)",
                  border: "1px solid var(--color-border-default)",
                  animationDelay: `${i * 100}ms`,
                }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={tutorial.image}
                    alt={tutorial.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    style={{ background: "rgba(255,107,44,0.15)" }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,107,44,0.9)" }}
                    >
                      <Play className="w-5 h-5 text-white ml-1" />
                    </div>
                  </div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="badge badge-orange text-xs">
                      {tutorial.kategori}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3
                    className="font-semibold mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {tutorial.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {tutorial.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Join CTA */}
          <div
            className="mt-8 p-6 rounded-2xl text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,107,44,0.08), rgba(255,179,71,0.04))",
              border: "1px solid rgba(255,107,44,0.15)",
            }}
          >
            <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
              🔒 Member mendapatkan akses tutorial lebih lengkap & eksklusif
            </p>
            <Link href="/register" className="btn-primary">
              Daftar Sekarang &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ============ LOCATION & INFO ============ */}
      <section id="lokasi" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Info Card */}
            <div>
              <span className="badge badge-orange mb-4">Informasi Gym</span>
              <h2
                className="font-bebas text-5xl md:text-6xl mb-8"
                style={{ color: "var(--color-text-primary)" }}
              >
                TEMUKAN
                <span className="gradient-text ml-3">KAMI</span>
              </h2>

              <div className="space-y-6">
                {/* Location */}
                <div className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                    style={{
                      background: "rgba(255, 107, 44, 0.1)",
                      color: "var(--color-brand-orange)",
                    }}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="font-semibold mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Lokasi
                    </div>
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Jl. Beji Pdam No.56, RT.04/RW.04
                      <br />
                      Beji, Kec. Pakal, Surabaya
                      <br />
                      Jawa Timur 60196
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                    style={{
                      background: "rgba(255, 107, 44, 0.1)",
                      color: "var(--color-brand-orange)",
                    }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="font-semibold mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Jam Operasional
                    </div>
                    <div className="space-y-1">
                      {[
                        { day: "Senin – Kamis", time: "06.00 – 22.00", special: false },
                        { day: "Jumat", time: "14.00 – 22.00", special: true },
                        { day: "Sabtu – Minggu", time: "07.00 – 21.00", special: false },
                      ].map((schedule) => (
                        <div
                          key={schedule.day}
                          className="flex justify-between text-sm gap-8"
                        >
                          <span style={{ color: schedule.special ? "var(--color-brand-orange)" : "var(--color-text-muted)" }}>
                            {schedule.day}
                          </span>
                          <span
                            className="font-medium"
                            style={{ color: schedule.special ? "var(--color-brand-orange)" : "var(--color-text-secondary)" }}
                          >
                            {schedule.time}
                          </span>
                        </div>
                      ))}
                      <div className="text-xs mt-2 pt-2" style={{ borderTop: "1px solid var(--color-border-subtle)", color: "var(--color-text-muted)" }}>
                        * Jumat buka siang setelah sholat Jumat
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
                    style={{
                      background: "rgba(255, 107, 44, 0.1)",
                      color: "var(--color-brand-orange)",
                    }}
                  >
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div
                      className="font-semibold mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      Kontak
                    </div>
                    <a
                      href="https://wa.me/6281330256204"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "var(--color-status-active)" }}
                    >
                      <MessageCircle className="w-4 h-4" />
                      +62 813-3025-6204 (WhatsApp)
                    </a>
                  </div>
                </div>
              </div>

              {/* WA Button */}
              <div className="mt-8">
                <a
                  href="https://wa.me/6281330256204?text=Halo%20Cahaya%20Gym%2C%20saya%20ingin%20bertanya%20lebih%20lanjut"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat via WhatsApp
                </a>
              </div>
            </div>

            {/* Map — Google Maps Embed */}
              <div className="rounded-2xl overflow-hidden h-80 md:h-full min-h-64">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.3!2d112.6072!3d-7.2452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7801275a17e7e7%3A0x4dd71e73a2a99c86!2sCahaya%20Gym%20Surabaya!5e0!3m2!1sid!2sid!4v1725270000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: 280 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Cahaya Gym Surabaya"
                />
              </div>

          </div>
        </div>
      </section>

      {/* ============ CTA BANNER ============ */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className="relative overflow-hidden rounded-2xl p-10 md:p-16 text-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(217,79,30,0.25) 0%, rgba(12,18,8,0.95) 40%, rgba(26,34,16,0.98) 100%)",
              border: "2px solid rgba(200,185,122,0.3)",
            }}
          >
            {/* Decorative */}
            <div
              className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20"
              style={{ background: "var(--color-brand-orange)" }}
            />
            <div
              className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-10"
              style={{ background: "var(--color-brand-gold)" }}
            />

            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5"
                    fill="currentColor"
                    style={{ color: "#c8b97a" }}
                  />
                ))}
              </div>
              <h2
                className="font-bebas mb-4"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 4rem)",
                  color: "#f0ead6",
                  textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                SIAP MULAI{" "}
                <span style={{ color: "#d94f1e" }}>PERJALANAN</span>
                <br />
                FITNESS KAMU?
              </h2>
              <p
                className="text-base mb-8 max-w-lg mx-auto"
                style={{ color: "rgba(240,234,214,0.8)" }}
              >
                Bergabunglah dengan ratusan member yang sudah merasakan
                manfaat berlatih di Cahaya Gym. Daftar sekarang, bayar di
                gym.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/register" className="btn-primary">
                  <Dumbbell className="w-4 h-4" />
                  Daftar Member Sekarang
                </Link>
                <a
                  href="https://wa.me/6281330256204"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <MessageCircle className="w-4 h-4" />
                  Tanya via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="py-12 px-6 mt-4"
        style={{
          borderTop: "2px solid var(--color-border-default)",
          background: "var(--color-dark-900)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-8">
            {/* Kolom 1 — Logo + Tagline */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 flex-shrink-0">
                  <Image src="/logo.png" alt="Cahaya Gym" width={40} height={40} className="object-contain w-full h-full" />
                </div>
                <span className="font-bebas text-2xl" style={{ color: "var(--color-brand-orange)" }}>CAHAYA GYM</span>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                Gym dengan fasilitas lengkap dan harga terjangkau di Surabaya. Menemanimu dalam setiap langkah perjalanan fitness.
              </p>
            </div>

            {/* Kolom 2 — Navigasi Cepat */}
            <div>
              <div className="font-bebas text-lg mb-3 tracking-wider" style={{ color: "var(--color-text-primary)" }}>NAVIGASI</div>
              <div className="flex flex-col gap-2">
                {["Beranda", "Harga", "Tutorial", "Lokasi"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {item}
                  </a>
                ))}
              </div>
            </div>

            {/* Kolom 3 — Kontak & Jam */}
            <div>
              <div className="font-bebas text-lg mb-3 tracking-wider" style={{ color: "var(--color-text-primary)" }}>KONTAK</div>
              <div className="space-y-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <div>
                  <a href="https://wa.me/6281330256204" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" style={{ color: "var(--color-status-active)" }}>
                    <MessageCircle className="w-4 h-4" /> +62 813-3025-6204 (WhatsApp)
                  </a>
                </div>
                <div className="mt-3" style={{ color: "var(--color-text-muted)" }}>
                  <div className="font-semibold mb-1" style={{ color: "var(--color-text-secondary)" }}>Jam Buka:</div>
                  <div>Sen–Kam: 06.00–22.00</div>
                  <div>Jumat: 14.00–22.00</div>
                  <div>Sab–Min: 07.00–21.00</div>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright line */}
          <div
            className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderTop: "1px solid var(--color-border-subtle)", color: "var(--color-text-muted)" }}
          >
            <span>© 2026 Cahaya Gym Beji. Semua hak dilindungi.</span>
            <div className="flex gap-5">
              <Link href="/login" className="hover:text-white transition-colors">Login Member</Link>
              <Link href="/register" className="hover:text-white transition-colors">Daftar Member</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
