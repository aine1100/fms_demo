import { db } from '../db/connection';
import { eq, or, ilike, and, count } from 'drizzle-orm';
import { customers } from '../db/schema';

export const createCustomer = async (data: any) => {
  const [customer] = await db.insert(customers).values(data).returning();
  return customer;
};

export const getCustomers = async (limit: number, offset: number, companyId?: number, search?: string) => {
  let conditions = [];
  
  if (companyId) {
    conditions.push(eq(customers.companyId, companyId));
  }
  
  if (search) {
    conditions.push(
      or(
        ilike(customers.businessName, `%${search}%`),
        ilike(customers.contactPerson, `%${search}%`),
        ilike(customers.phone, `%${search}%`)
      )
    );
  }
  
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(customers).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(customers).where(whereClause)
  ]);
  
  return { items, total };
};

export const getCustomerById = async (id: number) => {
  const [customer] = await db.select().from(customers).where(eq(customers.id, id));
  return customer;
};

export const getCustomerByUserId = async (userId: number) => {
  const [customer] = await db.select().from(customers).where(eq(customers.userId, userId));
  return customer;
};

export const updateCustomer = async (id: number, data: any) => {
  const [updated] = await db.update(customers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(customers.id, id))
    .returning();
  return updated;
};

export const deleteCustomer = async (id: number) => {
  await db.delete(customers).where(eq(customers.id, id));
  return true;
};
