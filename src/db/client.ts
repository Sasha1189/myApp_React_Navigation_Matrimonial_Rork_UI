import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema/sqlprofiles";

export const expoDb = openDatabaseSync("matrimonial.db");

// Apply performance PRAGMAs for fast reads & writes
expoDb.execSync(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;
`);

export const db = drizzle(expoDb, { schema });
export { schema };

// /**
//  * Force-wipes all local SQLite tables and Drizzle tracking metadata
//  */
export const resetDatabase = () => {
  try {
    // 1. Temporarily disable foreign key constraints during wipe
    expoDb.execSync("PRAGMA foreign_keys = OFF;");

    // 2. Fetch all user table names (excluding internal SQLite system tables)
    const tables = expoDb.getAllSync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';",
    );

    // 3. Drop each table
    for (const table of tables) {
      expoDb.execSync(`DROP TABLE IF EXISTS "${table.name}";`);
    }

    // 4. Re-enable foreign key constraints
    expoDb.execSync("PRAGMA foreign_keys = ON;");

    console.log(
      `🧹 Database wiped successfully. Dropped ${tables.length} table(s).`,
    );
  } catch (e) {
    console.error("Failed to wipe database:", e);
  }
};
