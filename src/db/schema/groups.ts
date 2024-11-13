import { relations } from "drizzle-orm";
import { pgTable, integer, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "./users";


export const groupsTable = pgTable( 'groups', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    driveId: integer("drive_id"),
    groupName: varchar("group_name", { length: 255 }),
    leaderId: integer("leader_id").references(() => usersTable.id)
})


export const groupsRelations = relations(groupsTable, ({ one }) => ({
    leader: one(usersTable, {
        fields: [groupsTable.leaderId],
        references: [usersTable.id]
    })
}))
