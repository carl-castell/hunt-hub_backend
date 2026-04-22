import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { standsTable } from "./stands";

export const areasTable = pgTable("areas", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id').notNull().references(() => estatesTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
});

export const areasRelations = relations(areasTable, ({ one, many }) => ({
  estate: one(estatesTable, {
    fields: [areasTable.estateId],
    references: [estatesTable.id],
  }),
  stands: many(standsTable),
}));
