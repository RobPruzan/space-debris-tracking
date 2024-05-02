import { drizzle } from "drizzle-orm/postgres-js";

import postgres from "postgres";
const connString = "postgresql://db_user:db_password@localhost:5432/db_project";
export const sql = postgres(connString);
export const db = drizzle(sql);
