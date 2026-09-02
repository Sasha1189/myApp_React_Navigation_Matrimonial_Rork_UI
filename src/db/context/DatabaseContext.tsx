import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as Updates from "expo-updates";

import { db, expoDb } from "@/db/client"; // Updated import to match your refactored db/index.ts
import migrations from "../../../drizzle/migrations";
import { resetDatabase } from "@/db/recovery/recovery";

const DB_NAME = "matrimonial.db";

interface DatabaseContextType {
  isDbReady: boolean;
  migrationError: Error | undefined;
  isResetting: boolean;
  handleRetry: () => Promise<void>;
  handleReset: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { success: isDbReady, error: migrationError } = useMigrations(
    db,
    migrations,
  );
  const [isResetting, setIsResetting] = useState(false);

  const handleRetry = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      console.error("Failed to reload app bundle:", e);
    }
  }, []);

  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      // Close active SQLite connection before deleting DB files (essential for WAL mode)
      try {
        expoDb.closeSync();
      } catch (closeErr) {
        console.warn("Could not close DB connection prior to reset:", closeErr);
      }

      const success = await resetDatabase(DB_NAME);
      if (success) {
        await Updates.reloadAsync();
      }
    } catch (e) {
      console.error("Failed to reset database or reload app:", e);
    } finally {
      setIsResetting(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      isDbReady,
      migrationError,
      isResetting,
      handleRetry,
      handleReset,
    }),
    [isDbReady, migrationError, isResetting, handleRetry, handleReset],
  );

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};
