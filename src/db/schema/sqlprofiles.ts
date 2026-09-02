import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { Profile } from "@/features/profile/types/profile";

// Helper to construct table columns consistently across free and paid tiers
const baseFeedColumns = {
  // Primary Key & Timestamps (ms stored as integers)
  uid: text("uid").primaryKey(),
  ca: integer("ca").notNull(), // createdAt (ms timestamp)
  ua: integer("ua"), // updatedAt (ms timestamp for latest feed sorting)

  // Search Columns
  fn: text("fn"), // firstName / fullName
  ln: text("ln"), // lastName

  // Filter Matrix Columns
  db: integer("db"), // dateOfBirth (ms timestamp for range queries)
  ht: integer("ht"), // height
  np: text("np"), // nativePlace
  ai: integer("ai"), // annualIncome
  ms: integer("ms"), // maritalStatus
  ir: text("ir"), // isReady stored as 0/1, mapped to boolean

  // Auto-parsed JSON payload
  profileData: text("profile_data", { mode: "json" })
    .$type<Profile>()
    .notNull(),
};

// Helper to generate indexes for both tables
const buildFeedIndexes = (tableNamePrefix: string, table: any) => [
  index(`idx_${tableNamePrefix}_ca`).on(table.ca),
  index(`idx_${tableNamePrefix}_ua`).on(table.ua),
  index(`idx_${tableNamePrefix}_fn`).on(table.fn),
  index(`idx_${tableNamePrefix}_ln`).on(table.ln),
  index(`idx_${tableNamePrefix}_np`).on(table.np),
  index(`idx_${tableNamePrefix}_filter_matrix`).on(
    table.ms,
    table.ai,
    table.db,
  ),
];

// 1. Free User Feeds Table
export const freeUserFeeds = sqliteTable(
  "free_user_feeds",
  baseFeedColumns,
  (table) => buildFeedIndexes("free", table),
);

// 2. Paid User Feeds Table
export const paidUserFeeds = sqliteTable(
  "paid_user_feeds",
  baseFeedColumns,
  (table) => buildFeedIndexes("paid", table),
);

export type SelectFeedItem = typeof freeUserFeeds.$inferSelect;
export type InsertFeedItem = typeof freeUserFeeds.$inferInsert;
