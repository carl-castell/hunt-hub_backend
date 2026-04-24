import { relations } from "drizzle-orm";
import { integer, pgTable, time, varchar } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";
import { driveGroupsTable } from "./drive_groups";


export const drivesTable = pgTable("drives", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id").notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
});

export const drivesRelations = relations(drivesTable, ({ many, one }) => ({
    event: one(eventsTable, {
        fields: [drivesTable.eventId],
        references: [eventsTable.id],
    }),
    groups: many(driveGroupsTable),
}))
