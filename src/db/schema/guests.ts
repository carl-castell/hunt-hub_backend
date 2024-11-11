import { integer, pgTable, varchar } from "drizzle-orm/pg-core";


export const usersTable = pgTable("guests", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  first_name: varchar({ length: 255 }).notNull(),
  last_name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 255 })
  
});