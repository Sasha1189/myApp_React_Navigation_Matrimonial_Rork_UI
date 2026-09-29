import { File, Paths } from "expo-file-system";

export async function resetDatabase(
  dbName: string = "matrimonial.db",
): Promise<boolean> {
  try {
    const dbFile = new File(Paths.document, "SQLite", dbName);

    if (dbFile.exists) {
      dbFile.delete();
    }
    return true;
  } catch (error) {
    console.error(
      "[DatabaseRecovery] Failed to delete corrupted SQLite database:",
      error,
    );
    return false;
  }
}
