import { useFeed } from "./useFeed";

export function useFlattenedFeed(
  uid: string,
  gender?: string,
  limit = 10,
  filters?: Record<string, any>
) {
  const query = useFeed(uid, gender, limit, filters);

  const profiles = query.data?.pages?.flatMap((page) => page.profiles) ?? [];

  const lastPage =
    query.data && query.data.pages && query.data.pages.length > 0
      ? query.data.pages[query.data.pages.length - 1]
      : undefined;

  const feedDone = !!lastPage?.done;

  return { ...query, profiles, lastPage, feedDone };
}
