// simple code to prune old cached data in react-query
// pruneCache.ts 
import { queryClient } from "./cacheConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface PruneConfig {
  prefix: string[];
  max: number;
}

const pruneConfigs: PruneConfig[] = [
  { prefix: ["feed", "latest"], max: 200 },
  { prefix: ["feed", "recommended"], max: 200 },
  { prefix: ["likes", "sent"], max: 100 },
  { prefix: ["likes", "received"], max: 100 },
  { prefix: ["recentChatPartners"], max: 50 },
  { prefix: ["chatMessages"], max: 500 },
  { prefix: ["profile", "self"], max: 1 }, // self profile always kept
];

export async function runPruneOnceDaily() {
  try {
    const now = Date.now();
    const lastPruneStr = await AsyncStorage.getItem("lastPruneAt");
    const lastPrune = lastPruneStr ? parseInt(lastPruneStr, 10) : 0;

    if (now - lastPrune < 24 * 60 * 60 * 1000) {
      console.log("🟡 Skip prune (already done today)");
      return;
    }

    console.log("🧹 Running daily cache prune...");

    pruneConfigs.forEach(({ prefix, max }) => {
      const queries = queryClient.getQueryCache().findAll({ queryKey: prefix });

      queries.forEach((q) => {
        const data = q.state.data as any[];
        if (Array.isArray(data) && data.length > max) {
          const pruned = data.slice(-max); // keep newest N
          queryClient.setQueryData(q.queryKey, pruned);
          console.log(
            `🔻 Pruned ${JSON.stringify(q.queryKey)} to ${pruned.length}/${data.length}`
          );
        }
      });
    });

    await AsyncStorage.setItem("lastPruneAt", now.toString());
    console.log("✅ Cache prune done");
  } catch (err) {
    console.error("❌ Prune error:", err);
  }
}


//////////////////////sorting logic code (if needed in future)//////////////////////
// import { QueryClient } from "@tanstack/react-query";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { pruneConfigs } from "./cacheConfig";

// // -------------------- Types --------------------
// type SortConfig =
//   | "asc"
//   | "desc"
//   | { field: string; direction: "asc" | "desc" };

// function sortItems(arr: any[], sort?: SortConfig): any[] {
//   if (!sort) return arr;

//   if (sort === "asc" || sort === "desc") {
//     return [...arr].sort((a, b) =>
//       sort === "asc" ? a - b : b - a
//     );
//   }

//   if (typeof sort === "object") {
//     const { field, direction } = sort;
//     return [...arr].sort((a, b) => {
//       const av = a?.[field];
//       const bv = b?.[field];
//       if (av === undefined || bv === undefined) return 0;

//       return direction === "asc"
//         ? av > bv
//           ? 1
//           : -1
//         : av < bv
//         ? 1
//         : -1;
//     });
//   }

//   return arr;
// }

// // -------------------- Run once daily --------------------
// export async function runPruneOnceDaily(queryClient: QueryClient) {
//   const lastRun = await AsyncStorage.getItem("lastPruneTime");
//   const now = Date.now();
//   const oneDay = 1000 * 60 * 60 * 24;

//   if (lastRun && now - parseInt(lastRun, 10) < oneDay) {
//     return; // ✅ already ran within 24h
//   }

//   console.log("🧹 Running cache prune...");

//   pruneConfigs.forEach((config) => {
//     const queries = queryClient
//       .getQueryCache()
//       .findAll({ queryKey: config.prefix });

//     queries.forEach((q) => {
//       const data: any[] = q.state.data;
//       if (Array.isArray(data) && data.length > config.max) {
//         const sorted = sortItems(data, config.sort);
//         const pruned = sorted.slice(0, config.max);
//         queryClient.setQueryData(q.queryKey, pruned);
//       }
//     });
//   });

//   await AsyncStorage.setItem("lastPruneTime", now.toString());
//   console.log("✅ Cache prune finished");
// }

