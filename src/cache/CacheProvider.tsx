import React, { ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persistOptions } from "./cacheConfig";
import { useAppCacheManager } from "./useAppCacheManager";
import { rtdb, auth } from "src/config/firebase";

export function CacheProvider({ children }: { children: ReactNode }) {
  const setupFirebase = () => {
    // Enables the "Magic Cache" on the phone's disk
    rtdb.setPersistenceEnabled(true);
    // Keep the Inbox list synced in background for instant loading
    const myUid = auth.currentUser?.uid;
    if (myUid) {
      rtdb.ref(`inbox/${myUid}`).keepSynced(true);
    }
  };

  setupFirebase();
  // 🔹 Logic for pruning/app state management lives here now
  useAppCacheManager();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
      onSuccess={() => console.log("MMKV Cache Hydrated")}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
