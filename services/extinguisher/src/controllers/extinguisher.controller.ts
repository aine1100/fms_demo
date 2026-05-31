import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as extinguisherService from '../services/extinguisher.service';

export const addCatalogItem = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, companyId: req.user!.companyId };
    const item = await extinguisherService.addCatalogItem(data);
    res.status(201).json({ success: true, message: 'Item added to catalog', data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCatalog = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      companyId: req.query.companyId ? parseInt(req.query.companyId as string) : undefined,
      type: req.query.type as string,
      search: req.query.search as string
    };
    
    const { items, total } = await extinguisherService.getCatalog(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerExtinguisher = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, companyId: req.user!.companyId };
    const extinguisher = await extinguisherService.registerExtinguisher(data);
    res.status(201).json({ success: true, message: 'Extinguisher registered', data: extinguisher });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExtinguishers = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      companyId: req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined,
      customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
      type: req.query.type as string,
      status: req.query.status as string,
    };
    
    const { items, total } = await extinguisherService.getExtinguishers(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyExtinguishers = async (req: AuthRequest, res: Response) => {
  try {
    // Assuming we have a way to map userId to customerId via API Gateway or we just query by customerId if we know it.
    // For now, this requires the customerId in query, but ideally we'd fetch it from Customer service.
    const customerId = parseInt(req.query.customerId as string);
    if (!customerId) return res.status(400).json({ success: false, message: 'customerId is required' });

    const { page, limit, offset } = getPaginationParams(req.query);
    const { items, total } = await extinguisherService.getExtinguishers(limit, offset, { customerId });
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateExtinguisherStatus = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    const extinguisher = await extinguisherService.getExtinguisherById(id);
    if (!extinguisher) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user?.role === UserRole.COMPANY && extinguisher.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = await extinguisherService.updateExtinguisherStatus(id, status);
    res.json({ success: true, message: 'Status updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getExpiring = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const days = parseInt((req.query.days as string) || '30');
    const companyId = req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined;

    const { items, total } = await extinguisherService.getExpiringExtinguishers(limit, offset, days, companyId!);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
