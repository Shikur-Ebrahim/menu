"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/ui/Spinner";
import {
  QrCode, LayoutDashboard, List, UtensilsCrossed,
  Settings, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/categories", label: "Categories", icon: List },
  { href: "/dashboard/menu", label: "Menu Items", icon: UtensilsCrossed },
  { href: "/dashboard/qr", label: "QR Code", icon: QrCode },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) { router.push("/login"); return; }
      if (user.status === "pending") { router.push("/pending"); return; }
      if (user.status !== "approved") { router.push("/login"); return; }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut();
    clearAuth();
    document.cookie = "nemu-auth=; path=/; max-age=0";
    router.push("/");
    toast.success("Logged out successfully");
  };

  if (loading) return <PageLoader />;
  if (!user || user.status !== "approved") return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-30 flex flex-col border-r border-white/5 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "rgba(2,6,23,0.95)", backdropFilter: "blur(20px)" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <QrCode size={16} className="text-white" />
            </div>
            <span className="text-lg font-black text-white font-display">Nemu</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Restaurant name */}
        <div className="px-5 py-4 border-b border-white/5">
          <p className="text-xs text-slate-500 mb-1">Restaurant</p>
          <p className="text-sm font-semibold text-white truncate">{user.restaurantName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <LogOut size={17} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b border-white/5" style={{ background: "rgba(2,6,23,0.95)", backdropFilter: "blur(16px)" }}>
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
              <QrCode size={12} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm font-display">Nemu</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
