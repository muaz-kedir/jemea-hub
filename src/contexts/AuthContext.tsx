import { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
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
        const profileDoc = await getDoc(doc(db, "users", user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
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
    const userProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      role,
    };
    await setDoc(doc(db, "users", userCredential.user.uid), userProfile);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("No user logged in");
    const updatedProfile = { ...userProfile, ...data } as UserProfile;
    await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
    setUserProfile(updatedProfile);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut, updateProfile }}>
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
