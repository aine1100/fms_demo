import { pgTable, serial, varchar, integer, timestamp, boolean, text, pgEnum } from 'drizzle-orm/pg-core';

export const warningSeverityEnum = pgEnum('warning_severity', ['low', 'medium', 'high', 'critical']);
export const complianceStatusEnum = pgEnum('compliance_status', ['compliant', 'non_compliant', 'warning']);

export const rules = pgTable('rules', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  documentUrl: varchar('document_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const complianceReports = pgTable('compliance_reports', {
  id: serial('id').primaryKey(),
  inspectorId: integer('inspector_id').notNull(),
  customerId: integer('customer_id').notNull(),
  companyId: integer('company_id').notNull(),
  status: complianceStatusEnum('status').notNull(),
  findings: text('findings').notNull(),
  actionRequired: text('action_required'),
  deadline: timestamp('deadline'),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const warnings = pgTable('warnings', {
  id: serial('id').primaryKey(),
  complianceReportId: integer('compliance_report_id').references(() => complianceReports.id),
  customerId: integer('customer_id').notNull(),
  companyId: integer('company_id').notNull(),
  issuedBy: integer('issued_by').notNull(),
  message: text('message').notNull(),
  severity: warningSeverityEnum('severity').notNull(),
  isResolved: boolean('is_resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
