"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Save, Camera, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { updateRestaurant } from "@/lib/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { PageLoader } from "@/components/ui/Spinner";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth();
  const { restaurant, loading, refresh } = useRestaurant(user?.uid ?? null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  const fileRef = useRef<HTMLInputElement>(null);
  
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [leftPreview, setLeftPreview] = useState<string>("");
  const leftRef = useRef<HTMLInputElement>(null);

  const [rightFile, setRightFile] = useState<File | null>(null);
  const [rightPreview, setRightPreview] = useState<string>("");
  const rightRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };
  const handleLeftChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLeftFile(file);
    setLeftPreview(URL.createObjectURL(file));
  };
  const handleRightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRightFile(file);
    setRightPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    try {
      let logo = restaurant.logo || "";
      let qrLeftImage = restaurant.qrLeftImage || "";
      let qrRightImage = restaurant.qrRightImage || "";
      
      if (logoFile) logo = await uploadToCloudinary(logoFile, "nemu/logos");
      if (leftFile) qrLeftImage = await uploadToCloudinary(leftFile, "nemu/qr-decor");
      if (rightFile) qrRightImage = await uploadToCloudinary(rightFile, "nemu/qr-decor");
      
      await updateRestaurant(restaurant.id, { 
        logo, 
        restaurantName: restaurantName || restaurant.restaurantName,
        qrLeftImage,
        qrRightImage
      });
      toast.success("Settings saved!");
      refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const currentLogo = logoPreview || restaurant?.logo;
  const currentLeft = leftPreview || restaurant?.qrLeftImage;
  const currentRight = rightPreview || restaurant?.qrRightImage;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white font-display">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your restaurant profile</p>
      </div>

      <div className="glass-card p-6 rounded-2xl space-y-6" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Logo */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Restaurant Logo</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {currentLogo ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg">
                  <img src={currentLogo} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center">
                  <Building2 size={28} className="text-slate-500" />
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-colors"
              >
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Upload Logo</p>
              <p className="text-slate-400 text-xs mt-1">PNG, JPG up to 5MB. Recommended: 200×200px</p>
              <button
                onClick={() => fileRef.current?.click()}
                className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Choose file →
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
          </div>
        </div>

        {/* QR Decorative Images */}
        <div className="border-t border-white/5 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-bold text-slate-300 mb-3">QR Print Left Image</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentLeft ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                    <img src={currentLeft} alt="Left" className="w-full h-full object-cover bg-white" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                    <Camera size={20} className="text-slate-500" />
                  </div>
                )}
                <button
                  onClick={() => leftRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-colors"
                >
                  <Camera size={10} className="text-white" />
                </button>
              </div>
              <input ref={leftRef} type="file" accept="image/*" className="hidden" onChange={handleLeftChange} />
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-300 mb-3">QR Print Right Image</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                {currentRight ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                    <img src={currentRight} alt="Right" className="w-full h-full object-cover bg-white" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                    <Camera size={20} className="text-slate-500" />
                  </div>
                )}
                <button
                  onClick={() => rightRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-colors"
                >
                  <Camera size={10} className="text-white" />
                </button>
              </div>
              <input ref={rightRef} type="file" accept="image/*" className="hidden" onChange={handleRightChange} />
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6">
          <h2 className="text-lg font-bold text-white mb-4">Restaurant Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Restaurant Name</label>
              <input
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Your restaurant name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
              <input
                value={user?.phoneNumber || ""}
                readOnly
                className="input-field opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Contact support to change your phone number.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Menu URL Slug</label>
              <input
                value={restaurant?.slug || "—"}
                readOnly
                className="input-field opacity-60 cursor-not-allowed font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2">
            <Save size={16} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
