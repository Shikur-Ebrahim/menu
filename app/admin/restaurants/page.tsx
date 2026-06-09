"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Search, Check, X, Pause, Store, ExternalLink, QrCode } from "lucide-react";
import { getAllUsers, getAllRestaurants, updateUserStatus, updateRestaurant, createRestaurant, generateSlug } from "@/lib/firestore";
import { generateQRDataUrl, getMenuUrl } from "@/lib/qrcode";
import { User, Restaurant } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

type Action = { type: "approve" | "reject" | "suspend"; user: User };

function RestaurantsContent() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [pending, setPending] = useState<Action | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const [u, r] = await Promise.all([getAllUsers(), getAllRestaurants()]);
    setUsers(u.filter((u) => u.role === "owner"));
    setRestaurants(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    const matchSearch =
      !search ||
      u.restaurantName.toLowerCase().includes(search.toLowerCase()) ||
      u.phoneNumber.includes(search);
    return matchStatus && matchSearch;
  });

  const getRestaurant = (uid: string) => restaurants.find((r) => r.ownerId === uid);

  const handleAction = async () => {
    if (!pending) return;
    setSubmitting(true);
    try {
      const { type, user } = pending;

      if (type === "approve") {
        await updateUserStatus(user.uid, "approved");
        const existing = getRestaurant(user.uid);
        if (!existing) {
          const slug = generateSlug(user.restaurantName);
          const qrUrl = getMenuUrl(slug);
          const qrDataUrl = await generateQRDataUrl(qrUrl);
          await createRestaurant({
            ownerId: user.uid,
            restaurantName: user.restaurantName,
            slug,
            qrCodeUrl: qrDataUrl,
            status: "approved",
            createdAt: new Date().toISOString(),
          });
        } else {
          await updateRestaurant(existing.id, { status: "approved" });
        }
        toast.success(`${user.restaurantName} approved!`);
      } else if (type === "reject") {
        await updateUserStatus(user.uid, "rejected");
        const r = getRestaurant(user.uid);
        if (r) await updateRestaurant(r.id, { status: "rejected" });
        toast.success(`${user.restaurantName} rejected.`);
      } else if (type === "suspend") {
        await updateUserStatus(user.uid, "suspended");
        const r = getRestaurant(user.uid);
        if (r) await updateRestaurant(r.id, { status: "suspended" });
        toast.success(`${user.restaurantName} suspended.`);
      }

      setPending(null);
      load();
    } catch {
      toast.error("Action failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusFilters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white font-display">Restaurants</h1>
        <p className="text-slate-400 mt-1">Manage all registered restaurants</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === f.value ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={6} />
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <EmptyState icon={Store} title="No restaurants found" description="No restaurants match the current filters." />
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Restaurant</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, i) => {
                  const restaurant = getRestaurant(user.uid);
                  const menuUrl = restaurant?.slug ? getMenuUrl(restaurant.slug) : null;
                  return (
                    <tr key={user.uid} className={`hover:bg-white/3 transition-colors ${i > 0 ? "border-t border-white/5" : ""}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <Store size={14} className="text-indigo-400" />
                          </div>
                          <span className="text-white font-medium text-sm">{user.restaurantName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-300 text-sm font-mono">{user.phoneNumber}</td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={user.status} /></td>
                      <td className="px-5 py-4">
                        {menuUrl ? (
                          <a href={menuUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-xs transition-colors">
                            <QrCode size={12} /> View <ExternalLink size={10} />
                          </a>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 justify-end">
                          {user.status !== "approved" && (
                            <button onClick={() => setPending({ type: "approve", user })} title="Approve" className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                              <Check size={15} />
                            </button>
                          )}
                          {user.status !== "rejected" && (
                            <button onClick={() => setPending({ type: "reject", user })} title="Reject" className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                              <X size={15} />
                            </button>
                          )}
                          {user.status === "approved" && (
                            <button onClick={() => setPending({ type: "suspend", user })} title="Suspend" className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors">
                              <Pause size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-500">
            Showing {filtered.length} of {users.length} restaurants
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirm={handleAction}
        title={
          pending?.type === "approve" ? "Approve Restaurant" :
          pending?.type === "reject" ? "Reject Restaurant" : "Suspend Restaurant"
        }
        message={
          pending?.type === "approve"
            ? `Approve "${pending?.user.restaurantName}"? They will gain full dashboard access.`
            : pending?.type === "reject"
            ? `Reject "${pending?.user.restaurantName}"? They will not be able to access the platform.`
            : `Suspend "${pending?.user.restaurantName}"? Their account will be temporarily disabled.`
        }
        confirmLabel={pending?.type === "approve" ? "Approve" : pending?.type === "reject" ? "Reject" : "Suspend"}
        variant={pending?.type === "approve" ? "primary" : "danger"}
        loading={submitting}
      />
    </div>
  );
}

export default function AdminRestaurantsPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto"><TableSkeleton rows={6} /></div>}>
      <RestaurantsContent />
    </Suspense>
  );
}
