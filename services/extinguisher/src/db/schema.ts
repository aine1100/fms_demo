import { pgTable, serial, varchar, integer, timestamp, boolean, text, numeric, pgEnum } from 'drizzle-orm/pg-core';

export const extinguisherTypeEnum = pgEnum('extinguisher_type', ['water', 'foam', 'co2', 'dry_powder', 'wet_chemical']);
export const extinguisherStatusEnum = pgEnum('extinguisher_status', ['active', 'expired', 'maintenance', 'decommissioned']);

export const extinguisherCatalog = pgTable('extinguisher_catalog', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: extinguisherTypeEnum('type').notNull(),
  capacity: varchar('capacity', { length: 50 }).notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').default(0).notNull(),
  manufactureDate: timestamp('manufacture_date'),
  expiryDate: timestamp('expiry_date'),
  imageUrl: varchar('image_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const extinguishers = pgTable('extinguishers', {
  id: serial('id').primaryKey(),
  serialNumber: varchar('serial_number', { length: 100 }).unique().notNull(),
  catalogItemId: integer('catalog_item_id').references(() => extinguisherCatalog.id),
  companyId: integer('company_id').notNull(),
  customerId: integer('customer_id'),
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
