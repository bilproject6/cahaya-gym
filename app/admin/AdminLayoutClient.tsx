"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, UserCheck,
  TrendingUp, LogOut, Menu, X, ShieldCheck, Package, Activity,
  Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";

// Icon bottom nav mobile
const bottomNavItems = [
  { href: "/admin/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/members",    label: "Member",     icon: Users },
  { href: "/admin/non-member", label: "Non-Member", icon: UserCheck },
  { href: "/admin/suplemen",   label: "Suplemen",   icon: Package },
  { href: "/admin/keuangan",   label: "Keuangan",   icon: TrendingUp },
];

interface AdminLayoutClientProps {
  children: React.ReactNode;
  profile: { nama: string; role: string };
}

const navGroups = [
  {
    label: "Utama",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { href: "/admin/members", label: "Kelola Member", icon: Users },
      { href: "/admin/non-member", label: "Non-Member Harian", icon: UserCheck },
    ],
  },
  {
    label: "Bisnis",
    items: [
      { href: "/admin/suplemen", label: "Suplemen", icon: Package },
      { href: "/admin/keuangan", label: "Keuangan & Arus Kas", icon: TrendingUp },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { href: "/admin/admin-users", label: "Kelola Admin", icon: ShieldCheck },
      { href: "/admin/logs", label: "Riwayat Aktivitas", icon: Activity },
    ],
  },
];

export default function AdminLayoutClient({ children, profile }: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 flex items-center gap-3" style={{ borderBottom: "2px solid var(--color-border-subtle)" }}>
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
          <Image src="/logo.jpg" alt="Cahaya Gym" width={36} height={36} className="object-cover" />
        </div>
        <div>
          <div className="font-bebas text-base leading-none" style={{ color: "var(--color-brand-orange)" }}>CAHAYA</div>
          <div className="font-bebas text-base leading-none" style={{ color: "var(--color-text-primary)" }}>GYM</div>
        </div>
      </div>

      {/* Admin Badge */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: "rgba(217,79,30,0.08)", border: "1px solid rgba(217,79,30,0.15)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: "#d94f1e", color: "#f0ead6" }}>
            {profile.nama.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
              {profile.nama}
            </div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" style={{ color: "var(--color-brand-orange)" }} />
              <span className="text-xs" style={{ color: "var(--color-brand-orange)" }}>Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="px-3 flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <div className="text-xs font-bold tracking-widest uppercase px-2 mb-2"
              style={{ color: "var(--color-text-muted)" }}>
              {group.label}
            </div>
            {group.items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`sidebar-nav-item mb-1 ${pathname === href || pathname.startsWith(href + "/") ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>
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
          id="admin-logout-btn"
        >
          <LogOut className="w-4 h-4" style={{ color: "var(--color-status-danger)" }} />
          <span style={{ color: "var(--color-status-danger)" }}>Keluar</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen" style={{ background: "var(--color-dark-800)" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col flex-shrink-0"
        style={{ width: "260px", background: "var(--color-dark-900)", borderRight: "2px solid var(--color-border-subtle)", position: "sticky", top: 0, height: "100vh" }}>
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (slide dari kiri) */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 flex flex-col"
            style={{ width: "260px", background: "var(--color-dark-900)", borderRight: "2px solid var(--color-border-subtle)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-4">
              <button onClick={() => setSidebarOpen(false)} style={{ color: "var(--color-text-muted)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar — minimal, hanya untuk menu + logo */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40"
          style={{ background: "var(--color-dark-900)", borderBottom: "2px solid var(--color-border-subtle)" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: "var(--color-text-primary)" }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bebas text-lg" style={{ color: "var(--color-text-primary)" }}>ADMIN PANEL</span>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg" style={{ color: "var(--color-text-muted)" }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--color-brand-orange)", color: "white" }}>
              {profile.nama.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content — padding bawah untuk bottom nav mobile */}
        <main className="flex-1 p-6 lg:pb-6 pb-20">{children}</main>
      </div>

      {/* ═══ Mobile Bottom Navigation Bar ═══ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          background: "var(--color-dark-900)",
          borderTop: "2px solid var(--color-border-default)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all"
              style={{
                color: isActive ? "var(--color-brand-orange)" : "var(--color-text-muted)",
                minHeight: 56,
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold" style={{ fontSize: "0.65rem", letterSpacing: "0.02em" }}>{label}</span>
              {isActive && (
                <span
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ background: "var(--color-brand-orange)", borderRadius: "0 0 2px 2px" }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
