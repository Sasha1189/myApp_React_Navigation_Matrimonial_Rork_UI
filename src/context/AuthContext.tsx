import {
  useState,
  useEffect,
  useContext,
  createContext,
  useRef,
  useMemo,
  ReactNode,
} from "react";
import {
  getAuth,
  onAuthStateChanged,
  FirebaseAuthTypes,
} from "@react-native-firebase/auth";
import {
  ref,
  query,
  get,
  limitToLast,
  onValue,
  set,
  onDisconnect,
  serverTimestamp,
  update,
  goOnline,
  goOffline,
  keepSynced,
} from "@react-native-firebase/database";
import { AppState, AppStateStatus } from "react-native";
import { rtdb } from "../config/firebase";
import { LikesCache, storage } from "../cache/cacheConfig";

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  authLoading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 4. Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
    const inboxRef = ref(rtdb, `inbox/${user.uid}`);
    //sync likedid to device if device changed
    const likesSentRef = query(
      ref(rtdb, `likesSent/${user.uid}`),
      limitToLast(1000),
    );

    // A. Proactive Sync: Keep Inbox on disk for 0ms loading
    keepSynced(inboxRef, true);

    const syncIdIndex = async () => {
      // Only sync if the index is brand new/empty to save bandwidth
      if (LikesCache.getIds().length > 0) return;

      const snap = await get(likesSentRef);
      if (snap.exists()) {
        const ids = Object.keys(snap.val()); // Just get the UIDs
        storage.set("likes_ids_index", JSON.stringify(ids));
      }
    };

    syncIdIndex();

    // 1. Connection Listener (Standard Presence)
    const unsubConnection = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        onDisconnect(myStatusRef)
          .set({
            state: "offline",
            lastChanged: serverTimestamp(),
          })
          .then(() => {
            set(myStatusRef, {
              state: "online",
              lastChanged: serverTimestamp(),
            });
          });
      }
    });

    // 2. AppState Listener (Cost-Saving & Socket Control)
    const handleAppState = async (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Reconnect socket and set status
        goOnline(rtdb);
        update(myStatusRef, {
          state: "online",
          lastChanged: serverTimestamp(),
        });
      } else if (nextAppState === "background") {
        // Update status to 'offline' first while we still have a connection
        await update(myStatusRef, {
          state: "offline",
          lastChanged: serverTimestamp(),
        });
        // Kill the socket to save 100% of background data/bandwidth
        goOffline(rtdb);
      }
    };

    const appStateSub = AppState.addEventListener("change", handleAppState);

    return () => {
      unsubConnection();
      appStateSub.remove();
      keepSynced(inboxRef, false);
      update(myStatusRef, { state: "offline", lastChanged: serverTimestamp() });
    };
  }, [user?.uid]);

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
