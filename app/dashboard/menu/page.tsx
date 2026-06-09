"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, UtensilsCrossed, ImageIcon, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { createMenuItem, updateMenuItem, deleteMenuItem } from "@/lib/firestore";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/utils";
import { MenuItem } from "@/lib/types";

const schema = z.object({
  foodName: z.string().min(1, "Food name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Please select a category"),
  availability: z.enum(["available", "out_of_stock"]),
});
type FormData = z.infer<typeof schema>;

export default function MenuItemsPage() {
  const { user } = useAuth();
  const { restaurant, categories, menuItems, loading, refresh } = useRestaurant(user?.uid ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { availability: "available" },
  });

  const openAdd = () => {
    setEditing(null);
    setImageFile(null);
    setImagePreview("");
    reset({ availability: "available", price: 0 });
    setModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setImagePreview(item.imageUrl || "");
    setImageFile(null);
    reset({
      foodName: item.foodName,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      availability: item.availability,
    });
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); reset(); setImageFile(null); setImagePreview(""); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    if (!restaurant) return;
    setSubmitting(true);
    try {
      let imageUrl = editing?.imageUrl || "";
      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadToCloudinary(imageFile, "nemu/menu");
        setUploadingImage(false);
      }

      if (editing) {
        await updateMenuItem(editing.id, { ...data, imageUrl });
        toast.success("Menu item updated!");
      } else {
        await createMenuItem({
          restaurantId: restaurant.id,
          ...data,
          description: data.description || "",
          imageUrl,
          createdAt: new Date().toISOString(),
        });
        toast.success("Menu item added!");
      }
      closeModal();
      refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteMenuItem(deleteTarget.id);
      toast.success("Menu item deleted");
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const getCatName = (id: string) => categories.find((c) => c.id === id)?.name || "—";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Menu Items</h1>
          <p className="text-slate-400 mt-1">{menuItems.length} items in your menu</p>
        </div>
        <button onClick={openAdd} disabled={categories.length === 0} title={categories.length === 0 ? "Add categories first" : ""} className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {categories.length === 0 && !loading && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-300 text-sm">
          ⚠️ You need to <a href="/dashboard/categories" className="underline font-semibold">create categories</a> before adding menu items.
        </div>
      )}

      {loading ? <TableSkeleton rows={5} /> : menuItems.length === 0 ? (
        <div className="glass-card rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <EmptyState icon={UtensilsCrossed} title="No menu items yet" description="Add your dishes, drinks, and specials with photos and prices." action={
            <button onClick={openAdd} disabled={categories.length === 0} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
              <Plus size={14} /> Add First Item
            </button>
          } />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl overflow-hidden hover:border-white/15 transition-all" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="relative h-40 bg-slate-800">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.foodName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
                )}
                <div className="absolute top-2 right-2">
                  <StatusBadge status={item.availability} />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm truncate">{item.foodName}</h3>
                <p className="text-slate-400 text-xs mt-0.5 mb-2">{getCatName(item.categoryId)}</p>
                {item.description && <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{item.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold text-sm">{formatPrice(item.price)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Menu Item" : "Add Menu Item"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Food Image</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative h-40 rounded-xl border-2 border-dashed border-white/10 hover:border-indigo-500/50 cursor-pointer transition-colors overflow-hidden flex items-center justify-center bg-slate-900/50"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImagePreview(""); }} className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon size={28} className="text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Click to upload image</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Food Name *</label>
              <input {...register("foodName")} placeholder="e.g. Tibs Special" className="input-field" />
              {errors.foodName && <p className="mt-1 text-xs text-red-400">{errors.foodName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Price (ETB) *</label>
              <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" min="0" placeholder="0.00" className="input-field" />
              {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <textarea {...register("description")} placeholder="Describe the dish..." rows={2} className="input-field resize-none" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category *</label>
              <select {...register("categoryId")} className="input-field">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-red-400">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Availability *</label>
              <select {...register("availability")} className="input-field">
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary px-5 py-2 rounded-xl text-sm">
              {uploadingImage ? "Uploading image..." : submitting ? "Saving..." : editing ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Menu Item"
        message={`Delete "${deleteTarget?.foodName}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
