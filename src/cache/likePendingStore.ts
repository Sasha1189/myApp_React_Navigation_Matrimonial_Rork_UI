import { storage } from "./cacheConfig";

const PENDING_KEY = (uid: string) => `pending_likes_${uid}`;

export const LikePendingStore = {
  // Get all IDs currently waiting to be synced
  get: (uid: string): string[] => {
    const raw = storage.getString(PENDING_KEY(uid));
    return raw ? JSON.parse(raw) : [];
  },

  // Toggle a like in the local queue
  toggle: (uid: string, targetId: string) => {
    const current = LikePendingStore.get(uid);
    const exists = current.includes(targetId);

    // If it exists, remove it (user changed mind); otherwise add it
    const next = exists
      ? current.filter((id) => id !== targetId)
      : [...current, targetId];

    storage.set(PENDING_KEY(uid), JSON.stringify(next));
    return next.length; // Return count to trigger auto-sync if too many
  },

  // Remove specific IDs after successful server sync
  remove: (uid: string, syncedIds: string[]) => {
    const current = LikePendingStore.get(uid);
    const next = current.filter((id) => !syncedIds.includes(id));

    if (next.length === 0) storage.remove(PENDING_KEY(uid));
    else storage.set(PENDING_KEY(uid), JSON.stringify(next));
  },
};
