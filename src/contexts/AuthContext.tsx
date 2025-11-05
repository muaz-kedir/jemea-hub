import { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "student" | "tutor" | "trainer" | "librarian" | "super_admin";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  department?: string;
  year?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  assignRole: (userId: string, role: UserRole) => Promise<void>;
  getAllUsers: () => Promise<Array<UserProfile & { email: string }>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user profile from users collection (no role here)
          const profileDoc = await getDoc(doc(db, "users", user.uid));
          
          // Fetch user role from user_roles collection (separate for security)
          const roleDoc = await getDoc(doc(db, "user_roles", user.uid));
          
          if (profileDoc.exists()) {
            const profile = profileDoc.data();
            const role = roleDoc.exists() ? roleDoc.data().role : "student";
            
            setUserProfile({
              uid: user.uid,
              email: user.email!,
              role: role as UserRole,
              firstName: profile.firstName,
              lastName: profile.lastName,
              department: profile.department,
              year: profile.year,
            });
          } else {
            // Default profile if doesn't exist
            const role = roleDoc.exists() ? roleDoc.data().role : "student";
            setUserProfile({
              uid: user.uid,
              email: user.email!,
              role: role as UserRole,
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, role: UserRole = "student") => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile WITHOUT role (security best practice)
    const userProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      firstName: "",
      lastName: "",
    };
    
    // Store profile in users collection
    await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
    
    // Store role in separate user_roles collection for security
    await setDoc(doc(db, "user_roles", userCredential.user.uid), {
      userId: userCredential.user.uid,
      role,
      assignedAt: new Date(),
      assignedBy: "system"
    });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in");
    
    // Only update profile fields, NOT role (role is in separate collection)
    const { role, uid, email, ...profileData } = data;
    
    await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
    
    const updatedProfile = { ...userProfile, ...data } as UserProfile;
    setUserProfile(updatedProfile);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const assignRole = async (userId: string, role: UserRole) => {
    if (!user || !userProfile || userProfile.role !== "super_admin") {
      throw new Error("Only super_admin can assign roles");
    }

    // Update role in user_roles collection
    await setDoc(doc(db, "user_roles", userId), {
      userId,
      role,
      assignedAt: new Date(),
      assignedBy: user.uid
    });
  };

  const getAllUsers = async (): Promise<Array<UserProfile & { email: string }>> => {
    if (!user || !userProfile || userProfile.role !== "super_admin") {
      throw new Error("Only super_admin can view all users");
    }

    const usersSnapshot = await getDocs(collection(db, "users"));
    const rolesSnapshot = await getDocs(collection(db, "user_roles"));

    const rolesMap = new Map();
    rolesSnapshot.docs.forEach(doc => {
      rolesMap.set(doc.id, doc.data().role);
    });

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email || "",
        role: rolesMap.get(doc.id) || "student",
        firstName: data.firstName,
        lastName: data.lastName,
        department: data.department,
        year: data.year,
      } as UserProfile & { email: string };
    });

    return users;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      updateProfile,
      assignRole,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
