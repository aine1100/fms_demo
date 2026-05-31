import { pgTable, serial, varchar, integer, timestamp, boolean, text, pgEnum } from 'drizzle-orm/pg-core';

export const inspectionResultEnum = pgEnum('inspection_result', ['passed', 'failed', 'requires_maintenance']);
export const inspectionStatusEnum = pgEnum('inspection_status', ['scheduled', 'in_progress', 'completed', 'cancelled']);

export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  extinguisherId: integer('extinguisher_id').notNull(),
  companyId: integer('company_id').notNull(),
  inspectorId: integer('inspector_id'),
  customerId: integer('customer_id'),
  scheduledDate: timestamp('scheduled_date').notNull(),
  completedDate: timestamp('completed_date'),
  status: inspectionStatusEnum('status').default('scheduled'),
  result: inspectionResultEnum('result'),
  remarks: text('remarks'),
  location: varchar('location', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
