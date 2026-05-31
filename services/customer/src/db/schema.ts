import { pgTable, serial, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  companyId: integer('company_id'),
  businessName: varchar('business_name', { length: 255 }),
  contactPerson: varchar('contact_person', { length: 255 }),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  city: varchar('city', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
