/**
 * Consolidated Database Schema for FMS
 * This is the single source of truth for all database tables
 * Used across all microservices via the @fms/database package
 */

import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  boolean,
  text,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'company',
  'customer',
  'inspector',
]);

export const extinguisherTypeEnum = pgEnum('extinguisher_type', [
  'water',
  'foam',
  'co2',
  'dry_powder',
  'wet_chemical',
]);

export const extinguisherStatusEnum = pgEnum('extinguisher_status', [
  'active',
  'expired',
  'maintenance',
  'decommissioned',
]);

export const invoiceStatusEnum = pgEnum('invoice_status', [
  'pending',
  'paid',
  'overdue',
  'cancelled',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'bank_transfer',
  'mobile_money',
  'card',
]);

export const paymentStatusEnum = pgEnum('payment_status', ['completed', 'refunded']);

export const inspectionResultEnum = pgEnum('inspection_result', [
  'passed',
  'failed',
  'requires_maintenance',
]);

export const inspectionStatusEnum = pgEnum('inspection_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]);

export const notificationTypeEnum = pgEnum('notification_type', [
  'expiry',
  'inspection',
  'payment',
  'rules',
  'general',
]);

export const notificationStatusEnum = pgEnum('notification_status', ['seen', 'unseen']);

export const warningSeverityEnum = pgEnum('warning_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const complianceStatusEnum = pgEnum('compliance_status', [
  'compliant',
  'non_compliant',
  'warning',
]);

// ============================================================================
// AUTH SERVICE TABLES
// ============================================================================

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  logo: varchar('logo', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  companyId: integer('company_id').references(() => companies.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// ============================================================================
// CUSTOMER SERVICE TABLES
// ============================================================================

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  companyId: integer('company_id').references(() => companies.id),
  businessName: varchar('business_name', { length: 255 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  city: varchar('city', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// EXTINGUISHER SERVICE TABLES
// ============================================================================

export const extinguisherCatalog = pgTable('extinguisher_catalog', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: extinguisherTypeEnum('type').notNull(),
  capacity: varchar('capacity', { length: 50 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const extinguishers = pgTable('extinguishers', {
  id: serial('id').primaryKey(),
  serialNumber: varchar('serial_number', { length: 100 }).unique().notNull(),
  catalogItemId: integer('catalog_item_id').references(() => extinguisherCatalog.id),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id),
  type: extinguisherTypeEnum('type').notNull(),
  capacity: varchar('capacity', { length: 50 }).notNull(),
  manufactureDate: timestamp('manufacture_date').notNull(),
  expiryDate: timestamp('expiry_date').notNull(),
  lastInspectionDate: timestamp('last_inspection_date'),
  nextInspectionDate: timestamp('next_inspection_date'),
  status: extinguisherStatusEnum('status').default('active'),
  location: varchar('location', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// PAYMENT SERVICE TABLES
// ============================================================================

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique().notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  extinguisherId: integer('extinguisher_id').references(() => extinguishers.id),
  catalogItemId: integer('catalog_item_id').references(() => extinguisherCatalog.id),
  description: text('description').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).default('0'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp('due_date').notNull(),
  status: invoiceStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  invoiceId: integer('invoice_id').references(() => invoices.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentDate: timestamp('payment_date').defaultNow().notNull(),
  receiptNumber: varchar('receipt_number', { length: 50 }).unique().notNull(),
  transactionRef: varchar('transaction_ref', { length: 255 }),
  notes: text('notes'),
  status: paymentStatusEnum('status').default('completed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// INSPECTION SERVICE TABLES
// ============================================================================

export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  extinguisherId: integer('extinguisher_id').references(() => extinguishers.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  inspectorId: integer('inspector_id').references(() => users.id),
  customerId: integer('customer_id').references(() => customers.id),
  scheduledDate: timestamp('scheduled_date').notNull(),
  completedDate: timestamp('completed_date'),
  status: inspectionStatusEnum('status').default('scheduled'),
  result: inspectionResultEnum('result'),
  remarks: text('remarks'),
  location: varchar('location', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================================================
// NOTIFICATION SERVICE TABLES
// ============================================================================

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  companyId: integer('company_id').references(() => companies.id),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: notificationStatusEnum('status').default('unseen'),
  emailSent: boolean('email_sent').default(false),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// RULES SERVICE TABLES
// ============================================================================

export const rules = pgTable('rules', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }),
  documentUrl: varchar('document_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const complianceReports = pgTable('compliance_reports', {
  id: serial('id').primaryKey(),
  inspectorId: integer('inspector_id').references(() => users.id).notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
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
  complianceReportId: integer('compliance_report_id').references(
    () => complianceReports.id
  ),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  companyId: integer('company_id').references(() => companies.id).notNull(),
  issuedBy: integer('issued_by').references(() => users.id).notNull(),
  message: text('message').notNull(),
  severity: warningSeverityEnum('severity').notNull(),
  isResolved: boolean('is_resolved').default(false),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// RELATIONS (Optional but helpful for queries)
// ============================================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  customers: many(customers),
  extinguishers: many(extinguishers),
  extinguisherCatalog: many(extinguisherCatalog),
  invoices: many(invoices),
  payments: many(payments),
  inspections: many(inspections),
  notifications: many(notifications),
  complianceReports: many(complianceReports),
  warnings: many(warnings),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  inspections: many(inspections),
  notifications: many(notifications),
  rulesCreated: many(rules),
  complianceReports: many(complianceReports),
  warningsIssued: many(warnings),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  extinguishers: many(extinguishers),
  invoices: many(invoices),
  payments: many(payments),
  inspections: many(inspections),
  complianceReports: many(complianceReports),
  warnings: many(warnings),
}));

export const extinguishersRelations = relations(extinguishers, ({ one, many }) => ({
  catalogItem: one(extinguisherCatalog, {
    fields: [extinguishers.catalogItemId],
    references: [extinguisherCatalog.id],
  }),
  company: one(companies, {
    fields: [extinguishers.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [extinguishers.customerId],
    references: [customers.id],
  }),
  inspections: many(inspections),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  company: one(companies, {
    fields: [invoices.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  extinguisher: one(extinguishers, {
    fields: [invoices.extinguisherId],
    references: [extinguishers.id],
  }),
  catalogItem: one(extinguisherCatalog, {
    fields: [invoices.catalogItemId],
    references: [extinguisherCatalog.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  company: one(companies, {
    fields: [payments.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
}));

export const inspectionsRelations = relations(inspections, ({ one }) => ({
  extinguisher: one(extinguishers, {
    fields: [inspections.extinguisherId],
    references: [extinguishers.id],
  }),
  company: one(companies, {
    fields: [inspections.companyId],
    references: [companies.id],
  }),
  inspector: one(users, {
    fields: [inspections.inspectorId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [inspections.customerId],
    references: [customers.id],
  }),
}));
