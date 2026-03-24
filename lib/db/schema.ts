import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const gardens = sqliteTable("gardens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  config: text("config").notNull(), // JSON string of GardenConfig
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const plantedItems = sqliteTable("planted_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  gardenId: integer("garden_id")
    .notNull()
    .references(() => gardens.id, { onDelete: "cascade" }),
  lineIndex: integer("line_index").notNull(),
  plantId: text("plant_id").notNull(),
  varietyId: text("variety_id"),
  side: text("side").notNull(), // "top" | "bottom"
  positionCm: integer("position_cm").notNull(),
  itemId: text("item_id").notNull(), // UUID for the planted item
});

export type Garden = typeof gardens.$inferSelect;
export type NewGarden = typeof gardens.$inferInsert;
export type PlantedItem = typeof plantedItems.$inferSelect;
export type NewPlantedItem = typeof plantedItems.$inferInsert;

