import { integer, pgTable, point, varchar } from "drizzle-orm/pg-core";

export const standsTable = pgTable("stands", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    number: varchar().notNull(),
    territoryId: integer("territorry_id"),
    location: point().notNull(),
})