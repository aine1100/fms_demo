import { z } from 'zod';
import { ExtinguisherType, ExtinguisherStatus } from '@fms/shared';

export const createCatalogItemSchema = z.object({
  name: z.string().min(2),
  type: z.nativeEnum(ExtinguisherType),
  capacity: z.string(),
  description: z.string().optional(),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
});

export const registerExtinguisherSchema = z.object({
  serialNumber: z.string(),
  catalogItemId: z.number().optional(),
  customerId: z.number().optional(),
  type: z.nativeEnum(ExtinguisherType),
  capacity: z.string(),
  manufactureDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  lastInspectionDate: z.string().datetime().optional(),
  nextInspectionDate: z.string().datetime().optional(),
  location: z.string().optional(),
});

export const updateExtinguisherStatusSchema = z.object({
  status: z.nativeEnum(ExtinguisherStatus),
});
