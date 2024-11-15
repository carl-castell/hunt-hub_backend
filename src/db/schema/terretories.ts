import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { standsTable } from "./stands";



export const territoriesTable = pgTable("territorys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  territoryName: varchar('territory_name',{ length: 255 }).notNull(),

});

export const territorysRelations = relations(territoriesTable, ({ one, many }) => ({
  estate: one(estatesTable, {
    fields: [territoriesTable.estateId],
    references: [estatesTable.id],
  }),
  stands: many(standsTable),
}));