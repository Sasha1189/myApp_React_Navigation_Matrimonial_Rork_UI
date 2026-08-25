import { appStorage, safeParse } from "@/cacheMMKV/cacheConfig";

export type FeedMode = "default" | "latest" | "search" | "filter";

export const FeedCache = {
  // Key Generators
  getKeys: (uid: string) => ({
    mode: `active_mode_${uid}`,
    searchQuery: `search_query_${uid}`,
    searchField: `search_field_${uid}`,
    filterParams: `active_filter_params_${uid}`,
    lastCa: `last_ca_${uid}`,
  }),

  // Getters....................
  getMode: (uid: string): FeedMode => {
    const key = FeedCache.getKeys(uid).mode;
    return (appStorage.getString(key) as FeedMode) || "default";
  },

  getSearchQuery: (uid: string): string => {
    const key = FeedCache.getKeys(uid).searchQuery;
    return appStorage.getString(key) || "";
  },

  getSearchField: (uid: string): string => {
    const key = FeedCache.getKeys(uid).searchField;
    return appStorage.getString(key) || "fullName";
  },

  getFilterParams: (uid: string): Record<string, any> | null => {
    const key = FeedCache.getKeys(uid).filterParams;
    return safeParse<Record<string, any> | null>(
      appStorage.getString(key),
      null,
    );
  },

  getLastCa: (uid: string): number | null => {
    if (!uid) return null;
    const key = FeedCache.getKeys(uid).lastCa;
    const num = appStorage.getNumber(key);
    if (num !== undefined) return num;
    const str = appStorage.getString(key);
    return str ? Number(str) : null;
  },

  // Setters & Removers...............
  setMode: (uid: string, mode: FeedMode) => {
    appStorage.set(FeedCache.getKeys(uid).mode, mode);
  },

  setSearchQuery: (uid: string, query: string) => {
    appStorage.set(FeedCache.getKeys(uid).searchQuery, query);
  },

  setSearchField: (uid: string, field: string) => {
    if (!uid) return;
    appStorage.set(FeedCache.getKeys(uid).searchField, field);
  },

  // Compound Action to Clear Search State
  clearSearch: (uid: string) => {
    if (!uid) return;
    const keys = FeedCache.getKeys(uid);
    appStorage.set(keys.mode, "default");
    appStorage.remove(keys.searchQuery);
    appStorage.remove(keys.searchField);
  },

  setFilterParams: (uid: string, params: Record<string, any> | null) => {
    if (!uid) return;
    const key = FeedCache.getKeys(uid).filterParams;
    if (!params) {
      appStorage.remove(key);
    } else {
      appStorage.set(key, JSON.stringify(params));
    }
  },

  clearFilter: (uid: string) => {
    if (!uid) return;
    const keys = FeedCache.getKeys(uid);
    appStorage.set(keys.mode, "default");
    appStorage.remove(keys.filterParams);
  },

  setLastCa: (uid: string, ca: number) => {
    if (!uid || ca === undefined || ca === null) return;
    appStorage.set(FeedCache.getKeys(uid).lastCa, Number(ca));
  },

  clearLastCa: (uid: string) => {
    if (!uid) return;
    appStorage.remove(FeedCache.getKeys(uid).lastCa);
  },
};
