import { useEffect } from "react";
import { runPruneOnceDaily } from "./cachePrune";


export function useAppCacheManager() {
  useEffect(() => {
    const timer = setTimeout(() => {
      runPruneOnceDaily();
    }, 60 * 1000);

    return () => clearTimeout(timer);
  }, []);
}
