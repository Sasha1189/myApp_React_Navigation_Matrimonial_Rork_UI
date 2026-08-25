import { Profile } from "../../profile/types/profile";

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
