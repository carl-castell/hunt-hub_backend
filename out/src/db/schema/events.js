"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRelations = exports.eventsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const estates_1 = require("./estates");
exports.eventsTable = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    estateId: (0, pg_core_1.integer)('estate_id'),
    eventName: (0, pg_core_1.varchar)('event_name', { length: 255 }).notNull(),
    date: (0, pg_core_1.date)(),
    time: (0, pg_core_1.time)(),
});
exports.eventsRelations = (0, drizzle_orm_1.relations)(exports.eventsTable, ({ one }) => ({
    estate: one(estates_1.estatesTable, {
        fields: [exports.eventsTable.estateId],
        references: [estates_1.estatesTable.id],
    })
}));
