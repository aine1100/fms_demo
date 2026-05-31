import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as warningsService from '../services/warnings.service';

export const issueWarning = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, issuedBy: req.user!.userId };
    const warning = await warningsService.issueWarning(data);
    res.status(201).json({ success: true, message: 'Warning issued', data: warning });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWarnings = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const companyId = req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined;
    
    const { items, total } = await warningsService.getWarnings(limit, offset, companyId!);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerWarnings = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const { page, limit, offset } = getPaginationParams(req.query);
    
    const { items, total } = await warningsService.getWarningsByCustomer(customerId, limit, offset);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveWarning = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await warningsService.resolveWarning(id);
    res.json({ success: true, message: 'Warning resolved', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
