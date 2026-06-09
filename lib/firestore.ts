import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import { User, Restaurant, Category, MenuItem, DashboardStats } from "./types";

// ─── Slug Generator ──────────────────────────────────────────────────────────
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function createUser(uid: string, data: Omit<User, "uid">): Promise<void> {
  await setDoc(doc(db, "users", uid), { ...data, uid, createdAt: serverTimestamp() });
}

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const q = query(collection(db, "users"), where("phoneNumber", "==", phone));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as User;
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as User));
}

export async function updateUserStatus(uid: string, status: User["status"]): Promise<void> {
  await updateDoc(doc(db, "users", uid), { status });
}

// ─── Restaurants ─────────────────────────────────────────────────────────────
export async function createRestaurant(data: Omit<Restaurant, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "restaurants"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getRestaurantByOwner(ownerId: string): Promise<Restaurant | null> {
  const q = query(collection(db, "restaurants"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...d.data(), id: d.id } as Restaurant;
}

export async function getRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const q = query(collection(db, "restaurants"), where("slug", "==", slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...d.data(), id: d.id } as Restaurant;
}

export async function getAllRestaurants(): Promise<Restaurant[]> {
  const snap = await getDocs(query(collection(db, "restaurants"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Restaurant));
}

export async function updateRestaurant(id: string, data: Partial<Restaurant>): Promise<void> {
  await updateDoc(doc(db, "restaurants", id), data);
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function createCategory(data: Omit<Category, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "categories"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getCategoriesByRestaurant(restaurantId: string): Promise<Category[]> {
  const q = query(
    collection(db, "categories"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as Category));
}

export async function updateCategory(id: string, name: string): Promise<void> {
  await updateDoc(doc(db, "categories", id), { name });
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, "categories", id));
}

// ─── Menu Items ───────────────────────────────────────────────────────────────
export async function createMenuItem(data: Omit<MenuItem, "id">): Promise<string> {
  const ref = await addDoc(collection(db, "menuItems"), { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getMenuItemsByRestaurant(restaurantId: string): Promise<MenuItem[]> {
  const q = query(
    collection(db, "menuItems"),
    where("restaurantId", "==", restaurantId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id } as MenuItem));
}

export async function updateMenuItem(id: string, data: Partial<MenuItem>): Promise<void> {
  await updateDoc(doc(db, "menuItems", id), data);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, "menuItems", id));
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export async function getDashboardStats(): Promise<DashboardStats> {
  const [restaurants, menuItems] = await Promise.all([
    getDocs(collection(db, "restaurants")),
    getDocs(collection(db, "menuItems")),
  ]);

  const stats: DashboardStats = {
    totalRestaurants: restaurants.size,
    pendingApprovals: 0,
    approvedRestaurants: 0,
    rejectedRestaurants: 0,
    totalMenuItems: menuItems.size,
  };

  restaurants.docs.forEach((d) => {
    const status = d.data().status;
    if (status === "pending") stats.pendingApprovals++;
    if (status === "approved") stats.approvedRestaurants++;
    if (status === "rejected") stats.rejectedRestaurants++;
  });

  return stats;
}
