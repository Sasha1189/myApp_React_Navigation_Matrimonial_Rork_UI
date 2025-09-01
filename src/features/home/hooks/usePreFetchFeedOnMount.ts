import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchFeed } from "../apis/feedApi";

export function usePrefetchFeedOnMount() {
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchInfiniteQuery({
      queryKey: ["feed"],
      queryFn: fetchFeed,
      initialPageParam: 1,
    });
  }, [queryClient]);
}
