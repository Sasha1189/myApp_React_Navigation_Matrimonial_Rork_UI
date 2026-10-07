import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import * as Updates from "expo-updates";

import { db, expoDb } from "@/db/client";
import migrations from "../../../drizzle/migrations";
import { resetDatabase } from "@/db/recovery/recovery";

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
  const [_, setForceUpdate] = useState(0);

  // Re-evaluates DB context without forcing an instant full app bundle reload
  const handleRetry = useCallback(async () => {
    try {
      setForceUpdate((prev) => prev + 1);
    } catch (e) {
      console.error("Failed to trigger database retry:", e);
    }
  }, []);

  const handleReset = useCallback(async () => {
    setIsResetting(true);
    try {
      // 1. Clear user tables (preserves __drizzle_migrations table schema)
      resetDatabase();

      // 2. Reload bundle ONLY on hard reset to start with fresh memory & connections
      await Updates.reloadAsync();
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
