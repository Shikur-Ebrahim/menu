import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "./firebase";

const AUTH_DOMAIN = process.env.NEXT_PUBLIC_AUTH_DOMAIN || "nemu.com";

/**
 * Convert Ethiopian phone number to internal auth email
 * e.g. 0912345678 → 0912345678@nemu.com
 */
export function phoneToEmail(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
  return `${cleaned}@${AUTH_DOMAIN}`;
}

/**
 * Generate a secure random password
 */
export function generatePassword(length = 16): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((x) => chars[x % chars.length])
    .join("");
}

/**
 * Register a new user with email and password
 */
export async function registerWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Update the current user's password
 */
export async function updateUserPassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("No authenticated user");

  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await firebaseUpdatePassword(user, newPassword);
}
