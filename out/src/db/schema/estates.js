"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.estatesRelations = exports.estatesTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const guests_1 = require("./guests");
const events_1 = require("./events");
const terretorys_1 = require("./terretorys");
exports.estatesTable = (0, pg_core_1.pgTable)('estates', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 256 }),
});
exports.estatesRelations = (0, drizzle_orm_1.relations)(exports.estatesTable, ({ many }) => ({
    users: many(users_1.usersTable),
    guests: many(guests_1.guestsTable),
    events: many(events_1.eventsTable),
    territorys: many(terretorys_1.territorysTable),
}));
