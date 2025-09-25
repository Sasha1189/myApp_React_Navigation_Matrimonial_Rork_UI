import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
    },
  },
});

// 🔹 Persister
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// 🔹 Init persistence + pruning
export function initPersistence() {
  persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

// 🔹 Clear persisted cache on logout
export async function clearCacheOnLogout() {
  await asyncStoragePersister.removeClient();
  queryClient.clear();
}