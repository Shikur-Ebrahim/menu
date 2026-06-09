import { getRestaurantBySlug, getCategoriesByRestaurant, getMenuItemsByRestaurant } from "@/lib/firestore";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicMenuClient } from "./PublicMenuClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return { title: "Menu Not Found – Nemu" };
  return {
    title: `${restaurant.restaurantName} – Digital Menu | Nemu`,
    description: `View the full digital menu of ${restaurant.restaurantName}. Scan QR to browse all dishes, prices, and availability.`,
  };
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant || restaurant.status !== "approved") notFound();

  const [categories, menuItems] = await Promise.all([
    getCategoriesByRestaurant(restaurant.id),
    getMenuItemsByRestaurant(restaurant.id),
  ]);

  return (
    <PublicMenuClient
      restaurant={restaurant}
      categories={categories}
      menuItems={menuItems}
    />
  );
}
