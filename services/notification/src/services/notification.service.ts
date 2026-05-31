import { db } from '../db/connection';
import { sendEmail } from '@fms/shared';
import { eq, and, count } from 'drizzle-orm';
import { notifications } from '../db/schema';

export const createNotification = async (data: any, email?: string, sendEmailFlag?: boolean) => {
  let emailSent = false;
  if (sendEmailFlag && email) {
    emailSent = await sendEmail({
      to: email,
      subject: data.title,
      html: `<p>${data.message}</p>`,
    });
  }

  const [notification] = await db.insert(notifications).values({
    ...data,
    emailSent,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  }).returning();

  return notification;
};

export const createBulkNotifications = async (userIds: number[], data: any) => {
  const notificationsData = userIds.map((userId) => ({
    userId,
    companyId: data.companyId,
    type: data.type,
    title: data.title,
    message: data.message,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  }));

  const createdNotifications = await db.insert(notifications).values(notificationsData).returning();
  return createdNotifications;
};

export const getNotifications = async (userId: number, limit: number, offset: number, filters: any) => {
  let conditions = [eq(notifications.userId, userId)];
  
  if (filters.type) conditions.push(eq(notifications.type, filters.type));
  if (filters.status) conditions.push(eq(notifications.status, filters.status));

  const whereClause = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db.select().from(notifications).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(notifications).where(whereClause)
  ]);
  
  return { items, total };
};

export const getUnreadCount = async (userId: number) => {
  const [{ total }] = await db.select({ total: count() }).from(notifications).where(
    and(eq(notifications.userId, userId), eq(notifications.status, 'unseen' as any))
  );
  return total;
};

export const markAsRead = async (id: number, userId: number) => {
  const [updated] = await db.update(notifications)
    .set({ status: 'seen' as any })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
    .returning();
  return updated;
};

export const markAllAsRead = async (userId: number) => {
  await db.update(notifications)
    .set({ status: 'seen' as any })
    .where(and(eq(notifications.userId, userId), eq(notifications.status, 'unseen' as any)));
  return true;
};

export const deleteNotification = async (id: number, userId: number) => {
  await db.delete(notifications)
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  return true;
};
