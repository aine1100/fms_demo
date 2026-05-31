import { pgTable, serial, varchar, integer, timestamp, boolean, text, numeric, pgEnum } from 'drizzle-orm/pg-core';

export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'paid', 'overdue', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'bank_transfer', 'mobile_money', 'card']);
export const paymentStatusEnum = pgEnum('payment_status', ['completed', 'refunded']);

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).unique().notNull(),
  companyId: integer('company_id').notNull(),
  customerId: integer('customer_id').notNull(),
  extinguisherId: integer('extinguisher_id'),
  catalogItemId: integer('catalog_item_id'),
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
  companyId: integer('company_id').notNull(),
  customerId: integer('customer_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  paymentDate: timestamp('payment_date').defaultNow().notNull(),
  receiptNumber: varchar('receipt_number', { length: 50 }).unique().notNull(),
  transactionRef: varchar('transaction_ref', { length: 255 }),
  notes: text('notes'),
  status: paymentStatusEnum('status').default('completed'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
