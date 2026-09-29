import { useSyncExternalStore, useMemo } from "react";
import { blocksStorage } from "@/cacheMMKV/cacheConfig";
import { BlocksCache } from "../cache/blockCache";

const BLOCKS_KEY = "blocked_ids_index";

const subscribeBlocks = (onStoreChange: () => void) => {
  const subscription = blocksStorage.addOnValueChangedListener((key) => {
    if (key === BLOCKS_KEY) {
      onStoreChange();
    }
  });
  return () => subscription.remove();
};
const getBlockedIdsSnapshot = () => BlocksCache.getMergedIds().join(",");

export function useBlockedSet(): Set<string> {
  const blockedIdsString = useSyncExternalStore(
    subscribeBlocks,
    getBlockedIdsSnapshot,
    getBlockedIdsSnapshot,
  );

  return useMemo(() => {
    if (!blockedIdsString) return new Set<string>();
    return new Set(blockedIdsString.split(","));
  }, [blockedIdsString]);
}
