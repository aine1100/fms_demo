import { db } from '../db/connection';
import { eq, and, count, desc } from 'drizzle-orm';
import { warnings } from '../db/schema';

export const issueWarning = async (data: any) => {
  const [warning] = await db.insert(warnings).values(data).returning();
  return warning;
};

export const getWarnings = async (limit: number, offset: number, companyId?: number) => {
  let conditions = [];
  if (companyId) conditions.push(eq(warnings.companyId, companyId));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(warnings).where(whereClause).limit(limit).offset(offset).orderBy(desc(warnings.createdAt)),
    db.select({ total: count() }).from(warnings).where(whereClause)
  ]);
  
  return { items, total };
};

export const getWarningsByCustomer = async (customerId: number, limit: number, offset: number) => {
  const whereClause = eq(warnings.customerId, customerId);
  const [items, [{ total }]] = await Promise.all([
    db.select().from(warnings).where(whereClause).limit(limit).offset(offset).orderBy(desc(warnings.createdAt)),
    db.select({ total: count() }).from(warnings).where(whereClause)
  ]);
  return { items, total };
};

export const resolveWarning = async (id: number) => {
  const [updated] = await db.update(warnings)
    .set({ isResolved: true, resolvedAt: new Date() })
    .where(eq(warnings.id, id))
    .returning();
  return updated;
};
