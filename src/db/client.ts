import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema/sqlprofiles";
export const expoDb = openDatabaseSync("matrimonial.db");

export const initDatabase = () => {
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
    expoDb.execSync("PRAGMA foreign_keys = OFF;");

    // Fetch all user tables EXCEPT sqlite system tables AND Drizzle migration table
    const tables = expoDb.getAllSync<{ name: string }>(
      `SELECT name FROM sqlite_master 
       WHERE type='table' 
       AND name NOT LIKE 'sqlite_%' 
       AND name NOT LIKE 'android_%' 
       AND name NOT LIKE '__drizzle_%';`,
    );

    // Clear user data only
    for (const table of tables) {
      expoDb.execSync(`DELETE FROM "${table.name}";`);
    }

    expoDb.execSync("PRAGMA foreign_keys = ON;");
    expoDb.execSync("VACUUM;");
  } catch (e) {
    console.error("Failed to clear database data:", e);
  }
};
