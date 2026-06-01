import { customerClient } from './client';

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
};
