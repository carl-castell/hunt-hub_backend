"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationsTable = exports.statusEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.statusEnum = (0, pg_core_1.pgEnum)('status', ['open', 'yes', 'no']);
exports.invitationsTable = (0, pg_core_1.pgTable)("invitations", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    eventId: (0, pg_core_1.integer)("event_id").notNull(),
    guestId: (0, pg_core_1.integer)("guest_id").notNull(),
    status: (0, exports.statusEnum)().default('open').notNull(),
    rsvpDate: (0, pg_core_1.date)("rsvp_date").notNull(),
});
