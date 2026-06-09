import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDulQSwtTam-HkqjFtzD1WPFBz4-ZVnANc",
  authDomain: "menu-93c21.firebaseapp.com",
  projectId: "menu-93c21",
  storageBucket: "menu-93c21.firebasestorage.app",
  messagingSenderId: "356997102639",
  appId: "1:356997102639:web:d25042d10e5bff468c1ada",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function seed() {
  const phone = "0911223344";
  const email = `${phone}@nemu.com`;
  const password = "password123";
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    
    await setDoc(doc(db, "users", uid), {
      uid,
      restaurantName: "Sample Restaurant",
      phoneNumber: phone,
      authEmail: email,
      generatedPassword: password,
      role: "owner",
      status: "approved",
      createdAt: new Date().toISOString(),
    });

    await setDoc(doc(db, "restaurants", uid), {
      ownerId: uid,
      restaurantName: "Sample Restaurant",
      slug: "sample-restaurant",
      status: "approved",
      createdAt: new Date().toISOString(),
    });

    console.log("=========================================");
    console.log("✅ Sample Owner Created Successfully!");
    console.log(`📱 Login Phone Number: ${phone}`);
    console.log("=========================================");
  } catch(e) { 
    if (e.code === "auth/email-already-in-use") {
        console.log("✅ Sample Owner already exists! Phone: 0911223344");
    } else {
        console.error("Error:", e.message); 
    }
  }
  process.exit(0);
}

seed();
