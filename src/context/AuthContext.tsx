import {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  set,
  onDisconnect,
  serverTimestamp,
  update,
} from "@react-native-firebase/database";
import { AppState, AppStateStatus } from "react-native";
import { rtdb } from "../config/firebase";
// 1. Define the type of our context value

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
}

// 2. Create the context with correct type (or undefined initially)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const rtdb = getDatabase();

  const renderCount = useRef(0);
  renderCount.current += 1;

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  // 2. Presence & AppState Listener (Modular)
  useEffect(() => {
    if (!user?.uid) return;

    const myStatusRef = ref(rtdb, `/status/${user.uid}`);
    const connectedRef = ref(rtdb, ".info/connected");

    // Listen for Connection State (Modular onValue)
    const unsubConnection = onValue(connectedRef, (snap) => {
      if (snap.val() === false) return;

      // Queue Server-side Offline on disconnect
      onDisconnect(myStatusRef)
        .set({
          state: "offline",
          lastChanged: serverTimestamp(),
        })
        .then(() => {
          // Set Online status immediately
          set(myStatusRef, {
            state: "online",
            lastChanged: serverTimestamp(),
          });
        });
    });

    // Handle App Background/Foreground for Cost & UX
    const handleAppState = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        update(myStatusRef, {
          state: "online",
          lastChanged: serverTimestamp(),
        });
      } else {
        update(myStatusRef, {
          state: "offline",
          lastChanged: serverTimestamp(),
        });
      }
    };

    const appStateSub = AppState.addEventListener("change", handleAppState);

    // 3. Cleanup on Logout or Component Unmount
    return () => {
      unsubConnection();
      appStateSub.remove();
      // Set to offline manually when logging out/unmounting
      update(myStatusRef, {
        state: "offline",
        lastChanged: serverTimestamp(),
      });
    };
  }, [user?.uid, rtdb]);

  const value = useMemo(
    () => ({ user, authLoading, setUser }),
    [user, authLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Hook to consume context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
