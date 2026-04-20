import { relations } from "drizzle-orm";
import { integer, pgTable, point, varchar } from "drizzle-orm/pg-core";
import { areasTable } from "./areas";
import { standsDriveTable, standsGroupTable, standsGuestTable } from "./join_tables";

export const standsTable = pgTable("stands", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    number: varchar().notNull(),
    areaId: integer("area_id").notNull(),
    location: point(),
});

export const standsRelations = relations(standsTable, ({ many, one }) => ({
    area: one(areasTable, {
        fields: [standsTable.areaId],
        references: [areasTable.id],
    }),
    drives: many(standsDriveTable),
    groups: many(standsGroupTable),
    guests: many(standsGuestTable),
}));