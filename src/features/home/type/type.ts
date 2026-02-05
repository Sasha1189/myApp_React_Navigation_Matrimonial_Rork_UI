import { Profile } from "../../../types/profile";

export interface FetchFeedResult {
  profiles: Profile[];
  lastCreatedAt?: string; // This is the cursor for pagination
  done: boolean;
}

export interface FeedHookResult {
 profiles: Profile[];
  currentIndex: number;
  updateIndex: (val: number) => void;
  feedDone: boolean;      
  resetFeed: () => Promise<void>; 
  isLoading: boolean;
  isError: boolean;      
  error: Error | null;    
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  refetch: () => void;   
}