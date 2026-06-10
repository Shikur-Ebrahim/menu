"use client";

import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Save, Camera, Building2, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { updateRestaurant } from "@/lib/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { updateUserPassword } from "@/lib/auth";
import { PageLoader } from "@/components/ui/Spinner";
import Image from "next/image";

export default function SettingsPage() {
  const { user } = useAuth();
  const { restaurant, loading, refresh } = useRestaurant(user?.uid ?? null);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "");
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    try {
      let logo = restaurant.logo || "";
      if (logoFile) {
        logo = await uploadToCloudinary(logoFile, "nemu/logos");
      }
      await updateRestaurant(restaurant.id, { logo, restaurantName: restaurantName || restaurant.restaurantName });
      toast.success("Settings saved!");
      refresh();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    
    setPasswordSaving(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      if (error.message.includes("auth/invalid-credential") || error.message.includes("wrong-password")) {
        toast.error("Incorrect current password");
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  const currentLogo = logoPreview || restaurant?.logo;

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
                disabled
                readOnly
                className="input-field opacity-50 cursor-not-allowed bg-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">Contact support to change your phone number.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <button onClick={handleSave} disabled={saving} className="btn-primary px-6 py-3 rounded-xl flex items-center gap-2">
            <Save size={16} />
            {saving ? "Saving..." : "Save Profile Details"}
          </button>
        </div>
      </div>

      {/* Security Section */}
      <div className="glass-card p-6 rounded-2xl space-y-6 mt-6" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
        <div>
          <h2 className="text-lg font-bold text-white mb-2">Change Password</h2>
          <p className="text-sm text-slate-400 mb-4">Keep your account secure by regularly updating your password.</p>
          
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={passwordSaving} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Lock size={16} />
                {passwordSaving ? "Updating Password..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
