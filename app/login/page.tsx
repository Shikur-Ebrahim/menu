"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { QrCode, Phone, ArrowRight, Lock, Mail } from "lucide-react";
import { signInWithEmail, phoneToEmail } from "@/lib/auth";
import { getUser } from "@/lib/firestore";
import { validateEthiopianPhone } from "@/lib/utils";

const schema = z.object({
  identifier: z.string().min(1, "Please enter your email or phone number").refine((val) => {
    if (val.includes("@")) return z.string().email().safeParse(val).success;
    return validateEthiopianPhone(val);
  }, "Enter a valid email or Ethiopian phone number"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Sign in directly with email/password
      const isEmail = data.identifier.includes("@");
      const email = isEmail ? data.identifier : phoneToEmail(data.identifier);
      const firebaseUser = await signInWithEmail(email, data.password);

      // After successful authentication, fetch the user document using the UID
      const user = await getUser(firebaseUser.uid);
      if (!user) {
        toast.error("Account data not found. Please contact support.");
        return;
      }

      // Store session cookie for middleware
      document.cookie = `nemu-auth=${encodeURIComponent(JSON.stringify({ role: user.role, status: user.status }))}; path=/; max-age=86400`;

      if (user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user.role === "owner" && user.status === "pending") {
        router.push("/pending");
      } else if (user.role === "owner" && user.status === "approved") {
        router.push("/dashboard");
      } else {
        toast.error("Your account has been rejected or suspended. Please contact support.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
        toast.error("Login failed. Please try again.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hero-gradient dot-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white font-display">Nemu</span>
          </Link>
          <h1 className="text-3xl font-black text-white font-display">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <div className="glass-card p-8 rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-slate-300 mb-1.5">
                Email or Phone Number
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="identifier"
                  {...register("identifier")}
                  placeholder="admin@gmail.com or 0912345678"
                  className="input-field pl-10"
                />
              </div>
              {errors.identifier && (
                <p className="mt-1.5 text-xs text-red-400">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder="Enter your password"
                  className="input-field pl-10"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
