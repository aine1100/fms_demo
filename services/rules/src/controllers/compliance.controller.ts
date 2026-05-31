import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as complianceService from '../services/compliance.service';

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, inspectorId: req.user!.userId };
    const report = await complianceService.createReport(data);
    res.status(201).json({ success: true, message: 'Report created', data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      companyId: req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined,
      customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
      status: req.query.status as string,
    };
    
    const { items, total } = await complianceService.getReports(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const report = await complianceService.getReportById(id);
    if (!report) return res.status(404).json({ success: false, message: 'Not found' });
    
    if (req.user?.role === UserRole.COMPANY && report.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReport = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await complianceService.updateReport(id, req.body);
    res.json({ success: true, message: 'Report updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await complianceService.resolveReport(id);
    res.json({ success: true, message: 'Report resolved', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNonCompliant = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const companyId = req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined;
    
    const { items, total } = await complianceService.getNonCompliantCustomers(limit, offset, companyId!);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
