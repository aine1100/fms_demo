import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as rulesService from '../services/rules.service';

export const createRule = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, createdBy: req.user!.userId };
    const rule = await rulesService.createRule(data);
    res.status(201).json({ success: true, message: 'Rule created', data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRules = async (req: Request, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      category: req.query.category as string,
      search: req.query.search as string,
    };
    
    const { items, total } = await rulesService.getRules(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRuleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const rule = await rulesService.getRuleById(id);
    if (!rule) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: rule });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRule = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await rulesService.updateRule(id, req.body);
    res.json({ success: true, message: 'Rule updated', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRule = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await rulesService.deleteRule(id);
    res.json({ success: true, message: 'Rule deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
