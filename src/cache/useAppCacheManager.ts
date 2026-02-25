import { useEffect } from "react";
import { runPruneOnceDaily } from "./cachePrune";

export function useAppCacheManager() {
  useEffect(() => {
    runPruneOnceDaily(); // Guard handles the "daily" logic
  }, []);
}
