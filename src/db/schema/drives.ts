import { integer, pgTable, time } from "drizzle-orm/pg-core";

export const drivesTable = pgTable("drives", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
})