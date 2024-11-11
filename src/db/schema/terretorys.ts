import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";



export const territorysTable = pgTable("territorys", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  territoryName: varchar('territory_name',{ length: 255 }).notNull(),

});

export const territorysRelations = relations(territorysTable, ({ one }) => ({
  estate: one(estatesTable, {
    fields: [territorysTable.estateId],
    references: [estatesTable.id],
  })
}));