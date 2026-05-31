import { pgTable, serial, varchar, integer, timestamp, boolean, text, pgEnum } from 'drizzle-orm/pg-core';

export const notificationTypeEnum = pgEnum('notification_type', ['expiry', 'inspection', 'payment', 'rules', 'general']);
export const notificationStatusEnum = pgEnum('notification_status', ['seen', 'unseen']);

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  companyId: integer('company_id'),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: notificationStatusEnum('status').default('unseen'),
  emailSent: boolean('email_sent').default(false),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
