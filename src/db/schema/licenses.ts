import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, date } from "drizzle-orm/pg-core";
import { guestsTable } from "./guests";

export const licensesTable = pgTable("licenses", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guestId: integer('guest_id').notNull(),
    checked: boolean().notNull().default(false),
    expiryDate: date("expiry_date").notNull(),
    uploadDate: timestamp("upload_date").notNull().defaultNow(),
});
export const licensesRelations = relations(licensesTable, ({ one }) => ({
    guest: one(guestsTable, {
        fields: [licensesTable.guestId],
        references: [guestsTable.id],
    }),
}));

export const trainingCertificatesTable = pgTable("training_certificates", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    guestId: integer('guest_id').notNull(),
    checked: boolean().notNull().default(false),
    issueDate: date("expiry_date").notNull(),
    uploadDate: timestamp("upload_date").notNull().defaultNow(),
});
export const training_certificatesRelations = relations(trainingCertificatesTable, ({ one }) => ({
    guest: one(guestsTable, {
        fields: [trainingCertificatesTable.guestId],
        references: [guestsTable.id],
    }),
}));