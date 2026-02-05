import { storage } from "./cacheConfig";

export const saveFeedIndex = (uid: string, index: number) => {
  storage.set(`feed_index_${uid}`, index);
};

export const getFeedIndex = (uid: string): number => {
  return storage.getNumber(`feed_index_${uid}`) || 0;
};