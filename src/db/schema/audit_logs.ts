import { pgTable, integer, timestamp, varchar, json } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const auditLogsTable = pgTable('audit_logs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
  event: varchar('event', { length: 100 }).notNull(),
  ip: varchar('ip', { length: 255 }),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
});
