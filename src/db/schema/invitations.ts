import { relations } from "drizzle-orm";
import { integer, pgTable, pgEnum, date } from "drizzle-orm/pg-core";
import { eventsTable } from "./events";
import { usersTable } from "./users";

export const statusEnum = pgEnum('status', ['open', 'yes', 'no']);

export const invitationsTable = pgTable("invitations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventId: integer("event_id").notNull().references(() => eventsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: statusEnum().default('open').notNull(),
  rsvpDate: date("rsvp_date").notNull(),
});

export const invitationsRelations = relations(invitationsTable, ({ one }) => ({
  event: one(eventsTable, {
    fields: [invitationsTable.eventId],
    references: [eventsTable.id],
  }),
  user: one(usersTable, {
    fields: [invitationsTable.userId],
    references: [usersTable.id],
  }),
}));
