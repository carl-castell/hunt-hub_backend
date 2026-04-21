import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { standsTable } from "./stands";
import { templateGroupsTable } from "./template_groups";

export const areasTable = pgTable("areas", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  name: varchar('name', { length: 255 }).notNull(),
});

export const areasRelations = relations(areasTable, ({ one, many }) => ({
  estate: one(estatesTable, {
    fields: [areasTable.estateId],
    references: [estatesTable.id],
  }),
  stands: many(standsTable),
  templateGroups: many(templateGroupsTable),
}));
