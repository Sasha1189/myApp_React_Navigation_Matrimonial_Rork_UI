import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import { db } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { resetDatabase } from "@/db/recovery/recovery";
import * as Updates from "expo-updates";

// Match database name used in client configuration
const DB_NAME = "matrimonial.db";

interface DatabaseContextType {
  isDbReady: boolean;
  migrationError: Error | undefined;
  isResetting: boolean;
  handleRetry: () => Promise<void>;
  handleReset: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType>(
  {} as DatabaseContextType,
);

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
      const success = await resetDatabase(DB_NAME); // Fixed target DB file
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

export const useDatabase = () => useContext(DatabaseContext);
