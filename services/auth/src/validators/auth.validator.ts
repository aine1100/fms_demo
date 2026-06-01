import { z } from 'zod';
import { UserRole } from '@fms/shared';

export const registerSchema = z.discriminatedUnion("role", [
  z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.literal(UserRole.COMPANY),
    companyName: z.string().min(2, "Company name is required"),
    companyPhone: z.string().optional(),
    companyAddress: z.string().optional(),
  }),
  z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum([UserRole.CUSTOMER, UserRole.SUPER_ADMIN]),
  }),
]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  password: z.string().min(6).optional(),
});

export const createInspectorSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const verifyAccountSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
});

export const requestResetSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4),
  newPassword: z.string().min(6),
});
