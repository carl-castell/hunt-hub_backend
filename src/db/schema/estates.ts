import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import { usersTable } from "./user";


export const estatesTable = pgTable('estates', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 256 }),
});

export const estateRelations = relations(estatesTable, ({ many }) => ({
    users: many(usersTable),
}));