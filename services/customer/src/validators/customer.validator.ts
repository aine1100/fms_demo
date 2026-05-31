import { z } from 'zod';

export const createCustomerSchema = z.object({
  userId: z.number(),
  businessName: z.string().optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export const updateCustomerSchema = z.object({
  businessName: z.string().optional(),
  contactPerson: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
});
