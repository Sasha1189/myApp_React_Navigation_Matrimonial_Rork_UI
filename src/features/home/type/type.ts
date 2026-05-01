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
  isLoading: boolean;
  resetFeed?: () => void;
  refetch?: () => void;
  isError?: boolean;
  error?: Error;
  mode?: string;
}
