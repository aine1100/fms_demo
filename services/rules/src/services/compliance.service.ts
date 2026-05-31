import { db } from '../db/connection';
import { eq, and, count, desc } from 'drizzle-orm';
import { complianceReports } from '../db/schema';

export const createReport = async (data: any) => {
  const [report] = await db.insert(complianceReports).values({
    ...data,
    deadline: data.deadline ? new Date(data.deadline) : null,
  }).returning();
  return report;
};

export const getReports = async (limit: number, offset: number, filters: any) => {
  let conditions = [];
  
  if (filters.companyId) conditions.push(eq(complianceReports.companyId, filters.companyId));
  if (filters.customerId) conditions.push(eq(complianceReports.customerId, filters.customerId));
  if (filters.status) conditions.push(eq(complianceReports.status, filters.status));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(complianceReports).where(whereClause).limit(limit).offset(offset).orderBy(desc(complianceReports.createdAt)),
    db.select({ total: count() }).from(complianceReports).where(whereClause)
  ]);
  
  return { items, total };
};

export const getReportById = async (id: number) => {
  const [report] = await db.select().from(complianceReports).where(eq(complianceReports.id, id));
  return report;
};

export const updateReport = async (id: number, data: any) => {
  const updateData = { ...data, updatedAt: new Date() };
  if (data.deadline) updateData.deadline = new Date(data.deadline);
  
  const [updated] = await db.update(complianceReports)
    .set(updateData)
    .where(eq(complianceReports.id, id))
    .returning();
  return updated;
};

export const resolveReport = async (id: number) => {
  const [updated] = await db.update(complianceReports)
    .set({ status: 'compliant' as any, resolvedAt: new Date(), updatedAt: new Date() })
    .where(eq(complianceReports.id, id))
    .returning();
  return updated;
};

export const getNonCompliantCustomers = async (limit: number, offset: number, companyId?: number) => {
  let conditions = [eq(complianceReports.status, 'non_compliant' as any)];
  if (companyId) conditions.push(eq(complianceReports.companyId, companyId));

  const whereClause = and(...conditions);
  
  const [items, [{ total }]] = await Promise.all([
    db.select().from(complianceReports).where(whereClause).limit(limit).offset(offset),
    db.select({ total: count() }).from(complianceReports).where(whereClause)
  ]);
  
  return { items, total };
};
