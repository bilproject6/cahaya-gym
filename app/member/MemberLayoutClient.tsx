"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  CreditCard,
  Dumbbell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

interface MemberLayoutClientProps {
  children: React.ReactNode;
  profile: { nama: string; role: string; is_verified: boolean };
  userEmail: string;
}

const navItems = [
  { href: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/member/pembayaran", label: "Riwayat Bayar", icon: CreditCard },
  { href: "/member/tutorial", label: "Tutorial", icon: Dumbbell },
  { href: "/member/profil", label: "Profil", icon: User },
];

export default function MemberLayoutClient({
  children,
  profile,
  userEmail,
}: MemberLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`sidebar ${mobile ? "relative w-full min-h-0 border-0" : ""}`}>
      {/* Logo */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
        <div className="w-9 h-9 flex-shrink-0 flex-shrink-0">
          <Image src="/logo.png" alt="Cahaya Gym" width={36} height={36} className="object-contain" />
        </div>
        <div>
          <div className="font-bebas text-base leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
          <div className="font-bebas text-base leading-none" style={{ color: "var(--color-text-primary)" }}>GYM</div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4">
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "rgba(255,107,44,0.06)", border: "1px solid rgba(255,107,44,0.1)" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "var(--color-brand-orange)", color: "white" }}
          >
            {profile.nama.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {profile.nama}
            </div>
            <div className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
              Member
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1">
        <div className="text-xs font-bold tracking-widest uppercase mb-3 px-2" style={{ color: "var(--color-text-muted)" }}>
          Menu
        </div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`sidebar-nav-item mb-1 ${pathname === href ? "active" : ""}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout + Theme toggle */}
      <div className="p-4" style={{ borderTop: "1px solid var(--color-border-subtle)" }}>
        <button
          onClick={toggleTheme}
          className="sidebar-nav-item w-full mb-2"
          title={theme === "dark" ? "Aktifkan Light Mode" : "Aktifkan Dark Mode"}
        >
          {theme === "dark"
            ? <Sun className="w-4 h-4" style={{ color: "var(--color-brand-gold)" }} />
            : <Moon className="w-4 h-4" style={{ color: "var(--color-brand-orange)" }} />}
          <span style={{ color: "var(--color-text-secondary)" }}>
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full"
          id="member-logout-btn"
        >
          <LogOut className="w-4 h-4" style={{ color: "var(--color-status-danger)" }} />
          <span style={{ color: "var(--color-status-danger)" }}>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-dark-800)" }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block flex-shrink-0" style={{ width: "260px" }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0"
            style={{ width: "260px", background: "var(--color-dark-900)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex justify-end">
              <button onClick={() => setSidebarOpen(false)} style={{ color: "var(--color-text-muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40"
          style={{ background: "var(--color-dark-900)", borderBottom: "1px solid var(--color-border-subtle)" }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ color: "var(--color-text-primary)" }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bebas text-lg" style={{ color: "var(--color-text-primary)" }}>
            CAHAYA GYM
          </span>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg" style={{ color: "var(--color-text-muted)" }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--color-brand-orange)", color: "white" }}
            >
              {profile.nama.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Not verified banner */}
        {!profile.is_verified && (
          <div
            className="flex items-center gap-3 px-6 py-3 text-sm"
            style={{ background: "rgba(245,158,11,0.1)", borderBottom: "1px solid rgba(245,158,11,0.2)" }}
          >
            <span className="font-medium" style={{ color: "#f59e0b" }}>
              ⚠️ Akun kamu sedang menunggu verifikasi admin. Fitur akan terbuka setelah diverifikasi.
            </span>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
