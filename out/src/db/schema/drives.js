"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drivesTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.drivesTable = (0, pg_core_1.pgTable)("drives", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    eventId: (0, pg_core_1.integer)("event_id").notNull(),
    startTime: (0, pg_core_1.time)("start_time").notNull(),
    endTime: (0, pg_core_1.time)("end_time").notNull(),
});
