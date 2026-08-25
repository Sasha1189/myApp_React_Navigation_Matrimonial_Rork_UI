import React, { createContext, useContext, useState } from "react";
import { db } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";
import { resetDatabase } from "@/db/recovery/recovery";
import * as Updates from "expo-updates";

interface DatabaseContextType {
  isDbReady: boolean;
  migrationError: Error | undefined;
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

  const handleRetry = async () => {
    try {
      await Updates.reloadAsync();
    } catch (e) {
      console.error("Failed to reload app bundle:", e);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    const success = await resetDatabase("app.db");
    setIsResetting(false);

    if (success) {
      await Updates.reloadAsync();
    }
  };

  return (
    <DatabaseContext.Provider
      value={{ isDbReady, migrationError, handleRetry, handleReset }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
