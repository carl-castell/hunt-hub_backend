import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { standsTable } from "./stands";

export const areasTable = pgTable("areas", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id').notNull().references(() => estatesTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  geofile: text('geofile'),
  geofileType: varchar('geofile_type', { length: 10 }),
});

export const areasRelations = relations(areasTable, ({ one, many }) => ({
  estate: one(estatesTable, {
    fields: [areasTable.estateId],
    references: [estatesTable.id],
  }),
  stands: many(standsTable),
}));
