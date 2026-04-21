import { relations } from "drizzle-orm";
import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
import { drivesTable } from "./drives";

export const groupsTable = pgTable('groups', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  driveId: integer("drive_id").notNull(),
  name: varchar("group_name", { length: 255 }).notNull(),
});

export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
  drive: one(drivesTable, {
    fields: [groupsTable.driveId],
    references: [drivesTable.id],
  }),
}));
