import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { drivesTable } from "./drives";
import { usersTable } from "./users";

export const driveGroupsTable = pgTable("drive_groups", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  driveId: integer("drive_id").notNull().references(() => drivesTable.id, { onDelete: "cascade" }),
  leaderId: integer("leader_id").references(() => usersTable.id, { onDelete: "set null" }),
  number: integer().notNull(),
});

export const driveGroupsRelations = relations(driveGroupsTable, ({ one }) => ({
  drive: one(drivesTable, {
    fields: [driveGroupsTable.driveId],
    references: [drivesTable.id],
  }),
  leader: one(usersTable, {
    fields: [driveGroupsTable.leaderId],
    references: [usersTable.id],
  }),
}));
