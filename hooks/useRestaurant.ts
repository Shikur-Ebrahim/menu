"use client";

import { useState, useEffect } from "react";
import { getRestaurantByOwner, getCategoriesByRestaurant, getMenuItemsByRestaurant } from "@/lib/firestore";
import { Restaurant, Category, MenuItem } from "@/lib/types";

export function useRestaurant(ownerId: string | null) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerId) { setLoading(false); return; }
    (async () => {
      try {
        const r = await getRestaurantByOwner(ownerId);
        setRestaurant(r);
        if (r) {
          const [cats, items] = await Promise.all([
            getCategoriesByRestaurant(r.id),
            getMenuItemsByRestaurant(r.id),
          ]);
          setCategories(cats);
          setMenuItems(items);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [ownerId]);

  const refresh = async () => {
    if (!ownerId) return;
    const r = await getRestaurantByOwner(ownerId);
    setRestaurant(r);
    if (r) {
      const [cats, items] = await Promise.all([
        getCategoriesByRestaurant(r.id),
        getMenuItemsByRestaurant(r.id),
      ]);
      setCategories(cats);
      setMenuItems(items);
    }
  };

  return { restaurant, categories, menuItems, loading, refresh };
}
