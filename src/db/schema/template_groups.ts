import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { templatesTable } from "./templates";
import { templateStandAssignmentsTable } from "./template_stand_assignments";

export const templateGroupsTable = pgTable("template_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  templateId: integer("template_id").notNull().references(() => templatesTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  number: integer().notNull(),
});

export const templateGroupsRelations = relations(templateGroupsTable, ({ one, many }) => ({
  template: one(templatesTable, {
    fields: [templateGroupsTable.templateId],
    references: [templatesTable.id],
  }),
  standAssignments: many(templateStandAssignmentsTable),
}));
