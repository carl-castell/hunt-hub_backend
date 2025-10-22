import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm'
import { estatesTable } from "./estates";
import { invitationsTable } from "./invitations";
import { licensesTable, trainingCertificatesTable } from "./licenses";
import { standsGuestTable } from "./join_tables";



export const guestsTable = pgTable("guests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  estateId: integer('estate_id'),
  firstName: varchar('first_name',{ length: 255 }).notNull(),
  lastName: varchar('last_name',{ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 255 }).notNull(),
});


export const guestsRelations = relations(guestsTable,({ one, many }) => ({
    estate: one(estatesTable, {
        fields: [guestsTable.estateId],
        references: [estatesTable.id],
    }),
    invitations: many(invitationsTable),
    licenses: many(licensesTable),
    trainingCertificates: many(trainingCertificatesTable),
    stands: many(standsGuestTable),
}));