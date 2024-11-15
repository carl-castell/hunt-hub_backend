import { relations } from "drizzle-orm";
import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { drivesTable } from "./drives";
import { standsGroupTable } from "./join_tables";


export const groupsTable = pgTable( 'groups', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    driveId: integer("drive_id").notNull(),
    leaderId: integer("leader_id").references(() => usersTable.id),
    name: varchar("group_name", { length: 255 }).notNull(),
});


export const groupsRelations = relations(groupsTable, ({ one, many }) => ({
    leader: one(usersTable, {
        fields: [groupsTable.leaderId],
        references: [usersTable.id]
    }),
    drive: one(drivesTable, {
        fields: [groupsTable.driveId],
        references: [drivesTable.id],
    }),
    stands: many(standsGroupTable),
}));
