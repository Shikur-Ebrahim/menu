"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  firebaseUid: string | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setFirebaseUid: (uid: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      firebaseUid: null,
      loading: false,
      setUser: (user) => set({ user }),
      setFirebaseUid: (uid) => set({ firebaseUid: uid }),
      setLoading: (loading) => set({ loading }),
      clearAuth: () => set({ user: null, firebaseUid: null, loading: false }),
    }),
    {
      name: "nemu-auth",
      partialize: (state) => ({ user: state.user, firebaseUid: state.firebaseUid }),
    }
  )
);
