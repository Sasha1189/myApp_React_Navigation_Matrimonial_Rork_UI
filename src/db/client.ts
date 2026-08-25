import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema/sqlprofiles";

export const expoDb = openDatabaseSync("matrimonial.db");

// Performance PRAGMAs for fast reads & writes
expoDb.execSync(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
`);

export const db = drizzle(expoDb, { schema });

/**
 * Force-wipes all local SQLite tables and Drizzle tracking metadata
 */
export const resetDatabase = () => {
  try {
    expoDb.execSync(`
      DROP TABLE IF EXISTS sql_profile_table;
      DROP TABLE IF EXISTS user_profiles;
      DROP TABLE IF EXISTS __drizzle_migrations;
    `);
    console.log("🧹 Database successfully wiped.");
  } catch (e) {
    console.error("Failed to wipe database:", e);
  }
};
