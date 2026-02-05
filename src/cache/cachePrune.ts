import { storage, queryClient } from "./cacheConfig";

interface PruneConfig {
  prefix: string[];
  max: number;
}
// 🔹 Central prune config
export const pruneConfigs = [
  { prefix: ["feed"], max: 500, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["latestProfiles"], max: 100, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["recommendedProfiles"], max: 100, sort: { field: "score", direction: "desc" } },
  { prefix: ["recentChatPartners"], max: 50, sort: { field: "lastMessageAt", direction: "desc" } },
  { prefix: ["messages"], max: 200, sort: { field: "createdAt", direction: "desc" } },
  { prefix: ["likesSentIds"], max: 100 },
  { prefix: ["likesReceivedIds"], max: 100 },
  { prefix: ["likesSentProfiles"], max: 100 },
  { prefix: ["likesReceivedProfiles"], max: 100 },
  { prefix: ["selfProfile"], max: 1 }, // always keep latest
];

const PRUNE_CONFIG = {
  feedPrefix: "feed", // Cleans 'feed:default', 'feed:latest', etc.
  maxProfiles: 300,   // Keep only the last 300 swiped/fetched profiles per shard
};

export async function runPruneOnceDaily() {
  try {
    const now = Date.now();
    const lastPrune = storage.getNumber("lastPruneAt") || 0;

    // Only run if 24 hours have passed
    if (now - lastPrune < 24 * 60 * 60 * 1000) return;

    // 1. Find all query keys starting with "feed"
    const feedQueries = queryClient.getQueryCache().findAll({ 
      queryKey: [PRUNE_CONFIG.feedPrefix] 
    });

    feedQueries.forEach((query) => {
      const state = query.state.data as any;
      
      if (state?.pages) {
        // Flatten all profiles from all pages into one list
        const allProfiles = state.pages.flatMap((page: any) => page.profiles);

        // If the shard has grown too large, prune the oldest items
        if (allProfiles.length > PRUNE_CONFIG.maxProfiles) {
          console.log(`Pruning shard: ${query.queryKey.join(':')}`);

          // Slice from the end to keep the newest N profiles
          const prunedList = allProfiles.slice(-PRUNE_CONFIG.maxProfiles);

          // Re-package back into the InfiniteQuery structure TanStack expects
          queryClient.setQueryData(query.queryKey, {
            pages: [{ profiles: prunedList, done: false }],
            pageParams: [undefined],
          });
        }
      }
    });

    storage.set("lastPruneAt", now);
    console.log("✅ Daily cache pruning complete.");
  } catch (err) {
    console.error("❌ Prune error:", err);
  }
}