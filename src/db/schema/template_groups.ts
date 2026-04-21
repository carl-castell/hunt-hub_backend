import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { areasTable } from "./areas";

export const templateGroupsTable = pgTable("template_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  areaId: integer("area_id").notNull().references(() => areasTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  number: integer().notNull(),
});

export const templateGroupsRelations = relations(templateGroupsTable, ({ one }) => ({
  area: one(areasTable, {
    fields: [templateGroupsTable.areaId],
    references: [areasTable.id],
  }),
}));
