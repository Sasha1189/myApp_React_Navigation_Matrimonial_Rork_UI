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
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  resetFeed?: () => void;
  refetch?: () => void;
  isError?: boolean;
  error?: Error | null;
  loadMore?: () => void;
  mode?: string;
  feedKey?: string;
}
