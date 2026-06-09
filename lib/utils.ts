export function cn(...inputs: (string | number | undefined | null | boolean | Record<string, unknown> | unknown)[]): string {
  return inputs.filter(Boolean).join(" ");
}

export function formatPrice(price: number): string {
  return `ETB ${price.toLocaleString("en-ET", { minimumFractionDigits: 2 })}`;
}

export function formatDate(date: Date | string | { toDate?: () => Date } | null | undefined): string {
  if (!date) return "—";
  let d: Date;
  if (typeof date === "object" && date !== null && "toDate" in date && typeof (date as { toDate: () => Date }).toDate === "function") {
    d = (date as { toDate: () => Date }).toDate();
  } else if (date instanceof Date) {
    d = date;
  } else {
    d = new Date(date as string);
  }
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-ET", { year: "numeric", month: "short", day: "numeric" });
}

export function validateEthiopianPhone(phone: string): boolean {
  return /^(0[79]\d{8}|0[1-9]\d{8})$/.test(phone.replace(/\s/g, ""));
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
