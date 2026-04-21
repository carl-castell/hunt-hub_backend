import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { standsTable } from "./stands";

export const templateGroupsTable = pgTable("template_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  standId: integer("stand_id").notNull().references(() => standsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  number: integer().notNull(),
});

export const templateGroupsRelations = relations(templateGroupsTable, ({ one }) => ({
  stand: one(standsTable, {
    fields: [templateGroupsTable.standId],
    references: [standsTable.id],
  }),
}));
