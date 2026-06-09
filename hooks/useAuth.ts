"use client";

import { useEffect } from "react";
import { onAuthChange } from "@/lib/auth";
import { getUser } from "@/lib/firestore";
import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, firebaseUid, loading, setUser, setFirebaseUid, setLoading, clearAuth } =
    useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUid(firebaseUser.uid);
        const userData = await getUser(firebaseUser.uid);
        setUser(userData);
      } else {
        clearAuth();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, firebaseUid, loading };
}
