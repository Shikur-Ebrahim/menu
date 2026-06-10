"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Wallet, Trash2, Building, Camera, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { updateRestaurant } from "@/lib/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { PaymentAccount } from "@/lib/types";
import { PageLoader } from "@/components/ui/Spinner";

const ETHIOPIAN_BANKS = [
  "Commercial Bank of Ethiopia (CBE)",
  "Telebirr",
  "Awash Bank",
  "Dashen Bank",
  "Bank of Abyssinia",
  "Cooperative Bank of Oromia",
  "Wegagen Bank",
  "Zemen Bank",
  "Hibret Bank",
  "Nib International Bank",
  "Oromia International Bank",
  "Enat Bank",
  "Amhara Bank",
  "CBE Birr",
  "M-Pesa"
];

export default function AccountsPage() {
  const { user } = useAuth();
  const { restaurant, loading, refresh } = useRestaurant(user?.uid ?? null);
  
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);

  // Form state
  const [bankName, setBankName] = useState(ETHIOPIAN_BANKS[0]);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (loading) return <PageLoader />;

  const accounts = restaurant?.paymentAccounts || [];
  
  const isPhoneNumber = bankName.toLowerCase().includes("telebirr") || bankName.toLowerCase().includes("birr") || bankName.toLowerCase().includes("m-pesa");
  const identifierLabel = isPhoneNumber ? "Phone Number" : "Account Number";

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;
    if (!accountName.trim() || !accountNumber.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      let logoUrl = editingAccount?.logoUrl || "";
      if (logoFile) {
        logoUrl = await uploadToCloudinary(logoFile, "nemu/banks");
      }

      const newAccount: PaymentAccount = {
        id: editingAccount ? editingAccount.id : Date.now().toString(),
        bankName,
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        logoUrl,
      };

      let updatedAccounts;
      if (editingAccount) {
        updatedAccounts = accounts.map((acc) => acc.id === editingAccount.id ? newAccount : acc);
      } else {
        updatedAccounts = [...accounts, newAccount];
      }
      
      await updateRestaurant(restaurant.id, { paymentAccounts: updatedAccounts });
      
      toast.success(editingAccount ? "Account updated!" : "Payment account added!");
      handleCancel();
      refresh();
    } catch (error) {
      toast.error("Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleEditAccount = (account: PaymentAccount) => {
    setEditingAccount(account);
    setBankName(account.bankName);
    setAccountName(account.accountName);
    setAccountNumber(account.accountNumber);
    setLogoPreview(account.logoUrl || "");
    setLogoFile(null);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingAccount(null);
    setAccountName("");
    setAccountNumber("");
    setBankName(ETHIOPIAN_BANKS[0]);
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!restaurant) return;
    if (!confirm("Are you sure you want to remove this account?")) return;

    setDeletingId(accountId);
    try {
      const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
      await updateRestaurant(restaurant.id, { paymentAccounts: updatedAccounts });
      toast.success("Account removed");
      refresh();
    } catch (error) {
      toast.error("Failed to remove account");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Payment Accounts</h1>
          <p className="text-slate-400 mt-1">Manage where your customers can send payments.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Add Account
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-card p-6 rounded-2xl border border-white/5 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-4">{editingAccount ? "Edit Account" : "Add New Account"}</h2>
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Bank / Provider</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input-field"
                  required
                >
                  {ETHIOPIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank} className="bg-slate-900 text-white">
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Account Holder Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{identifierLabel}</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder={isPhoneNumber ? "e.g. 0911234567" : "e.g. 1000123456789"}
                  className="input-field"
                  required
                />
              </div>

              <div className="md:col-span-2 mt-2 border-t border-white/5 pt-4">
                <label className="block text-sm font-medium text-slate-300 mb-3">Bank / Provider Logo</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {logoPreview ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover bg-white" />
                      </div>
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors" 
                        onClick={() => fileRef.current?.click()}
                      >
                        <Camera size={20} className="text-slate-500" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-lg transition-colors"
                    >
                      <Camera size={10} className="text-white" />
                    </button>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <div>
                    <p className="text-slate-400 text-xs">Upload the bank or provider's logo (optional)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-6"
              >
                {saving ? "Saving..." : (editingAccount ? "Update Account" : "Save Account")}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account List */}
      {accounts.length === 0 && !isAdding ? (
        <div className="glass-card p-12 rounded-2xl text-center border border-white/5">
          <Wallet size={48} className="text-slate-500 mx-auto mb-4" />
          <h3 className="text-white font-bold text-lg mb-2">No Payment Accounts</h3>
          <p className="text-slate-400 mb-6">You haven't added any payment accounts yet. Customers won't see any payment options.</p>
          <button
            onClick={() => setIsAdding(true)}
            className="btn-primary"
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="glass-card p-5 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 mb-4">
                  {account.logoUrl ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center p-1">
                      <img src={account.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Building size={20} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-bold">{account.bankName}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditAccount(account)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit Account"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteAccount(account.id)}
                    disabled={deletingId === account.id}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Account"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-slate-400">Account Holder</p>
                <p className="text-base text-white font-medium tracking-wide">{account.accountName}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-sm text-slate-400">
                  {account.bankName.toLowerCase().includes("telebirr") || account.bankName.toLowerCase().includes("birr") || account.bankName.toLowerCase().includes("m-pesa") ? "Phone Number" : "Account Number"}
                </p>
                <p className="text-lg text-indigo-300 font-mono font-bold tracking-wider">{account.accountNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
