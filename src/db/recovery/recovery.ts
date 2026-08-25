import * as FileSystem from "expo-file-system";
import { Paths } from "expo-file-system";

export async function resetDatabase(
  dbName: string = "app.db",
): Promise<boolean> {
  try {
    const dbPath = `${Paths.document.uri}SQLite/${dbName}`;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
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
