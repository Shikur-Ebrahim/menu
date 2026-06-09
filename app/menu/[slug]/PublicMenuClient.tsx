"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, QrCode } from "lucide-react";
import { Restaurant, Category, MenuItem } from "@/lib/types";
import { StatusBadge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface Props {
  restaurant: Restaurant;
  categories: Category[];
  menuItems: MenuItem[];
}

export function PublicMenuClient({ restaurant, categories, menuItems }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === "all" || item.categoryId === activeCategory;
      const matchSearch =
        !search ||
        item.foodName.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategory, search]);

  const grouped = useMemo(() => {
    if (activeCategory !== "all") {
      return { [activeCategory]: filtered };
    }
    return categories.reduce(
      (acc, cat) => {
        acc[cat.id] = filtered.filter((i) => i.categoryId === cat.id);
        return acc;
      },
      {} as Record<string, MenuItem[]>
    );
  }, [filtered, categories, activeCategory]);

  return (
    <div className="min-h-screen bg-slate-950 pb-safe">
      {/* Mobile-optimized Header */}
      <div className="relative pt-10 pb-6 px-4 text-center hero-gradient border-b border-indigo-900/30">
        {restaurant.logo ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 shadow-lg shadow-indigo-500/20 border border-white/10">
            <Image src={restaurant.logo} alt="Logo" width={64} height={64} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <QrCode size={28} className="text-white" />
          </div>
        )}
        <h1 className="text-2xl font-black text-white mb-0.5 font-display tracking-tight">{restaurant.restaurantName}</h1>
        <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest">Digital Menu</p>
      </div>

      {/* Sticky Mobile Search + Categories */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 pt-4 pb-3 shadow-md">
        <div className="px-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Find a dish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-full pl-10 pr-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>

          {/* Swipeable Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x" style={{ WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setActiveCategory("all")}
              className={`snap-start flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                activeCategory === "all"
                  ? "bg-indigo-600 text-white border border-indigo-500"
                  : "bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:bg-slate-700"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`snap-start flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white border border-indigo-500"
                    : "bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:bg-slate-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content - Mobile Padding */}
      <div className="px-4 py-6 space-y-8">
        {categories.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
              🍽️
            </div>
            <p className="text-base font-medium text-slate-400">Menu is being prepared</p>
            <p className="text-xs mt-1">Check back soon!</p>
          </div>
        )}

        {Object.entries(grouped).map(([catId, items]) => {
          const cat = categories.find((c) => c.id === catId);
          if (!cat || items.length === 0) return null;
          return (
            <section key={catId} className="scroll-mt-32" id={`category-${catId}`}>
              <h2 className="text-xl font-black text-white mb-4 font-display flex items-center gap-2">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full inline-block" />
                {cat.name}
              </h2>
              <div className="space-y-3.5">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && menuItems.length > 0 && (
          <div className="text-center py-20 text-slate-500">
            <Search size={40} className="mx-auto mb-4 text-slate-700" />
            <p className="text-sm font-medium">No items found for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Mobile Footer */}
      <footer className="py-8 text-center mt-4">
        <div className="flex items-center justify-center gap-1.5 opacity-50">
          <QrCode size={14} className="text-slate-400" />
          <p className="text-slate-400 text-xs font-medium">Powered by <strong className="text-slate-300">Nemu</strong></p>
        </div>
      </footer>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="flex items-stretch gap-3.5 bg-slate-900/80 border border-slate-800/80 rounded-[1.25rem] p-3 shadow-sm hover:border-slate-700/50 active:scale-[0.98] transition-all">
      {item.imageUrl ? (
        <div className="w-[88px] h-[88px] rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
          <Image
            src={item.imageUrl}
            alt={item.foodName}
            width={88} height={88}
            className="object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="w-[88px] h-[88px] rounded-xl bg-slate-800/50 flex items-center justify-center flex-shrink-0 text-3xl shadow-inner border border-white/5">
          🍽️
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-slate-50 font-bold text-sm sm:text-base leading-tight pr-1">{item.foodName}</h3>
          <StatusBadge status={item.availability} />
        </div>
        {item.description && (
          <p className="text-slate-400 text-xs mt-1.5 leading-snug line-clamp-2 pr-2">{item.description}</p>
        )}
        <div className="mt-auto pt-2">
          <span className="text-indigo-400 font-black text-sm">{formatPrice(item.price)}</span>
        </div>
      </div>
    </div>
  );
}
