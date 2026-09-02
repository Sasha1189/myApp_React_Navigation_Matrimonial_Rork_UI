import { InferSelectModel } from "drizzle-orm";
import { freeUserFeeds, paidUserFeeds } from "../schema/sqlprofiles";
import { Profile } from "@/features/profile/types/profile";

// Inferred types for both feed tables (share the same shape)
export type FreeProfileRow = InferSelectModel<typeof freeUserFeeds>;
export type PaidProfileRow = InferSelectModel<typeof paidUserFeeds>;
export type SqlProfileRow = FreeProfileRow | PaidProfileRow;

export function parseProfileRow(row: SqlProfileRow): Profile {
  const { profileData, ...dbColumns } = row;

  // Handles auto-parsed JSON object from Drizzle with runtime fallback for strings
  const fullProfile: Profile =
    typeof profileData === "string" ? JSON.parse(profileData) : profileData;

  return {
    ...fullProfile,
    uid: fullProfile?.uid || dbColumns.uid,
    ca: fullProfile?.ca ?? dbColumns.ca,
    ua: fullProfile?.ua ?? dbColumns.ua ?? undefined,
  };
}
