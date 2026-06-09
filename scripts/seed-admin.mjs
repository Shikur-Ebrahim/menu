/**
 * Run this script ONCE to create the Super Admin user in Firestore.
 * 
 * Prerequisites:
 * 1. Create a user in Firebase Console → Authentication with:
 *    Email: admin@nemu.com
 *    Password: (your chosen password)
 * 2. Copy that user's UID below
 * 3. Run: node scripts/seed-admin.mjs
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDulQSwtTam-HkqjFtzD1WPFBz4-ZVnANc",
  authDomain: "menu-93c21.firebaseapp.com",
  projectId: "menu-93c21",
  storageBucket: "menu-93c21.firebasestorage.app",
  messagingSenderId: "356997102639",
  appId: "1:356997102639:web:d25042d10e5bff468c1ada",
};

// ⬇️ PASTE YOUR ADMIN USER UID HERE (from Firebase Console → Authentication)
const ADMIN_UID = "PASTE_ADMIN_UID_HERE";
const ADMIN_EMAIL = "admin@nemu.com";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedAdmin() {
  if (ADMIN_UID === "PASTE_ADMIN_UID_HERE") {
    console.error("❌ Please set ADMIN_UID to the real UID from Firebase Console.");
    process.exit(1);
  }

  await setDoc(doc(db, "users", ADMIN_UID), {
    uid: ADMIN_UID,
    restaurantName: "Nemu Admin",
    phoneNumber: "0000000000",
    authEmail: ADMIN_EMAIL,
    generatedPassword: "",
    role: "admin",
    status: "approved",
    createdAt: new Date().toISOString(),
  });

  console.log("✅ Admin user created in Firestore!");
  console.log(`   UID: ${ADMIN_UID}`);
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log("\n🔐 Login at: http://localhost:3000/admin/login");
  process.exit(0);
}

seedAdmin().catch(console.error);
