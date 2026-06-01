import { paymentClient } from './client';

export interface InvoiceRecord {
  id: number;
  invoiceNumber: string;
  companyId: number;
  customerId: number;
  extinguisherId?: number;
  description: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  createdAt: string;
  customer?: { id: number; businessName: string; contactPerson: string };
}

export interface PaymentRecord {
  id: number;
  invoiceId: number;
  companyId: number;
  customerId: number;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateInvoicePayload {
  customerId: number;
  extinguisherId?: number;
  description: string;
  amount: number;
  tax?: number;
  dueDate: string;
}

export const paymentApi = {
  getInvoices: (page = 1, limit = 20, filters?: { customerId?: number; status?: string }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());
    if (filters?.status) params.append('status', filters.status);
    return paymentClient.get<{ items: InvoiceRecord[]; total: number; page: number; totalPages: number }>(
      `/payments/invoices?${params}`
    );
  },

  getInvoiceById: (id: number) =>
    paymentClient.get<InvoiceRecord>(`/payments/invoices/${id}`),

  createInvoice: (data: CreateInvoicePayload) =>
    paymentClient.post<InvoiceRecord>('/payments/invoices', data),

  recordPayment: (data: {
    invoiceId: number;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'mobile_money' | 'card';
    transactionRef?: string;
    notes?: string;
  }) =>
    paymentClient.post<PaymentRecord>('/payments/pay', data),

  getPaymentHistory: (page = 1, limit = 20, filters?: { customerId?: number; method?: string }) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (filters?.customerId) params.append('customerId', filters.customerId.toString());
    if (filters?.method) params.append('method', filters.method);
    return paymentClient.get<{ items: PaymentRecord[]; total: number }>(
      `/payments/history?${params}`
    );
  },

  getReceiptById: (id: number) =>
    paymentClient.get(`/payments/receipts/${id}`),
};
