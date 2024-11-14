"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupsRelations = exports.groupsTable = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.groupsTable = (0, pg_core_1.pgTable)('groups', {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    driveId: (0, pg_core_1.integer)("drive_id"),
    groupName: (0, pg_core_1.varchar)("group_name", { length: 255 }),
    leaderId: (0, pg_core_1.integer)("leader_id").references(() => users_1.usersTable.id)
});
exports.groupsRelations = (0, drizzle_orm_1.relations)(exports.groupsTable, ({ one }) => ({
    leader: one(users_1.usersTable, {
        fields: [exports.groupsTable.leaderId],
        references: [users_1.usersTable.id]
    })
}));
