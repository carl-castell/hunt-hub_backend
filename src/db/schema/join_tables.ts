import { integer, pgTable } from "drizzle-orm/pg-core";


export const standsDriveTable = pgTable('stands_drive', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    standId: integer('stand_id'),
    driveId: integer('drive_id'),
})

export const standsGroupTable = pgTable('stands_group', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    standId: integer('stand_id'),
    groupId: integer('group_id'),
})

export const standsGuestTable = pgTable('stands_guest', {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    standId: integer('stand_id'),
    guestId: integer('guest_id'),
})