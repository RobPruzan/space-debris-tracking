import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString:
      "postgresql://db_user:db_password@localhost:5432/db_project",
  },
} satisfies Config;
