import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  onAuthStateChanged, signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/integrations/firebase/client";
import { useNavigate } from "react-router-dom";

interface AppUser {
  uid: string;
  email: string;
  name: string;       // always populated — displayName or email prefix
  avatar?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// ── Helper: extract best display name from Firebase user ─────────
function resolveName(fbUser: FirebaseUser): string {
  // 1. Use Firebase displayName if set
  if (fbUser.displayName && fbUser.displayName.trim()) {
    return fbUser.displayName.trim();
  }
  // 2. Google auth often puts name in providerData
  const googleProvider = fbUser.providerData.find(p => p.providerId === "google.com");
  if (googleProvider?.displayName) return googleProvider.displayName.trim();

  // 3. Fall back to email prefix (before @), capitalised
  if (fbUser.email) {
    const prefix = fbUser.email.split("@")[0];
    // Capitalise first letter of each word
    return prefix
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase());
  }
  return "User";
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          uid: fbUser.uid,
          email: fbUser.email || "",
          name: resolveName(fbUser),
          avatar: fbUser.photoURL || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
