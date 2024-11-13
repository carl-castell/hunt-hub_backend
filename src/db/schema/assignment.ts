import { integer, pgTable } from "drizzle-orm/pg-core";

export const  standAssignmentTable = pgTable("stand_assignment", {
    groupId: integer('group_id'),
    guestId: integer('guest_id'),
    standId: integer('stand_id'),
})