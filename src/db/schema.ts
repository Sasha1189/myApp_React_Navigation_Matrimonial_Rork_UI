import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const sqlProfileTable = sqliteTable(
  "sql_profile_table",
  {
    // Primary Key & Timestamps
    uid: text("uid").primaryKey(),
    ca: integer("ca").notNull(), // createdAt (ms timestamp)
    ua: integer("ua"), // updatedAt (ms timestamp for latest feed sorting)

    // Search Columns
    fn: text("fn"), // firstName / fullName
    ln: text("ln"), // lastName

    // Filter Matrix Columns
    db: integer("db"), // dateOfBirth (ms timestamp)
    ht: integer("ht"), // height
    np: text("np"), // nativePlace
    ai: integer("ai"), // annualIncome
    ms: integer("ms"), // maritalStatus
    ir: text("ir"), // isReady

    // Complete Unmapped JSON Payload
    profileData: text("profile_data").notNull(),
  },
  (table) => [
    // Array syntax for indexes & constraints
    index("idx_ca").on(table.ca),
    index("idx_ua").on(table.ua),
    index("idx_fn").on(table.fn),
    index("idx_ln").on(table.ln),
    index("idx_np").on(table.np),
    index("idx_filter_matrix").on(table.ms, table.ai, table.db),
  ],
);
