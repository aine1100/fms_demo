import { db } from '../db/connection';
import { eq, or, ilike, and, count, lte, sql } from 'drizzle-orm';
import { extinguisherCatalog, extinguishers } from '../db/schema';

// --- Catalog Services ---
export const addCatalogItem = async (data: any) => {
  const [item] = await db.insert(extinguisherCatalog).values(data).returning();
  return item;
};

export const getCatalog = async (limit: number, offset: number, filters: any) => {
  let conditions = [];
  
  if (filters.companyId) conditions.push(eq(extinguisherCatalog.companyId, filters.companyId));
  if (filters.type) conditions.push(eq(extinguisherCatalog.type, filters.type));
  if (filters.search) conditions.push(ilike(extinguisherCatalog.name, `%${filters.search}%`));
  conditions.push(eq(extinguisherCatalog.isActive, true));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(extinguisherCatalog).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(extinguisherCatalog).where(whereClause)
  ]);
  console.log("searching extinguishers")
  
  return { items, total };
};

export const getCatalogItemById = async (id: number) => {
  const [item] = await db.select().from(extinguisherCatalog).where(eq(extinguisherCatalog.id, id));
  return item;
};

// --- Extinguisher Services ---
export const registerExtinguisher = async (data: any) => {
  // Normalize dates
  const manufactureDate = data.manufactureDate ? new Date(data.manufactureDate) : null
  const expiryDate = data.expiryDate ? new Date(data.expiryDate) : null

  // Determine status based on expiry (if expiry is in the past, mark expired)
  let status: any = 'active'
  if (expiryDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const e = new Date(expiryDate)
    e.setHours(0, 0, 0, 0)
    if (e < today) status = 'expired'
  }

  const [extinguisher] = await db.insert(extinguishers).values({
    ...data,
    manufactureDate: manufactureDate,
    expiryDate: expiryDate,
    lastInspectionDate: data.lastInspectionDate ? new Date(data.lastInspectionDate) : null,
    nextInspectionDate: data.nextInspectionDate ? new Date(data.nextInspectionDate) : null,
    status,
  }).returning();
  return extinguisher;
};

export const getExtinguishers = async (limit: number, offset: number, filters: any) => {
  let conditions = [];
  
  if (filters.companyId) conditions.push(eq(extinguishers.companyId, filters.companyId));
  if (filters.customerId) conditions.push(eq(extinguishers.customerId, filters.customerId));
  if (filters.type) conditions.push(eq(extinguishers.type, filters.type));
  if (filters.status) conditions.push(eq(extinguishers.status, filters.status));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(extinguishers).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(extinguishers).where(whereClause)
  ]);
  console.log("searching extinguishers")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const normalizedItems = items.map((item: any) => {
    if (item.status === 'active') {
      const expiry = item.expiryDate instanceof Date ? item.expiryDate : new Date(item.expiryDate)
      const expiryDate = new Date(expiry)
      expiryDate.setHours(0, 0, 0, 0)
      if (expiryDate < today) {
        return { ...item, status: 'expired' }
      }
    }
    return item
  })

  return { items: normalizedItems, total };
};

export const getExtinguisherById = async (id: number) => {
  const [item] = await db.select().from(extinguishers).where(eq(extinguishers.id, id));
  return item;
};

export const updateExtinguisherStatus = async (id: number, status: string) => {
  const [updated] = await db.update(extinguishers)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(extinguishers.id, id))
    .returning();
  return updated;
};

export const getExpiringExtinguishers = async (limit: number, offset: number, days: number, companyId?: number) => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  let conditions = [
    lte(extinguishers.expiryDate, futureDate),
    eq(extinguishers.status, 'active' as any)
  ];
  if (companyId) conditions.push(eq(extinguishers.companyId, companyId));

  const whereClause = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db.select().from(extinguishers).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(extinguishers).where(whereClause)
  ]);
  
  return { items, total };
};
