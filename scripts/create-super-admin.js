import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
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
  firstName: "Muaz",
  lastName: "Kedir",
  role: "super_admin"
};

async function createSuperAdmin() {
  try {
    console.log("Creating super admin user...");
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      SUPER_ADMIN.email,
      SUPER_ADMIN.password
    );
    
    const user = userCredential.user;
    console.log(`✓ User created with UID: ${user.uid}`);
    
    // Create user profile in users collection
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      firstName: SUPER_ADMIN.firstName,
      lastName: SUPER_ADMIN.lastName,
    });
    console.log("✓ User profile created");
    
    // Assign super_admin role in user_roles collection
    await setDoc(doc(db, "user_roles", user.uid), {
      userId: user.uid,
      role: SUPER_ADMIN.role,
      assignedAt: new Date(),
      assignedBy: "system"
    });
    console.log("✓ Super admin role assigned");
    
    console.log("\n✅ Super admin user created successfully!");
    console.log(`Email: ${SUPER_ADMIN.email}`);
    console.log(`Password: ${SUPER_ADMIN.password}`);
    console.log(`Name: ${SUPER_ADMIN.firstName} ${SUPER_ADMIN.lastName}`);
    console.log(`Role: ${SUPER_ADMIN.role}`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.error("❌ Error: This email is already registered.");
      console.log("\nIf you need to update the role, please use the Firebase Console or delete the existing user first.");
    } else {
      console.error("❌ Error creating super admin:", error.message);
    }
    process.exit(1);
  }
}

createSuperAdmin();
