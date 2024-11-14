"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestsRelations = exports.guestsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const estates_1 = require("./estates");
exports.guestsTable = (0, pg_core_1.pgTable)("guests", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    estateId: (0, pg_core_1.integer)('estate_id'),
    first_name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    last_name: (0, pg_core_1.varchar)({ length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 255 }).notNull().unique(),
    phone: (0, pg_core_1.varchar)({ length: 255 })
});
exports.guestsRelations = (0, drizzle_orm_1.relations)(exports.guestsTable, ({ one }) => ({
    estate: one(estates_1.estatesTable, {
        fields: [exports.guestsTable.estateId],
        references: [estates_1.estatesTable.id],
    })
}));
