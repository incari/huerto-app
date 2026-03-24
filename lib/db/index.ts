import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

const databasePath =
  process.env.DATABASE_PATH || path.join(process.cwd(), "data", "garden.db");

// Ensure the data directory exists
const dataDir = path.dirname(databasePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(databasePath);
export const db = drizzle(sqlite, { schema });

// Initialize database tables
export function initDb() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS gardens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      config TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS planted_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      garden_id INTEGER NOT NULL,
      line_index INTEGER NOT NULL,
      plant_id TEXT NOT NULL,
      variety_id TEXT,
      side TEXT NOT NULL,
      position_cm INTEGER NOT NULL,
      item_id TEXT NOT NULL,
      FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_planted_items_garden_id ON planted_items(garden_id);
  `);
}

