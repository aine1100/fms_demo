import { db } from '../db/connection';
import { eq, and, count, desc, sql } from 'drizzle-orm';
import { invoices, payments, customers, users } from '../db/schema';

// Helper to generate Invoice Number
const generateInvoiceNumber = async () => {
  const [result] = await db.select({ max: sql`MAX(id)` }).from(invoices);
  const nextId = (result?.max as number || 0) + 1;
  const year = new Date().getFullYear();
  return `INV-${year}-${nextId.toString().padStart(4, '0')}`;
};

// Helper to generate Receipt Number
const generateReceiptNumber = async () => {
  const [result] = await db.select({ max: sql`MAX(id)` }).from(payments);
  const nextId = (result?.max as number || 0) + 1;
  const year = new Date().getFullYear();
  return `RCP-${year}-${nextId.toString().padStart(4, '0')}`;
};

const buildInvoiceWithCustomer = async (invoiceList: any[]) => {
  return Promise.all(invoiceList.map(async (invoice) => {
    if (!invoice.customerId) return invoice;
    
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
      .where(eq(customers.id, invoice.customerId));
    
    return {
      ...invoice,
      customer: customer ? {
        id: customer.id,
        businessName: customer.businessName,
        contactPerson: customer.contactPerson,
        firstName: customer.user?.firstName,
        lastName: customer.user?.lastName,
      } : null,
    };
  }));
};

export const createInvoice = async (data: any) => {
  const invoiceNumber = await generateInvoiceNumber();
  const tax = data.tax || 0;
  const totalAmount = data.amount + tax;

  const [invoice] = await db.insert(invoices).values({
    ...data,
    invoiceNumber,
    tax: tax.toString(),
    amount: data.amount.toString(),
    totalAmount: totalAmount.toString(),
    dueDate: new Date(data.dueDate),
  }).returning();

  const [enriched] = await buildInvoiceWithCustomer([invoice]);
  return enriched;
};

export const getInvoices = async (limit: number, offset: number, filters: any) => {
  let conditions = [];
  
  if (filters.companyId) conditions.push(eq(invoices.companyId, filters.companyId));
  if (filters.customerId) conditions.push(eq(invoices.customerId, filters.customerId));
  if (filters.status) conditions.push(eq(invoices.status, filters.status));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(invoices).where(whereClause).limit(limit).offset(offset).orderBy(desc(invoices.createdAt)),
    db.select({ total: count() }).from(invoices).where(whereClause)
  ]);

  const enrichedItems = await buildInvoiceWithCustomer(items);
  
  return { items: enrichedItems, total };
};

export const getInvoiceById = async (id: number) => {
  const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
  if (!invoice) return null;
  
  const [enriched] = await buildInvoiceWithCustomer([invoice]);
  return enriched;
};

export const recordPayment = async (data: any, companyId: number, customerId: number) => {
  return await db.transaction(async (tx) => {
    const receiptNumber = await generateReceiptNumber();

    const [payment] = await tx.insert(payments).values({
      ...data,
      companyId,
      customerId,
      receiptNumber,
      amount: data.amount.toString(),
    }).returning();

    // Auto-update invoice status to paid
    const [updatedInvoice] = await tx.update(invoices)
      .set({ status: 'paid' as any, updatedAt: new Date() })
      .where(eq(invoices.id, data.invoiceId))
      .returning();

    const [enriched] = await buildInvoiceWithCustomer([updatedInvoice]);
    return { payment, invoice: enriched };
  });
};

export const getPayments = async (limit: number, offset: number, filters: any) => {
  let conditions = [];
  
  if (filters.companyId) conditions.push(eq(payments.companyId, filters.companyId));
  if (filters.customerId) conditions.push(eq(payments.customerId, filters.customerId));
  if (filters.method) conditions.push(eq(payments.paymentMethod, filters.method));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.select().from(payments).where(whereClause).limit(limit).offset(offset).orderBy(desc(payments.createdAt)),
    db.select({ total: count() }).from(payments).where(whereClause)
  ]);
  
  return { items, total };
};

export const getReceiptById = async (id: number) => {
  const [payment] = await db.select().from(payments).where(eq(payments.id, id));
  return payment;
};
