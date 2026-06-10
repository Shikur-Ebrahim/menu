"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { QrCode, Building2, Phone, ArrowRight, CheckCircle, Lock } from "lucide-react";
import { registerWithEmail, phoneToEmail } from "@/lib/auth";
import { createUser } from "@/lib/firestore";
import { validateEthiopianPhone } from "@/lib/utils";

const schema = z.object({
  restaurantName: z.string().min(2, "Restaurant name must be at least 2 characters"),
  phoneNumber: z.string().refine(validateEthiopianPhone, "Enter a valid Ethiopian phone number (e.g. 0912345678)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const email = phoneToEmail(data.phoneNumber);
      const firebaseUser = await registerWithEmail(email, data.password);

      await createUser(firebaseUser.uid, {
        restaurantName: data.restaurantName,
        phoneNumber: data.phoneNumber,
        authEmail: email,
        role: "owner",
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      if (msg.includes("email-already-in-use")) {
        toast.error("This phone number is already registered. Please log in.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen hero-gradient dot-pattern flex items-center justify-center p-6">
        <div className="glass-card p-10 max-w-md w-full text-center rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3 font-display">Registration Submitted!</h1>
          <p className="text-slate-300 leading-relaxed mb-8">
            Your registration has been submitted successfully. Please wait for administrator approval. You will be able to log in once your account is approved.
          </p>
          <Link href="/" className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 w-full justify-center">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hero-gradient dot-pattern flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white font-display">Nemu</span>
          </Link>
          <h1 className="text-3xl font-black text-white font-display">Register Your Restaurant</h1>
          <p className="text-slate-400 mt-2">Join thousands of businesses on Nemu</p>
        </div>

        <div className="glass-card p-8 rounded-3xl" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Restaurant Name */}
            <div>
              <label htmlFor="restaurantName" className="block text-sm font-medium text-slate-300 mb-1.5">
                Restaurant / Hotel Name
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="restaurantName"
                  {...register("restaurantName")}
                  placeholder="e.g. ABC Restaurant"
                  className="input-field pl-10"
                />
              </div>
              {errors.restaurantName && (
                <p className="mt-1.5 text-xs text-red-400">{errors.restaurantName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-slate-300 mb-1.5">
                Ethiopian Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="phoneNumber"
                  {...register("phoneNumber")}
                  placeholder="0912345678"
                  type="tel"
                  className="input-field pl-10"
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1.5 text-xs text-red-400">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password */}
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
                  placeholder="Create a strong password"
                  className="input-field pl-10"
                />
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  placeholder="Confirm your password"
                  className="input-field pl-10"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>Submit Registration <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-amber-300 text-xs leading-relaxed">
            <strong>Note:</strong> After registration, your account will be reviewed by an administrator. You will receive access to your dashboard once approved.
          </p>
        </div>
      </div>
    </div>
  );
}
