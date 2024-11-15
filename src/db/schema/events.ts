import { integer, pgTable, varchar, date, time } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";
import { invitationsTable } from "./invitations";
import { drivesTable } from "./drives";




export const eventsTable = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  eventName: varchar('event_name',{ length: 255 }).notNull(),
  date: date(),
  time: time(),

});

export const eventsRelations = relations(eventsTable, ({ one, many }) => ({
  estate: one(estatesTable, {
    fields: [eventsTable.estateId],
    references: [estatesTable.id],
  }),
  invitations: many(invitationsTable),
  drives: many(drivesTable),
}));