import { pgTable, integer, varchar, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./users";

export const accountsTable = pgTable("accounts", {
  userId: integer('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }),
  active: boolean().notNull().default(false),
});

export const accountsRelations = relations(accountsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [accountsTable.userId],
    references: [usersTable.id],
  }),
}));
