import { z } from 'zod';
import { PaymentMethod } from '@fms/shared';

export const generateInvoiceSchema = z.object({
  customerId: z.number(),
  extinguisherId: z.number().optional(),
  catalogItemId: z.number().optional(),
  description: z.string(),
  amount: z.number().min(0),
  tax: z.number().min(0).optional(),
  dueDate: z.string().datetime(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.number(),
  amount: z.number().min(0),
  paymentMethod: z.nativeEnum(PaymentMethod),
  transactionRef: z.string().optional(),
  notes: z.string().optional(),
});
