"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/lib/firestore";
import { DashboardStats } from "@/lib/types";
import { Store, Clock, CheckCircle, XCircle, UtensilsCrossed, TrendingUp } from "lucide-react";
import Link from "next/link";
import { CardSkeleton } from "@/components/ui/Spinner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const cards = stats
    ? [
        { label: "Total Restaurants", value: stats.totalRestaurants, icon: Store, color: "indigo", href: "/admin/restaurants" },
        { label: "Pending Approvals", value: stats.pendingApprovals, icon: Clock, color: "amber", href: "/admin/restaurants?status=pending" },
        { label: "Approved", value: stats.approvedRestaurants, icon: CheckCircle, color: "emerald", href: "/admin/restaurants?status=approved" },
        { label: "Rejected", value: stats.rejectedRestaurants, icon: XCircle, color: "red", href: "/admin/restaurants?status=rejected" },
        { label: "Total Menu Items", value: stats.totalMenuItems, icon: UtensilsCrossed, color: "purple", href: "/admin/statistics" },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-display">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of the Nemu platform</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map(({ label, value, icon: Icon, color, href }) => (
            <Link
              key={label}
              href={href}
              className="glass-card p-6 rounded-2xl hover:border-white/20 transition-all group"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={`text-${color}-400`} />
                </div>
                <TrendingUp size={14} className="text-slate-600" />
              </div>
              <p className="text-4xl font-black text-white font-display">{value}</p>
              <p className="text-slate-400 text-sm mt-1">{label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="glass-card p-6 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/restaurants?status=pending" className="btn-primary px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
            <Clock size={15} /> Review Pending ({stats?.pendingApprovals ?? 0})
          </Link>
          <Link href="/admin/restaurants" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors">
            <Store size={15} /> All Restaurants
          </Link>
          <Link href="/admin/statistics" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors">
            <TrendingUp size={15} /> View Statistics
          </Link>
        </div>
      </div>
    </div>
  );
}
