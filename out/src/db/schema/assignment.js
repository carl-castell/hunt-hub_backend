"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standAssignmentTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.standAssignmentTable = (0, pg_core_1.pgTable)("stand_assignment", {
    groupId: (0, pg_core_1.integer)('group_id'),
    guestId: (0, pg_core_1.integer)('guest_id'),
    standId: (0, pg_core_1.integer)('stand_id'),
});
