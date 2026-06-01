import { inspectionClient } from './client';

export interface InspectionRecord {
  id: number;
  extinguisherId: number;
  companyId: number;
  inspectorId?: number;
  customerId?: number;
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  result?: 'passed' | 'failed' | 'requires_maintenance';
  remarks?: string;
  location?: string;
  extinguisher?: { id: number; serialNumber: string; type: string; location: string };
  inspector?: { id: number; firstName: string; lastName: string; email: string };
  customer?: { id: number; businessName: string; contactPerson: string };
}

export interface ScheduleInspectionPayload {
  extinguisherId: number;
  inspectorId?: number;
  customerId?: number;
  scheduledDate: string;
  location?: string;
  notes?: string;
}

export const inspectionApi = {
  getInspections: (page = 1, limit = 20, filters?: { status?: string; from?: string; to?: string; inspectorId?: number }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.status) params.append('status', filters.status);
    if (filters?.from) params.append('from', filters.from);
    if (filters?.to) params.append('to', filters.to);
    if (filters?.inspectorId) params.append('inspectorId', filters.inspectorId.toString());
    return inspectionClient.get<{ items: InspectionRecord[]; total: number; page: number; totalPages: number }>(
      `/inspections?${params}`
    );
  },

  getInspectionById: (id: number) =>
    inspectionClient.get<InspectionRecord>(`/inspections/${id}`),

  scheduleInspection: (data: ScheduleInspectionPayload) =>
    inspectionClient.post<InspectionRecord>('/inspections', data),

  updateInspection: (id: number, data: Partial<ScheduleInspectionPayload>) =>
    inspectionClient.put<InspectionRecord>(`/inspections/${id}`, data),

  cancelInspection: (id: number) =>
    inspectionClient.patch<InspectionRecord>(`/inspections/${id}/cancel`, {}),

  completeInspection: (id: number, data: { result: 'passed' | 'failed' | 'requires_maintenance'; remarks?: string }) =>
    inspectionClient.patch<InspectionRecord>(`/inspections/${id}/complete`, data),

  getOverdue: (page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return inspectionClient.get<{ items: InspectionRecord[]; total: number }>(`/inspections/overdue?${params}`);
  },

  getExtinguisherHistory: (extinguisherId: number, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return inspectionClient.get<{ items: InspectionRecord[]; total: number }>(
      `/inspections/extinguisher/${extinguisherId}?${params}`
    );
  },
};
