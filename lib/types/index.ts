// TypeScript types for Nemu

export type UserRole = "admin" | "owner";
export type UserStatus = "pending" | "approved" | "rejected" | "suspended";
export type Availability = "available" | "out_of_stock";

export interface User {
  uid: string;
  restaurantName: string;
  phoneNumber: string;
  authEmail: string;
  generatedPassword: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date | string;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  restaurantName: string;
  slug: string;
  logo?: string;
  qrCodeUrl?: string;
  status: UserStatus;
  createdAt: Date | string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: Date | string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  foodName: string;
  description: string;
  price: number;
  imageUrl?: string;
  availability: Availability;
  createdAt: Date | string;
}

export interface DashboardStats {
  totalRestaurants: number;
  pendingApprovals: number;
  approvedRestaurants: number;
  rejectedRestaurants: number;
  totalMenuItems: number;
}
