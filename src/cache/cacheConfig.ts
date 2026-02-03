import { createMMKV } from 'react-native-mmkv';
import { QueryClient } from "@tanstack/react-query";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

export const storage = createMMKV({
  id: "myAppCache",
});

const clientStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return Promise.resolve(value ?? null);
  },
  removeItem: (key: string) => {
    storage.remove(key);
    return Promise.resolve();
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
      // Ensure data is retrieved from cache even if offline
      networkMode: 'offlineFirst', 
    },
  },
});

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: clientStorage,
  throttleTime: 1000, 
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 6, // 7 days
  buster: "v1-cache-key", // Change this to wipe cache on breaking schema changes
};

// 🔹 Clear persisted cache on logout
export async function clearCacheOnLogout() {
  storage.clearAll(); 
  queryClient.clear();
}