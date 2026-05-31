import { z } from 'zod';
import { ComplianceStatus, WarningSeverity } from '@fms/shared';

// Rules Validators
export const createRuleSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.string().optional(),
  documentUrl: z.string().url().optional(),
});

export const updateRuleSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  documentUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

// Compliance Validators
export const createComplianceReportSchema = z.object({
  customerId: z.number(),
  companyId: z.number(),
  status: z.nativeEnum(ComplianceStatus),
  findings: z.string(),
  actionRequired: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

export const updateComplianceReportSchema = z.object({
  status: z.nativeEnum(ComplianceStatus).optional(),
  findings: z.string().optional(),
  actionRequired: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

// Warnings Validators
export const issueWarningSchema = z.object({
  complianceReportId: z.number().optional(),
  customerId: z.number(),
  companyId: z.number(),
  message: z.string(),
  severity: z.nativeEnum(WarningSeverity),
});
