import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sqldb } from "./db";
import path from "path";

(async () => {
  console.log("Beginning migration ...");
  await migrate(db, {
    migrationsFolder: path.join(__dirname, "..", "drizzle"),
  });
  console.log("Migrated, closing connection");
  await sqldb.end();
  console.log("Done");
})();
