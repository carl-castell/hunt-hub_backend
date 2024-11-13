import { boolean, integer, pgTable, timestamp, date } from "drizzle-orm/pg-core";

export const licensesTable = pgTable("licenses", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    checked: boolean().notNull().default(false),
    expiryDate: date("expiry_date").notNull(),
    uploadDate: timestamp("upload_date").notNull().defaultNow(),
})