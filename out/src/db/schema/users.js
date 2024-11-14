"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRelations = exports.usersTable = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const estates_1 = require("./estates");
const groups_1 = require("./groups");
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['admin', 'organizer', 'staff']);
exports.usersTable = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    estateId: (0, pg_core_1.integer)('estate_id'),
    firstName: (0, pg_core_1.varchar)('first_name', { length: 255 }).notNull(),
    lastName: (0, pg_core_1.varchar)('last_name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)({ length: 255 }).unique().notNull(),
    role: (0, exports.roleEnum)().notNull(),
    password: (0, pg_core_1.varchar)({ length: 255 }),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.usersTable, ({ one }) => ({
    group: one(groups_1.groupsTable),
    estate: one(estates_1.estatesTable, {
        fields: [exports.usersTable.estateId],
        references: [estates_1.estatesTable.id],
    })
}));
