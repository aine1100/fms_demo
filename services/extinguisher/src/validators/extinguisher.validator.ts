import { z } from 'zod';
import { ExtinguisherType, ExtinguisherStatus } from '@fms/shared';

const isoDateString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Must be a valid date',
  });

const manufactureDateString = isoDateString.refine((value) => {
  const date = new Date(value);
  const today = new Date();
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return date <= today;
}, {
  message: 'Manufacture date cannot be in the future',
});

const expiryDateString = isoDateString

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
  manufactureDate: manufactureDateString,
  expiryDate: expiryDateString,
  lastInspectionDate: isoDateString.optional(),
  nextInspectionDate: isoDateString.optional(),
  location: z.string().optional(),
});

// Ensure expiry is not before manufacture when registering
export const registerExtinguisherSchemaWithDates = registerExtinguisherSchema.refine((data) => {
  try {
    const m = new Date(data.manufactureDate)
    const e = new Date(data.expiryDate)
    m.setHours(0, 0, 0, 0)
    e.setHours(0, 0, 0, 0)
    return e >= m
  } catch (err) {
    return false
  }
}, {
  message: 'Expiry date cannot be before manufacture date',
})
export const updateExtinguisherStatusSchema = z.object({
  status: z.nativeEnum(ExtinguisherStatus),
});
