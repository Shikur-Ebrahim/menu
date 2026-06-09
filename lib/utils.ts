import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return `ETB ${price.toLocaleString("en-ET", { minimumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-ET", { year: "numeric", month: "short", day: "numeric" });
}

export function validateEthiopianPhone(phone: string): boolean {
  return /^(0[79]\d{8}|0[1-9]\d{8})$/.test(phone.replace(/\s/g, ""));
}
