import { integer, pgTable, pgEnum, date } from "drizzle-orm/pg-core";

export const statusEnum = pgEnum('status', ['open', 'yes', 'no']);

export const invitationsTable = pgTable("invitations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id").notNull(),
    guestId: integer("guest_id").notNull(),
    status: statusEnum().default('open').notNull(),
    rsvpDate: date("rsvp_date").notNull(),
})