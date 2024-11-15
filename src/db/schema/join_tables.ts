import { relations } from "drizzle-orm";
import { integer, pgTable } from "drizzle-orm/pg-core";
import { standsTable } from "./stands";
import { drivesTable } from "./drives";
import { groupsTable } from "./groups";
import { guestsTable } from "./guests";


export const standsDriveTable = pgTable('stands_drive', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    standId: integer('stand_id'),
    driveId: integer('drive_id'),
});
export const standDriveRelatins = relations(standsDriveTable, ({ one }) => ({
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
    standId: integer('stand_id'),
    groupId: integer('group_id'),
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


export const standsGuestTable = pgTable('stands_guest', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    standId: integer('stand_id'),
    guestId: integer('guest_id'),
});
export const standGuestRelatins = relations(standsGuestTable, ({ one }) => ({
    stand: one(standsTable, {
        fields: [standsGuestTable.standId],
        references: [standsTable.id],
    }),
    guest: one(guestsTable, {
        fields: [standsGuestTable.guestId],
        references: [guestsTable.id],
    }),
}));