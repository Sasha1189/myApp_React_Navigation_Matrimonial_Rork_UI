import React, { ReactNode } from "react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient, persistOptions } from "./cacheConfig";
import { useAppCacheManager } from "./useAppCacheManager";

export function CacheProvider({ children }: { children: ReactNode }) {
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
