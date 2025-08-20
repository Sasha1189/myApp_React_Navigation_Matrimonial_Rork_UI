import {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config/firebase";

// 1. Define the type of our context value
interface AuthContextType {
  user: User | null;
  authLoading: boolean;
  setUser: (user: User | null) => void;
}

// 2. Create the context with correct type (or undefined initially)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Hook to consume context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// 4. Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const renderCount = useRef(0);
  renderCount.current += 1;

  if (__DEV__) {
    console.log(`AuthContext render count: ${renderCount.current}`);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ user, authLoading, setUser }),
    [user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
