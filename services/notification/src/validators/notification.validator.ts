import { z } from 'zod';
import { NotificationType } from '@fms/shared';

export const sendNotificationSchema = z.object({
  userId: z.number(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  sendEmail: z.boolean().optional(),
  email: z.string().email().optional(), // Needed if sendEmail is true since we don't fetch users
  metadata: z.record(z.any()).optional(),
}).refine(data => {
  if (data.sendEmail && !data.email) {
    return false;
  }
  return true;
}, {
  message: "email is required when sendEmail is true",
  path: ["email"],
});

export const sendBulkNotificationSchema = z.object({
  userIds: z.array(z.number()),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  // For bulk emails, we would normally fetch emails from auth service.
  // We'll skip email sending for bulk without emails in request for now.
  metadata: z.record(z.any()).optional(),
});
