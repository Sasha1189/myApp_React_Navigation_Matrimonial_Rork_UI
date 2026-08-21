import React, { createContext, useContext } from "react";
import { db } from "@/db/client";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "../../drizzle/migrations";

interface DatabaseContextType {
  isDbReady: boolean;
  migrationError: Error | undefined;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isDbReady: false,
  migrationError: undefined,
});

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { success: isDbReady, error: migrationError } = useMigrations(
    db,
    migrations,
  );

  return (
    <DatabaseContext.Provider value={{ isDbReady, migrationError }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => useContext(DatabaseContext);
