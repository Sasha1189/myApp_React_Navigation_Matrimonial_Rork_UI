import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema/sqlprofiles";
console.log("🔍 [INIT 1/4] Loading db.ts module...");
export const expoDb = openDatabaseSync("matrimonial.db");

// // Apply performance PRAGMAs for fast reads & writes
// expoDb.execSync(`
//   PRAGMA journal_mode = WAL;
//   PRAGMA synchronous = NORMAL;
//   PRAGMA busy_timeout = 5000;
// `);

export const initDatabase = () => {
  console.log("🔍 [INIT 2/4] Running PRAGMAs and schema checks...");
  try {
    expoDb.execSync(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;
    `);
    console.log("🔍 [INIT 3/4] Database setup completed successfully.");
  } catch (error) {
    console.error("❌ [INIT ERROR] Database init failed:", error);
  }
};

initDatabase();

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
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'android_%';",
    );

    // 3. Clear data from each table (leaves table schemas intact)
    for (const table of tables) {
      expoDb.execSync(`DELETE FROM "${table.name}";`);
    }

    // 4. Re-enable foreign key constraints
    expoDb.execSync("PRAGMA foreign_keys = ON;");

    // 5. Reclaim unused disk space
    expoDb.execSync("VACUUM;");
  } catch (e) {
    console.error("Failed to clear database data:", e);
  }
};
