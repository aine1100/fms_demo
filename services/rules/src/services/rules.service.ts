import { db } from '../db/connection';
import { eq, ilike, and, count } from 'drizzle-orm';
import { rules } from '../db/schema';

export const createRule = async (data: any) => {
  const [rule] = await db.insert(rules).values(data).returning();
  return rule;
};

export const getRules = async (limit: number, offset: number, filters: any) => {
  let conditions = [eq(rules.isActive, true)];
  
  if (filters.category) conditions.push(eq(rules.category, filters.category));
  if (filters.search) conditions.push(ilike(rules.title, `%${filters.search}%`));

  const whereClause = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db.select().from(rules).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(rules).where(whereClause)
  ]);
  
  return { items, total };
};

export const getRuleById = async (id: number) => {
  const [rule] = await db.select().from(rules).where(eq(rules.id, id));
  return rule;
};

export const updateRule = async (id: number, data: any) => {
  const [updated] = await db.update(rules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(rules.id, id))
    .returning();
  return updated;
};

export const deleteRule = async (id: number) => {
  await db.delete(rules).where(eq(rules.id, id));
  return true;
};
