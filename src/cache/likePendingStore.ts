import { storage } from "./cacheConfig";

const PENDING_KEY = (uid: string) => `pending_likes_${uid}`;

export const LikePendingStore = {
  get: (uid: string): string[] => {
    return JSON.parse(storage.getString(PENDING_KEY(uid)) || "[]");
  },
  
  toggle: (uid: string, targetId: string) => {
    const current = LikePendingStore.get(uid);
    const next = current.includes(targetId) 
      ? current.filter(id => id !== targetId) 
      : [...current, targetId];
    storage.set(PENDING_KEY(uid), JSON.stringify(next));
  },

  clear: (uid: string, syncedIds: string[]) => {
    const current = LikePendingStore.get(uid);
    // Only remove the IDs that were successfully sent to server
    const remaining = current.filter(id => !syncedIds.includes(id));
    if (remaining.length === 0) storage.remove(PENDING_KEY(uid));
    else storage.set(PENDING_KEY(uid), JSON.stringify(remaining));
  }
};