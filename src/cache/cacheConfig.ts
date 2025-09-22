import { QueryClient } from "@tanstack/react-query";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Central prune config (tweak sizes anytime)
export const pruneConfigs = [
  { prefix: ["profiles"], max: 500, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["latestProfiles"], max: 100, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["recommendedProfiles"], max: 100, sort: { field: "score", direction: "desc" } },
  { prefix: ["recentChatPartners"], max: 50, sort: { field: "lastMessageAt", direction: "desc" } },
  { prefix: ["messages"], max: 200, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["likesSent"], max: 100, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["likesReceived"], max: 100, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["selfProfile"], max: 1 }, // always keep latest
];

// 🔹 QueryClient
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h
      cacheTime: 1000 * 60 * 60 * 24 * 7, // 7d
    },
  },
});

// 🔹 Persister for AsyncStorage
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
});

// 🔹 Init persistence (called once in App.tsx)
export function initPersistence() {
  persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
  });
}
// Note: you can call `asyncStoragePersister.removeClient()` to clear persisted cache