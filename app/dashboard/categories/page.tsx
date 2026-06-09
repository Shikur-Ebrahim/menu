"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, List } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRestaurant } from "@/hooks/useRestaurant";
import { createCategory, updateCategory, deleteCategory } from "@/lib/firestore";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { TableSkeleton } from "@/components/ui/Spinner";
import { Category } from "@/lib/types";

const schema = z.object({ name: z.string().min(1, "Category name is required").max(50) });
type FormData = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { user } = useAuth();
  const { restaurant, categories, loading, refresh } = useRestaurant(user?.uid ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openAdd = () => { setEditing(null); reset({ name: "" }); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditing(cat); setValue("name", cat.name); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); reset(); };

  const onSubmit = async (data: FormData) => {
    if (!restaurant) return;
    setSubmitting(true);
    try {
      if (editing) {
        await updateCategory(editing.id, data.name);
        toast.success("Category updated!");
      } else {
        await createCategory({ restaurantId: restaurant.id, name: data.name, createdAt: new Date().toISOString() });
        toast.success("Category added!");
      }
      closeModal();
      refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteCategory(deleteTarget.id);
      toast.success("Category deleted");
      setDeleteTarget(null);
      refresh();
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white font-display">Categories</h1>
          <p className="text-slate-400 mt-1">Organize your menu into categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <TableSkeleton rows={4} />
      ) : categories.length === 0 ? (
        <div className="glass-card rounded-2xl" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          <EmptyState
            icon={List}
            title="No categories yet"
            description="Add your first category to start organizing your menu items."
            action={
              <button onClick={openAdd} className="btn-primary px-4 py-2 rounded-xl text-sm flex items-center gap-2">
                <Plus size={14} /> Add Category
              </button>
            }
          />
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors ${i > 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <List size={15} className="text-indigo-400" />
              </div>
              <span className="flex-1 text-white font-medium">{cat.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(cat)}
                  className="p-2 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  title="Edit"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => setDeleteTarget(cat)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={closeModal} title={editing ? "Edit Category" : "Add Category"} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category Name</label>
            <input
              {...register("name")}
              placeholder="e.g. Breakfast, Drinks, Desserts"
              className="input-field"
              autoFocus
            />
            {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary px-4 py-2 rounded-xl text-sm">
              {submitting ? "Saving..." : editing ? "Save Changes" : "Add Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={submitting}
      />
    </div>
  );
}
