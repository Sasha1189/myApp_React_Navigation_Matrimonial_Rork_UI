import { openDatabaseSync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import * as schema from "./schema/sqlprofiles";

// Initialize DB (Add { enableChangeListener: true } if you use Drizzle's live queries)
export const expoDb = openDatabaseSync("lonari_matrimonial.db");

export const initDatabase = () => {
  try {
    expoDb.execSync(`
      /* PRAGMA journal_mode = WAL; is removed because newer expo-sqlite enables it by default */
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;
    `);
    console.log("🔍 [INIT-SQL] Database setup completed successfully.");
  } catch (error) {
    console.error("❌ [INIT-SQL ERROR] Database init failed:", error);
  }
};

initDatabase();

export const db = drizzle(expoDb, { schema });
export { schema };

//....

/**
 * Resets local database storage by wiping user tables while keeping schema intact.
 */
export async function resetDatabase(): Promise<boolean> {
  try {
    // 1. Temporarily disable foreign key constraints to prevent deletion order conflicts
    expoDb.execSync("PRAGMA foreign_keys = OFF;");

    // 2. Fetch user tables (exclude system tables and Drizzle migrations)
    const tables = expoDb.getAllSync<{ name: string }>(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
        AND name NOT LIKE 'sqlite_%' 
        AND name NOT LIKE 'android_%' 
        AND name NOT LIKE '__drizzle_%';
    `);

    // 3. Clear each user table
    for (const table of tables) {
      expoDb.execSync(`DELETE FROM "${table.name}";`);
    }

    // 4. Re-enable foreign keys and optimize storage space
    expoDb.execSync("PRAGMA foreign_keys = ON;");
    expoDb.execSync("VACUUM;");

    console.log("🧹 [RECOVERY] Database tables successfully cleared.");
    return true;
  } catch (error) {
    console.error(
      "❌ [RECOVERY ERROR] Failed to reset database tables:",
      error,
    );
    return false;
  }
}
