import { db } from '../db/connection';
import { eq, and, count, gte, lt, desc } from 'drizzle-orm';
import { inspections, customers, users, extinguishers } from '../db/schema';

export const scheduleInspection = async (data: any) => {
  const [inspection] = await db.insert(inspections).values({
    ...data,
    scheduledDate: new Date(data.scheduledDate),
  }).returning();
  return inspection;
};

const buildInspectionWithCustomer = async (inspectionList: any[]) => {
  return Promise.all(inspectionList.map(async (inspection) => {
    if (!inspection.customerId) return inspection;
    
    const [customer] = await db.select({
      id: customers.id,
      businessName: customers.businessName,
      contactPerson: customers.contactPerson,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
      }
    }).from(customers)
      .leftJoin(users, eq(customers.userId, users.id))
      .where(eq(customers.id, inspection.customerId));
    
    const [extinguisher] = await db.select({
      id: extinguishers.id,
      serialNumber: extinguishers.serialNumber,
    }).from(extinguishers)
      .where(eq(extinguishers.id, inspection.extinguisherId));
    
    return {
      ...inspection,
      customer: customer ? {
        id: customer.id,
        businessName: customer.businessName,
        contactPerson: customer.contactPerson,
        firstName: customer.user?.firstName,
        lastName: customer.user?.lastName,
      } : null,
      extinguisher: extinguisher || null,
    };
  }));
};

export const getInspections = async (limit: number, offset: number, filters: any) => {
  let conditions = [];
  
  if (filters.companyId) conditions.push(eq(inspections.companyId, filters.companyId));
  if (filters.inspectorId) conditions.push(eq(inspections.inspectorId, filters.inspectorId));
  if (filters.status) conditions.push(eq(inspections.status, filters.status as any));
  if (filters.from) conditions.push(gte(inspections.scheduledDate, new Date(filters.from)));
  if (filters.to) conditions.push(lt(inspections.scheduledDate, new Date(filters.to)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(inspections).where(whereClause).limit(limit).offset(offset).orderBy(desc(inspections.scheduledDate)),
    db.select({ total: count() }).from(inspections).where(whereClause)
  ]);

  const enrichedItems = await buildInspectionWithCustomer(items);
  
  return { items: enrichedItems, total };
};

export const getInspectionById = async (id: number) => {
  const [inspection] = await db.select().from(inspections).where(eq(inspections.id, id));
  if (!inspection) return null;
  
  const [enriched] = await buildInspectionWithCustomer([inspection]);
  return enriched;
};

export const updateInspection = async (id: number, data: any) => {
  const updateData = { ...data, updatedAt: new Date() };
  if (data.scheduledDate) updateData.scheduledDate = new Date(data.scheduledDate);
  
  const [updated] = await db.update(inspections).set(updateData).where(eq(inspections.id, id)).returning();
  const [enriched] = await buildInspectionWithCustomer([updated]);
  return enriched;
};

export const completeInspection = async (id: number, result: string, remarks?: string) => {
  const [updated] = await db.update(inspections).set({
    status: 'completed' as any,
    result: result as any,
    remarks,
    completedDate: new Date(),
    updatedAt: new Date()
  }).where(eq(inspections.id, id)).returning();
  const [enriched] = await buildInspectionWithCustomer([updated]);
  return enriched;
};

export const cancelInspection = async (id: number) => {
  const [updated] = await db.update(inspections).set({
    status: 'cancelled' as any,
    updatedAt: new Date()
  }).where(eq(inspections.id, id)).returning();
  const [enriched] = await buildInspectionWithCustomer([updated]);
  return enriched;
};

export const getExtinguisherHistory = async (extinguisherId: number, limit: number, offset: number) => {
  const whereClause = eq(inspections.extinguisherId, extinguisherId);
  const [items, [{ total }]] = await Promise.all([
    db.select().from(inspections).where(whereClause).limit(limit).offset(offset).orderBy(desc(inspections.completedDate)),
    db.select({ total: count() }).from(inspections).where(whereClause)
  ]);
  
  const enrichedItems = await buildInspectionWithCustomer(items);
  return { items: enrichedItems, total };
};

export const getOverdueInspections = async (limit: number, offset: number, companyId?: number, inspectorId?: number) => {
  let conditions = [
    lt(inspections.scheduledDate, new Date()),
    eq(inspections.status, 'scheduled' as any)
  ];
  if (companyId) conditions.push(eq(inspections.companyId, companyId));
  if (inspectorId) conditions.push(eq(inspections.inspectorId, inspectorId));

  const whereClause = and(...conditions);
  const [items, [{ total }]] = await Promise.all([
    db.select().from(inspections).where(whereClause).limit(limit).offset(offset).orderBy(inspections.scheduledDate),
    db.select({ total: count() }).from(inspections).where(whereClause)
  ]);
  
  const enrichedItems = await buildInspectionWithCustomer(items);
  return { items: enrichedItems, total };
};
