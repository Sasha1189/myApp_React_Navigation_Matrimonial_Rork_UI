import { InferSelectModel } from "drizzle-orm";
import { userFeeds } from "../schema/sqlprofiles";
import { Profile } from "@/features/profile/types/profile";

export type SqlProfileRow = InferSelectModel<typeof userFeeds>;

export function parseProfileRow(row: SqlProfileRow): Profile {
  const { profileData, ...dbColumns } = row;

  // Handles auto-parsed JSON object from Drizzle with runtime fallback for strings
  const fullProfile: Profile =
    typeof profileData === "string" ? JSON.parse(profileData) : profileData;

  return {
    ...fullProfile,
    uid: fullProfile?.uid || dbColumns.uid,
    ca: fullProfile?.ca ?? dbColumns.ca,
    ua: fullProfile?.ua ?? dbColumns.ua ?? null,
  };
}
