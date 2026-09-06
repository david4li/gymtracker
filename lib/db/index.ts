import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Guard against opening a new SQLite connection on every Turbopack/dev hot-reload
// by stashing the client on the global object (this module is only ever imported
// on the server, never bundled into client code).
declare global {
  var __gymtrackerDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function createDb() {
  const sqlite = new Database(process.env.DATABASE_URL ?? "./sqlite.db");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite, { schema });
}

export const db = globalThis.__gymtrackerDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalThis.__gymtrackerDb = db;
}
