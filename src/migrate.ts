import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sql } from "./db";
import path from "path";

(async () => {
  console.log("Beginning migration ...");
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "..", "drizzle"),
  });
  console.log("Migrated, closing connection");
  await sql.end();
  console.log("Done");
})();
