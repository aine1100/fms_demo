import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as inspectionService from '../services/inspection.service';

export const scheduleInspection = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, companyId: req.user!.companyId };
    const inspection = await inspectionService.scheduleInspection(data);
    res.status(201).json({ success: true, message: 'Inspection scheduled', data: inspection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInspections = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      companyId: req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined,
      inspectorId: req.user?.role === UserRole.INSPECTOR ? req.user.userId : req.query.inspectorId ? parseInt(req.query.inspectorId as string) : undefined,
      status: req.query.status as string,
      from: req.query.from as string,
      to: req.query.to as string,
    };
    
    const { items, total } = await inspectionService.getInspections(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInspectionById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const inspection = await inspectionService.getInspectionById(id);
    
    if (!inspection) return res.status(404).json({ success: false, message: 'Not found' });
    
    // Access checks
    if (req.user?.role === UserRole.COMPANY && inspection.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    if (req.user?.role === UserRole.INSPECTOR && inspection.inspectorId !== req.user.userId) {
       // Optional: maybe inspectors can see all company inspections? We enforce strict for now.
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: inspection });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInspection = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await inspectionService.updateInspection(id, req.body);
    res.json({ success: true, message: 'Inspection updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeInspection = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { result, remarks } = req.body;
    const completed = await inspectionService.completeInspection(id, result, remarks);
    res.json({ success: true, message: 'Inspection completed', data: completed });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelInspection = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const cancelled = await inspectionService.cancelInspection(id);
    res.json({ success: true, message: 'Inspection cancelled', data: cancelled });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const extinguisherId = parseInt(req.params.extinguisherId);
    const { page, limit, offset } = getPaginationParams(req.query);
    const { items, total } = await inspectionService.getExtinguisherHistory(extinguisherId, limit, offset);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOverdue = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const companyId = req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined;
    const inspectorId = req.user?.role === UserRole.INSPECTOR ? req.user.userId : undefined;
    
    const { items, total } = await inspectionService.getOverdueInspections(limit, offset, companyId!, inspectorId!);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
