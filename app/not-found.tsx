import Link from "next/link";
import { QrCode, Home } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Not Found – Nemu" };

export default function NotFound() {
  return (
    <div className="min-h-screen hero-gradient dot-pattern flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
          <QrCode size={36} className="text-indigo-400" />
        </div>
        <h1 className="text-7xl font-black text-white font-display mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or this menu is no longer available.
        </p>
        <Link href="/" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2">
          <Home size={16} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
