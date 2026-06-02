import { customerClient, extinguisherClient, inspectionClient, notificationClient, paymentClient, type ApiResponse } from './client';
import type { ExtinguisherRecord } from './extinguisher';
import type { InspectionRecord } from './inspection';
import type { InvoiceRecord } from './payment';
import type { NotificationRecord } from './notification';

export interface CustomerPayload {
  userId?: number;
  businessName: string;
  contactPerson: string;
  address?: string;
  phone?: string;
  city?: string;
}

export interface CustomerRecord {
  id: number;
  userId: number;
  companyId: number;
  businessName: string;
  contactPerson: string;
  address?: string;
  phone?: string;
  city?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export const customerApi = {
  // Company: list all customers (scoped to company automatically by backend)
  getCustomers: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return customerClient.get<{ items: CustomerRecord[]; total: number; page: number; totalPages: number }>(
      `/customers?${params}`
    );
  },

  getCustomerById: (id: number) =>
    customerClient.get<CustomerRecord>(`/customers/${id}`),

  createCustomer: (data: CustomerPayload) =>
    customerClient.post<CustomerRecord>('/customers', data),

  updateCustomer: (id: number, data: Partial<CustomerPayload>) =>
    customerClient.put<CustomerRecord>(`/customers/${id}`, data),

  deleteCustomer: (id: number) =>
    customerClient.delete(`/customers/${id}`),

  // Customer role: own profile
  getMyProfile: () =>
    customerClient.get<CustomerRecord>('/customers/me'),

  updateMyProfile: (data: Partial<CustomerPayload>) =>
    customerClient.put<CustomerRecord>('/customers/me', data),

  getMyExtinguishers: async () => {
    try {
      const profile = await customerApi.getMyProfile();
      if (!profile.success || !profile.data) {
        // Return empty result if no profile, don't fail
        return {
          success: true,
          message: 'No extinguishers yet',
          data: {
            items: [],
            total: 0,
            page: 1,
            totalPages: 1,
          }
        } as ApiResponse<{ items: ExtinguisherRecord[]; total: number; page: number; totalPages: number }>;
      }

      return extinguisherClient.get<{ items: ExtinguisherRecord[]; total: number; page: number; totalPages: number }>(
        `/extinguishers/my?customerId=${profile.data.id}`
      );
    } catch (error: any) {
      // Return empty result on error instead of failing
      return {
        success: true,
        message: 'No extinguishers yet',
        data: {
          items: [],
          total: 0,
          page: 1,
          totalPages: 1,
        }
      } as ApiResponse<{ items: ExtinguisherRecord[]; total: number; page: number; totalPages: number }>;
    }
  },

  getAlerts: async (page = 1, limit = 5) =>
    notificationClient.get<{ items: NotificationRecord[]; total: number; page: number; totalPages: number }>(
      `/notifications?page=${page}&limit=${limit}`
    ),

  getInspectionHistory: async (page = 1, limit = 5) => {
    try {
      const extRes = await customerApi.getMyExtinguishers();
      if (!extRes.success || !extRes.data || (extRes.data.items ?? []).length === 0) {
        return {
          success: true,
          message: 'No inspection history yet',
          data: { items: [], total: 0, page, totalPages: 1 },
        } as ApiResponse<{ items: InspectionRecord[]; total: number; page: number; totalPages: number }>;
      }

      const firstExtinguishers = (extRes.data.items ?? []).slice(0, 5);
      const histories = await Promise.all(
        firstExtinguishers.map((ext) =>
          inspectionClient.get<{ items: InspectionRecord[]; total: number; page: number; totalPages: number }>(
            `/inspections/extinguisher/${ext.id}?page=1&limit=${limit}`
          )
        )
      );

      const items = histories.flatMap(result => (result.success && result.data ? result.data.items ?? [] : []));
      const sortedItems = items
        .slice()
        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
        .slice(0, limit);

      return {
        success: true,
        message: 'Inspection history loaded',
        data: { items: sortedItems, total: sortedItems.length, page, totalPages: 1 },
      } as ApiResponse<{ items: InspectionRecord[]; total: number; page: number; totalPages: number }>;
    } catch {
      return {
        success: true,
        message: 'No inspection history yet',
        data: { items: [], total: 0, page, totalPages: 1 },
      } as ApiResponse<{ items: InspectionRecord[]; total: number; page: number; totalPages: number }>;
    }
  },

  getInvoices: async (page = 1, limit = 5) => {
    try {
      const profile = await customerApi.getMyProfile();
      if (!profile.success || !profile.data) {
        return {
          success: true,
          message: 'No invoices yet',
          data: { items: [], total: 0, page, totalPages: 1 },
        } as ApiResponse<{ items: InvoiceRecord[]; total: number; page: number; totalPages: number }>;
      }

      return paymentClient.get<{ items: InvoiceRecord[]; total: number; page: number; totalPages: number }>(
        `/payments/invoices?customerId=${profile.data.id}&page=${page}&limit=${limit}`
      );
    } catch {
      return {
        success: true,
        message: 'No invoices yet',
        data: { items: [], total: 0, page, totalPages: 1 },
      } as ApiResponse<{ items: InvoiceRecord[]; total: number; page: number; totalPages: number }>;
    }
  },
};
