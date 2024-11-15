import { relations } from "drizzle-orm";
import { integer, pgTable, pgEnum, date } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";
import { guestsTable } from "./guests";

export const statusEnum = pgEnum('status', ['open', 'yes', 'no']);

export const invitationsTable = pgTable("invitations", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    eventId: integer("event_id").notNull(),
    guestId: integer("guest_id").notNull(),
    status: statusEnum().default('open').notNull(),
    rsvpDate: date("rsvp_date").notNull(),
});

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
    event: one(eventsTable, {
        fields: [invitationsTable.eventId],
        references: [eventsTable.id],
    }),
    guest: one(guestsTable, {
        fields: [invitationsTable.guestId],
        references: [guestsTable.id],
    }),
}));