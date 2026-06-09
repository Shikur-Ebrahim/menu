"use client";

import Link from "next/link";
import { QrCode, Clock, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

export default function PendingPage() {
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    clearAuth();
    document.cookie = "nemu-auth=; path=/; max-age=0";
    router.push("/");
    toast.success("Logged out");
  };

  return (
    <div className="min-h-screen hero-gradient dot-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8 relative">
          <Clock size={40} className="text-amber-400" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500" />
        </div>

        <div className="glass-card p-10 rounded-3xl" style={{ border: "1px solid rgba(245,158,11,0.2)" }}>
          <h1 className="text-3xl font-black text-white mb-4 font-display">Pending Approval</h1>
          <p className="text-slate-300 leading-relaxed mb-6">
            Your registration has been submitted successfully. Our team is reviewing your information and will approve your account shortly.
          </p>
          <div className="space-y-3 text-left mb-8">
            {[
              "Your application is under review",
              "This usually takes 1–2 business days",
              "You'll be able to log in once approved",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white mx-auto text-sm font-medium transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <p className="mt-6 text-slate-500 text-sm">
          Questions?{" "}
          <Link href="/" className="text-indigo-400 hover:text-indigo-300">
            Contact support
          </Link>
        </p>
      </div>
    </div>
  );
}
