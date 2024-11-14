"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.licensesTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.licensesTable = (0, pg_core_1.pgTable)("licenses", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    checked: (0, pg_core_1.boolean)().notNull().default(false),
    expiryDate: (0, pg_core_1.date)("expiry_date").notNull(),
    uploadDate: (0, pg_core_1.timestamp)("upload_date").notNull().defaultNow(),
});
