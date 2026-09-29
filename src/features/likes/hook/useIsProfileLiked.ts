import { useLikedSet } from "./useLikedSet";

export function useIsProfileLiked(targetUid: string): boolean {
  const likedSet = useLikedSet();
  return likedSet.has(targetUid);
}
