import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { Profile } from "@/features/profile/types/profile";

export const sqlProfileTable = sqliteTable(
  "sql_profile_table",
  {
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
  },
  (table) => [
    // Feed Sorting Indexes
    index("idx_ca").on(table.ca),
    index("idx_ua").on(table.ua),

    // Search & Filter Indexes
    index("idx_fn").on(table.fn),
    index("idx_ln").on(table.ln),
    index("idx_np").on(table.np),

    // Matrix Index: Put equality columns first (ms), range columns last (db, ai)
    index("idx_filter_matrix").on(table.ms, table.ai, table.db),
  ],
);
