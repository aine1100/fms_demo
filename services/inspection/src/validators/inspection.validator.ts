import { z } from 'zod';
import { InspectionResult } from '@fms/shared';

const dateString = z
  .string()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Must be a valid date',
  });

export const scheduleInspectionSchema = z.object({
  extinguisherId: z.number(),
  scheduledDate: dateString,
  inspectorId: z.number().optional(),
  customerId: z.number().optional(),
  location: z.string().optional(),
});

export const updateInspectionSchema = z.object({
  scheduledDate: dateString.optional(),
  inspectorId: z.number().optional(),
  location: z.string().optional(),
});

export const completeInspectionSchema = z.object({
  result: z.nativeEnum(InspectionResult),
  remarks: z.string().optional(),
});
