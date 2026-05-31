import { z } from 'zod';
import { InspectionResult } from '@fms/shared';

export const scheduleInspectionSchema = z.object({
  extinguisherId: z.number(),
  scheduledDate: z.string().datetime(),
  inspectorId: z.number().optional(),
  customerId: z.number().optional(),
  location: z.string().optional(),
});

export const updateInspectionSchema = z.object({
  scheduledDate: z.string().datetime().optional(),
  inspectorId: z.number().optional(),
  location: z.string().optional(),
});

export const completeInspectionSchema = z.object({
  result: z.nativeEnum(InspectionResult),
  remarks: z.string().optional(),
});
