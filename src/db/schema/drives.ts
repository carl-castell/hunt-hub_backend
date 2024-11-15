import { relations } from "drizzle-orm";
import { integer, pgTable, time } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";
import { standsDriveTable } from "./join_tables";
import { groupsTable } from "./groups";


export const drivesTable = pgTable("drives", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
});

export const drivesRelations = relations(drivesTable, ({ many, one }) => ({
    event: one(eventsTable, {
        fields: [drivesTable.eventId],
        references: [eventsTable.id],
    }),
    standsDrive: many(standsDriveTable),
    groups: many(groupsTable),
}))