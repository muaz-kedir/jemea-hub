import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJD-k8qakS0a8iGjBG71dQMBpoA3XjJNA",
  authDomain: "humsj-academic-sector.firebaseapp.com",
  projectId: "humsj-academic-sector",
  storageBucket: "humsj-academic-sector.firebasestorage.app",
  messagingSenderId: "103611783382",
  appId: "1:103611783382:web:c0698dd7f51ddf25125177",
  measurementId: "G-967YB88HBF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Super Admin credentials
const SUPER_ADMIN = {
  email: "kedirmuaz955@gmail.com",
  password: "mk12@mk12",
  role: "super_admin"
};

async function assignSuperAdminRole() {
  try {
    console.log("Signing in as super admin...");
    
    // Sign in with the super admin credentials
    const userCredential = await signInWithEmailAndPassword(
      auth,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password
    );
    
    const user = userCredential.user;
    console.log(`✓ Signed in with UID: ${user.uid}`);
    
    // Assign super_admin role in user_roles collection
    await setDoc(doc(db, "user_roles", user.uid), {
      userId: user.uid,
      role: SUPER_ADMIN.role,
      assignedAt: new Date(),
      assignedBy: "system"
    });
    console.log("✓ Super admin role assigned");
    
    console.log("\n✅ Super admin role assigned successfully!");
    console.log(`Email: ${SUPER_ADMIN.email}`);
    console.log(`Role: ${SUPER_ADMIN.role}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error assigning super admin role:", error.message);
    console.log("\nPlease make sure:");
    console.log("1. The Firestore rules allow users to create their own role document");
    console.log("2. The user exists with the correct email and password");
    process.exit(1);
  }
}

assignSuperAdminRole();
