"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standsTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.standsTable = (0, pg_core_1.pgTable)("stands", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    number: (0, pg_core_1.varchar)().notNull(),
    territoryId: (0, pg_core_1.integer)("territorry_id"),
    location: (0, pg_core_1.point)().notNull(),
});
