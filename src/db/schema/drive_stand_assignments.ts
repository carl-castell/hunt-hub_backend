import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { driveGroupsTable } from "./drive_groups";
import { standsTable } from "./stands";
import { usersTable } from "./users";

export const driveStandAssignmentsTable = pgTable("drive_stand_assignments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  driveGroupId: integer("drive_group_id").notNull().references(() => driveGroupsTable.id, { onDelete: "cascade" }),
  standId: integer("stand_id").notNull().references(() => standsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
});

export const driveStandAssignmentsRelations = relations(driveStandAssignmentsTable, ({ one }) => ({
  driveGroup: one(driveGroupsTable, {
    fields: [driveStandAssignmentsTable.driveGroupId],
    references: [driveGroupsTable.id],
  }),
  stand: one(standsTable, {
    fields: [driveStandAssignmentsTable.standId],
    references: [standsTable.id],
  }),
  user: one(usersTable, {
    fields: [driveStandAssignmentsTable.userId],
    references: [usersTable.id],
  }),
}));
