import { relations } from "drizzle-orm";
import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { templateGroupsTable } from "./template_groups";
import { standsTable } from "./stands";

export const templateStandAssignmentsTable = pgTable("template_stand_assignments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  templateGroupId: integer("template_group_id").notNull().references(() => templateGroupsTable.id, { onDelete: "cascade" }),
  standId: integer("stand_id").notNull().references(() => standsTable.id, { onDelete: "cascade" }),
});

export const templateStandAssignmentsRelations = relations(templateStandAssignmentsTable, ({ one }) => ({
  templateGroup: one(templateGroupsTable, {
    fields: [templateStandAssignmentsTable.templateGroupId],
    references: [templateGroupsTable.id],
  }),
  stand: one(standsTable, {
    fields: [templateStandAssignmentsTable.standId],
    references: [standsTable.id],
  }),
}));
