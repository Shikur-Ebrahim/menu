"use client";

import { useEffect, useState } from "react";
import { getDashboardStats, getAllRestaurants } from "@/lib/firestore";
import { DashboardStats, Restaurant } from "@/lib/types";
import { BarChart3, Store, Clock, CheckCircle, XCircle, UtensilsCrossed, TrendingUp } from "lucide-react";
import { CardSkeleton } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllRestaurants()])
      .then(([s, r]) => { setStats(s); setRestaurants(r); })
      .finally(() => setLoading(false));
  }, []);

  const approvalRate = stats
    ? stats.totalRestaurants > 0
      ? Math.round((stats.approvedRestaurants / stats.totalRestaurants) * 100)
      : 0
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-display">Statistics</h1>
        <p className="text-slate-400 mt-1">Platform-wide analytics and insights</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Main stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Total Restaurants", value: stats?.totalRestaurants, icon: Store, color: "indigo" },
              { label: "Pending Review", value: stats?.pendingApprovals, icon: Clock, color: "amber" },
              { label: "Approved", value: stats?.approvedRestaurants, icon: CheckCircle, color: "emerald" },
              { label: "Rejected", value: stats?.rejectedRestaurants, icon: XCircle, color: "red" },
              { label: "Total Menu Items", value: stats?.totalMenuItems, icon: UtensilsCrossed, color: "purple" },
              { label: "Approval Rate", value: `${approvalRate}%`, icon: TrendingUp, color: "blue" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="glass-card p-6 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className={`w-10 h-10 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center mb-3`}>
                  <Icon size={18} className={`text-${color}-400`} />
                </div>
                <p className="text-4xl font-black text-white font-display">{value ?? 0}</p>
                <p className="text-slate-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Status breakdown bar */}
          {stats && stats.totalRestaurants > 0 && (
            <div className="glass-card p-6 rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="text-lg font-bold text-white mb-4">Status Breakdown</h2>
              <div className="flex h-4 rounded-full overflow-hidden gap-0.5 mb-4">
                {stats.approvedRestaurants > 0 && (
                  <div
                    className="bg-emerald-500 transition-all"
                    style={{ width: `${(stats.approvedRestaurants / stats.totalRestaurants) * 100}%` }}
                    title={`Approved: ${stats.approvedRestaurants}`}
                  />
                )}
                {stats.pendingApprovals > 0 && (
                  <div
                    className="bg-amber-500 transition-all"
                    style={{ width: `${(stats.pendingApprovals / stats.totalRestaurants) * 100}%` }}
                    title={`Pending: ${stats.pendingApprovals}`}
                  />
                )}
                {stats.rejectedRestaurants > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{ width: `${(stats.rejectedRestaurants / stats.totalRestaurants) * 100}%` }}
                    title={`Rejected: ${stats.rejectedRestaurants}`}
                  />
                )}
              </div>
              <div className="flex gap-6 flex-wrap text-sm">
                {[
                  { label: "Approved", count: stats.approvedRestaurants, color: "bg-emerald-500" },
                  { label: "Pending", count: stats.pendingApprovals, color: "bg-amber-500" },
                  { label: "Rejected", count: stats.rejectedRestaurants, color: "bg-red-500" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${color}`} />
                    <span className="text-slate-300">{label}: <strong className="text-white">{count}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent restaurants */}
          <div className="glass-card rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
            </div>
            <div className="divide-y divide-white/5">
              {restaurants.slice(0, 8).map((r) => (
                <div key={r.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <Store size={14} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{r.restaurantName}</p>
                    <p className="text-slate-500 text-xs">{formatDate(r.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    r.status === "approved" ? "bg-emerald-500/15 text-emerald-400" :
                    r.status === "pending" ? "bg-amber-500/15 text-amber-400" :
                    "bg-red-500/15 text-red-400"
                  }`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
