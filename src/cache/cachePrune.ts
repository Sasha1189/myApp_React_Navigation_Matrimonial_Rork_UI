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

export async function runPruneOnceDaily() {
  try {
    const now = Date.now();
    const lastPrune = storage.getNumber("lastPruneAt") || 0;

    if (now - lastPrune < 24 * 60 * 60 * 1000) return;

    pruneConfigs.forEach(({ prefix, max }) => {
      const queries = queryClient.getQueryCache().findAll({ queryKey: prefix });

      queries.forEach((q) => {
        const data = q.state.data as any[];

         if (Array.isArray(data) && data.length > max) {
          const pruned = data.slice(-max); 
          queryClient.setQueryData(q.queryKey, pruned);
        }
      });
    });

    storage.set("lastPruneAt", now);
    console.log("✅ Cache pruned successfully");
    
  } catch (err) {
    console.error("❌ Prune error:", err);
  }
}