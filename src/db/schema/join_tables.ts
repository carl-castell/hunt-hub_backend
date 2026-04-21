import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { standsTable } from "./stands";
import { drivesTable } from "./drives";
import { groupsTable } from "./groups";

export const standsDriveTable = pgTable('stands_drive', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  standId: integer('stand_id').notNull().references(() => standsTable.id),
  driveId: integer('drive_id').notNull().references(() => drivesTable.id),
});

export const standDriveRelations = relations(standsDriveTable, ({ one }) => ({
  stand: one(standsTable, {
    fields: [standsDriveTable.standId],
    references: [standsTable.id],
  }),
  drive: one(drivesTable, {
    fields: [standsDriveTable.driveId],
    references: [drivesTable.id],
  }),
}));

export const standsGroupTable = pgTable('stands_group', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  standId: integer('stand_id').notNull().references(() => standsTable.id),
  groupId: integer('group_id').notNull().references(() => groupsTable.id),
});

export const standsGroupRelations = relations(standsGroupTable, ({ one }) => ({
  stand: one(standsTable, {
    fields: [standsGroupTable.standId],
    references: [standsTable.id],
  }),
  group: one(groupsTable, {
    fields: [standsGroupTable.groupId],
    references: [groupsTable.id],
  }),
}));
