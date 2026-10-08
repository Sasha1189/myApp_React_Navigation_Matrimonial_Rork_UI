import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/sqlprofiles.ts", // or array: ["./src/db/schema/*.ts"]
  out: "./drizzle",
  dialect: "sqlite",
  driver: "expo",
});
