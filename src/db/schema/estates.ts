import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { usersTable } from "./users";
import { guestsTable } from "./guests";
import { eventsTable } from "./events";
import { territorysTable } from "./terretorys";


export const estatesTable = pgTable('estates', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }),
});

export const estatesRelations = relations(estatesTable, ({ many }) => ({
    users: many(usersTable),
    guests: many(guestsTable),
    events: many(eventsTable),
    territorys: many(territorysTable),
}));