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
    <div className="min-h-screen bg-slate-50 pb-safe font-sans">
      {/* Mobile-optimized Header */}
      <div className="relative pt-10 pb-6 px-4 text-center bg-white border-b border-slate-200 shadow-sm">
        {restaurant.logo ? (
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 shadow-md border border-slate-100">
            <Image src={restaurant.logo} alt="Logo" width={64} height={64} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-md">
            <QrCode size={28} className="text-white" />
          </div>
        )}
        <h1 className="text-2xl font-black text-slate-900 mb-0.5 tracking-tight">{restaurant.restaurantName}</h1>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Digital Menu</p>
      </div>

      {/* Sticky Mobile Search + Categories */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 pt-4 pb-3 shadow-sm">
        <div className="px-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Find a dish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border border-slate-200 rounded-full pl-10 pr-4 py-3 text-base text-slate-900 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            />
          </div>

          {/* Swipeable Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x" style={{ WebkitOverflowScrolling: "touch" }}>
            <button
              onClick={() => setActiveCategory("all")}
              className={`snap-start flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                activeCategory === "all"
                  ? "bg-slate-900 text-white border border-slate-800"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`snap-start flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm ${
                  activeCategory === cat.id
                    ? "bg-slate-900 text-white border border-slate-800"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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
          <div className="text-center py-16 text-slate-400">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              🍽️
            </div>
            <p className="text-base font-bold text-slate-500">Menu is being prepared</p>
            <p className="text-xs mt-1">Check back soon!</p>
          </div>
        )}

        {Object.entries(grouped).map(([catId, items]) => {
          const cat = categories.find((c) => c.id === catId);
          if (!cat || items.length === 0) return null;
          return (
            <section key={catId} className="scroll-mt-32" id={`category-${catId}`}>
              <h2 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                {cat.name}
              </h2>
              {/* Grid Layout (2 items side-by-side) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && menuItems.length > 0 && (
          <div className="text-center py-20 text-slate-400">
            <Search size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm font-bold text-slate-500">No items found for &ldquo;{search}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Mobile Footer */}
      <footer className="py-8 text-center mt-4 border-t border-slate-200">
        <div className="flex items-center justify-center gap-1.5">
          <QrCode size={14} className="text-slate-400" />
          <p className="text-slate-500 text-xs font-medium">Powered by <strong className="text-slate-900">Nemu</strong></p>
        </div>
      </footer>
    </div>
  );
}

function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <div className="flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:shadow-md active:scale-[0.98] transition-all relative">
      {/* Image Section (Square) */}
      <div className="w-full aspect-square bg-slate-50 relative">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.foodName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 200px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-slate-200">
            🍽️
          </div>
        )}
        <div className="absolute top-2 right-2 scale-90 origin-top-right">
          <StatusBadge status={item.availability} />
        </div>
      </div>
      
      {/* Content Section */}
      <div className="flex-1 flex flex-col p-3">
        <h3 className="text-slate-900 font-bold text-sm leading-tight mb-1">{item.foodName}</h3>
        {item.description && (
          <p className="text-slate-500 text-[11px] leading-snug line-clamp-2 mb-2">{item.description}</p>
        )}
        <div className="mt-auto">
          <span className="text-slate-900 font-black text-sm">{formatPrice(item.price)}</span>
        </div>
      </div>
    </div>
  );
}
