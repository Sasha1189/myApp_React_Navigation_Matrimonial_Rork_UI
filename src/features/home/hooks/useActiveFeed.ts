import { useFeedDefault } from "./useFeedDefault";
import { useFeedLatest } from "./useFeedLatest";
import { useFeedMatches } from "./useFeedMatches";
import { useFeedSearch } from "./useFeedSearch";
import { storage } from "../../../cache/cacheConfig";
import {FeedHookResult} from "../type/type";

export function useActiveFeed(uid: string, gender: string): FeedHookResult {
  const mode = storage.getString(`active_mode_${uid}`) || 'default';
  
  const searchParams = JSON.parse(storage.getString(`active_search_params_${uid}`) || '{}');
  const recoParams = JSON.parse(storage.getString(`active_reco_params_${uid}`) || '{}');
  
  const feeds: Record<string, FeedHookResult> = {
    default: useFeedDefault(uid, gender),
    latest: useFeedLatest(uid, gender),
    matches: useFeedMatches(uid, gender, recoParams),
    search: useFeedSearch(uid, gender, searchParams), // Empty params for now
  };

  return feeds[mode] || feeds.default;
}