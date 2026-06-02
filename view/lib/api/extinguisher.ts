import { extinguisherClient } from './client';

export interface ExtinguisherRecord {
  id: number;
  serialNumber: string;
  type: string;
  capacity: string;
  location: string;
  status: 'active' | 'expired' | 'maintenance' | 'decommissioned';
  manufactureDate: string;
  expiryDate: string;
  customerId?: number;
  companyId: number;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  notes?: string;
  customer?: { id: number; businessName: string; contactPerson: string };
}

export interface CatalogItem {
  id: number;
  companyId: number;
  name: string;
  type: string;
  capacity: string;
  description?: string | null;
  price: string | number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface RegisterExtinguisherPayload {
  serialNumber: string;
  type: string;
  capacity: string;
  location: string;
  manufactureDate: string;
  expiryDate: string;
  customerId?: number;
  notes?: string;
}

export const extinguisherApi = {
  // List extinguishers (company-scoped automatically by backend)
  getExtinguishers: (page = 1, limit = 20, filters?: { customerId?: number; type?: string; status?: string }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    return extinguisherClient.get<{ items: ExtinguisherRecord[]; total: number; page: number; totalPages: number }>(
      `/extinguishers?${params}`
    );
  },

  registerExtinguisher: (data: RegisterExtinguisherPayload) =>
    extinguisherClient.post<ExtinguisherRecord>('/extinguishers', data),

  updateExtinguisherStatus: (id: number, status: 'active' | 'expired' | 'maintenance' | 'decommissioned') =>
    extinguisherClient.patch<ExtinguisherRecord>(`/extinguishers/${id}/status`, { status }),

  getExpiring: (days = 30, page = 1, limit = 20) => {
    const params = new URLSearchParams({ days: days.toString(), page: page.toString(), limit: limit.toString() });
    return extinguisherClient.get<{ items: ExtinguisherRecord[]; total: number }>(
      `/extinguishers/expiring?${params}`
    );
  },

  // Public catalog — no auth required, shows all companies' listed items
  getCatalog: (page = 1, limit = 50, filters?: { type?: string; search?: string; companyId?: number }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.companyId) params.append('companyId', filters.companyId.toString());
    return extinguisherClient.get<{ items: CatalogItem[]; total: number; page: number; totalPages: number }>(
      `/extinguishers/catalog?${params}`
    );
  },

  addCatalogItem: (data: { name: string; type: string; capacity: string; description?: string; price: number; imageUrl?: string }) =>
    extinguisherClient.post<CatalogItem>('/extinguishers/catalog', data),
};
