import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, timestamp, date } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const licensesTable = pgTable("licenses", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  checked: boolean().notNull().default(false),
  expiryDate: date("expiry_date").notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
});

export const licensesRelations = relations(licensesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [licensesTable.userId],
    references: [usersTable.id],
  }),
}));

export const trainingCertificatesTable = pgTable("training_certificates", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').notNull().references(() => usersTable.id),
  checked: boolean().notNull().default(false),
  issueDate: date("issue_date").notNull(),
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
});

export const trainingCertificatesRelations = relations(trainingCertificatesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [trainingCertificatesTable.userId],
    references: [usersTable.id],
  }),
}));
