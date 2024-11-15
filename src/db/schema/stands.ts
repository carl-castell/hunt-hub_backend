import { relations } from "drizzle-orm";
import { integer, pgTable, point, varchar } from "drizzle-orm/pg-core";
import { territoriesTable } from "./terretories";
import { standsDriveTable, standsGroupTable, standsGuestTable } from "./join_tables";

export const standsTable = pgTable("stands", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    number: varchar().notNull(),
    territoryId: integer("territorry_id").notNull(),
    location: point(),
});

export const standsRelations = relations(standsTable, ({ many, one }) => ({
    territory: one(territoriesTable, {
        fields: [standsTable.territoryId],
        references: [territoriesTable.id],
    }),
    drives: many(standsDriveTable),
    groups: many(standsGroupTable),
    guests: many(standsGuestTable),
}));