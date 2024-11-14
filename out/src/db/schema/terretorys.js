"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.territorysRelations = exports.territorysTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const estates_1 = require("./estates");
exports.territorysTable = (0, pg_core_1.pgTable)("territorys", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    estateId: (0, pg_core_1.integer)('estate_id'),
    territoryName: (0, pg_core_1.varchar)('territory_name', { length: 255 }).notNull(),
});
exports.territorysRelations = (0, drizzle_orm_1.relations)(exports.territorysTable, ({ one }) => ({
    estate: one(estates_1.estatesTable, {
        fields: [exports.territorysTable.estateId],
        references: [estates_1.estatesTable.id],
    })
}));
