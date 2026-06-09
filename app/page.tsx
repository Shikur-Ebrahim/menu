"use client";

import Link from "next/link";
import { QrCode, ChefHat, Star, Zap, Shield, Smartphone, ArrowRight, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen hero-gradient dot-pattern">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 border-b border-white/5" style={{ background: "rgba(2,6,23,0.8)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <QrCode size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white font-display">Nemu</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2">
            Sign In
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-8">
          <Zap size={12} />
          Trusted by 500+ restaurants across Ethiopia
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight mb-6 font-display">
          Your Menu,{" "}
          <span className="gradient-text">Digitized.</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Give your customers a seamless dining experience. One QR code — your entire menu, beautifully displayed on any device.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link
            href="/register"
            className="btn-primary text-base px-8 py-4 rounded-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Register Your Restaurant
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 text-slate-300 hover:text-white font-semibold transition-colors"
          >
            Already registered? Sign in →
          </Link>
        </div>

        {/* Mock phone */}
        <div className="relative max-w-xs mx-auto">
          <div className="glass rounded-3xl p-4 shadow-2xl shadow-indigo-500/10">
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="bg-indigo-600 px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ChefHat size={14} className="text-white" />
                </div>
                <div className="text-left">
                  <p className="text-white text-xs font-bold">Addis Café</p>
                  <p className="text-indigo-200 text-xs">Digital Menu</p>
                </div>
              </div>
              {[
                { name: "Tibs Special", price: "ETB 180", cat: "Main Course", emoji: "🥩" },
                { name: "Injera Combo", price: "ETB 120", cat: "Traditional", emoji: "🫓" },
                { name: "Ethiopian Coffee", price: "ETB 45", cat: "Drinks", emoji: "☕" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3 px-3 py-2.5 border-b border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                    <p className="text-slate-400 text-xs">{item.cat}</p>
                  </div>
                  <p className="text-indigo-400 text-xs font-bold">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 font-display">Everything you need</h2>
            <p className="text-slate-400 text-lg">Powerful features built for modern food businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: "Smart QR Codes", desc: "Generate unique QR codes instantly. Customers scan and view your full menu without any app.", color: "indigo" },
              { icon: Smartphone, title: "Mobile-First Design", desc: "Beautiful menus that look perfect on every device — phone, tablet, or desktop.", color: "purple" },
              { icon: ChefHat, title: "Full Menu Management", desc: "Add, edit, and organize categories and menu items with images and availability status.", color: "pink" },
              { icon: Zap, title: "Real-Time Updates", desc: "Update prices, availability, and items instantly. Changes reflect immediately for customers.", color: "amber" },
              { icon: Shield, title: "Secure & Reliable", desc: "Built on Firebase with enterprise-grade security. Your data is always safe.", color: "emerald" },
              { icon: Star, title: "Professional Presentation", desc: "Impress your guests with a stunning digital menu that reflects your brand.", color: "blue" },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card p-6 hover:border-white/20 transition-all duration-300 group" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/15 border border-${color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={`text-${color}-400`} />
                </div>
                <h3 className="text-white font-bold mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-white mb-4 font-display">Up and running in minutes</h2>
          <p className="text-slate-400 text-lg mb-16">Simple, fast, and completely free to try</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Register", desc: "Submit your restaurant name and phone number. Admin will review and approve your account." },
              { step: "02", title: "Build Menu", desc: "Add your categories, menu items, prices, and photos through your personal dashboard." },
              { step: "03", title: "Share QR Code", desc: "Download and print your unique QR code. Place it on tables, windows, or receipts." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-indigo-400 font-display">{step}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center glass-card p-12 rounded-3xl" style={{ border: "1px solid rgba(99,102,241,0.2)", background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05))" }}>
          <h2 className="text-4xl font-black text-white mb-4 font-display">Ready to go digital?</h2>
          <p className="text-slate-400 mb-8">Join hundreds of Ethiopian restaurants already using Nemu.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {["No credit card required", "Free to start", "Setup in 5 minutes"].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-slate-300">
                <CheckCircle size={14} className="text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
          <Link href="/register" className="btn-primary text-base px-8 py-4 rounded-2xl mt-8 inline-flex items-center gap-2">
            Start for Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
            <QrCode size={12} className="text-white" />
          </div>
          <span className="font-bold text-white font-display">Nemu</span>
        </div>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Nemu. Digital QR Menu System.</p>
      </footer>
    </div>
  );
}
