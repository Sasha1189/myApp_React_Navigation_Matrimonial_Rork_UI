import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { Profile } from "@/features/profile/types/profile";

export const userFeeds = sqliteTable(
  "user_feeds",
  {
    // Primary Key & Timestamps (ms stored as integers)
    uid: text("uid").primaryKey(),
    ca: integer("ca").notNull(), // createdAt (ms timestamp)
    ua: integer("ua"), // updatedAt (ms timestamp for latest feed sorting)

    // Search Columns
    fn: text("fn"), // firstName / fullName
    ln: text("ln"), // lastName

    // Filter Matrix Columns
    db: integer("db"),
    ht: integer("ht"), // height
    np: text("np"), // nativePlace
    ai: integer("ai"), // annualIncome
    ms: integer("ms"), // maritalStatus
    ir: text("ir"), // isReady stored as 0/1, mapped to boolean

    // Auto-parsed JSON payload
    profileData: text("profile_data", { mode: "json" })
      .$type<Profile>()
      .notNull(),
  },
  (table) => [
    index("idx_user_feeds_ca").on(table.ca),
    index("idx_user_feeds_ua").on(table.ua),
    index("idx_user_feeds_fn").on(table.fn),
    index("idx_user_feeds_ln").on(table.ln),
    index("idx_user_feeds_np").on(table.np),
    index("idx_user_feeds_filter_matrix").on(table.ms, table.ai, table.db),
  ],
);

export type SelectFeedItem = typeof userFeeds.$inferSelect;
export type InsertFeedItem = typeof userFeeds.$inferInsert;
