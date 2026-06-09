"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { QrCode, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { signInWithEmail } from "@/lib/auth";
import { getUser, createUser } from "@/lib/firestore";
import { auth } from "@/lib/firebase";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const firebaseUser = await signInWithEmail(data.email, data.password);
      let user = await getUser(firebaseUser.uid);

      if (!user && data.email === "admin@gmail.com") {
        await createUser(firebaseUser.uid, {
          restaurantName: "Nemu Admin",
          phoneNumber: "0000000000",
          authEmail: data.email,
          generatedPassword: "",
          role: "admin",
          status: "approved",
          createdAt: new Date().toISOString(),
        });
        user = await getUser(firebaseUser.uid);
      }

      if (!user || user.role !== "admin") {
        await auth.signOut();
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      document.cookie = `nemu-auth=${encodeURIComponent(JSON.stringify({ role: "admin", status: "approved" }))}; path=/; max-age=86400`;
      router.push("/admin/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient dot-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={28} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-black text-white font-display">Admin Portal</h1>
          <p className="text-slate-400 mt-2">Sign in to manage Nemu</p>
        </div>

        <div className="glass-card p-8 rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="email" {...register("email")} type="email" placeholder="admin@nemu.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input id="password" {...register("password")} type="password" placeholder="••••••••" className="input-field pl-10" />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        <div className="mt-4 p-3 rounded-xl border border-slate-700/50 text-center">
          <p className="text-slate-500 text-xs">🔒 Restricted to authorized administrators only</p>
        </div>
      </div>
    </div>
  );
}
