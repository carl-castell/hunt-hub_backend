import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm'
import { estatesTable } from "./estates";


export const guestsTable = pgTable("guests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 255 })
});


export const guestsRelations = relations(guestsTable,({ one }) => ({
    estate: one(estatesTable, {
        fields: [guestsTable.estateId],
        references: [estatesTable.id],
    })
}))