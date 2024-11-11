import { integer, pgTable, varchar, date } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { estatesTable } from "./estates";



export const eventsTable = pgTable("events", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  eventName: varchar('event_name',{ length: 255 }).notNull(),
  date: date(),

});

export const eventsRelations = relations(eventsTable, ({ one }) => ({
  estate: one(estatesTable, {
    fields: [eventsTable.estateId],
    references: [estatesTable.id],
  })
}));