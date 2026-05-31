import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as customerService from '../services/customer.service';

export const createCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body;
    if (req.user?.role === UserRole.COMPANY) {
      data.companyId = req.user.companyId;
    }
    
    const customer = await customerService.createCustomer(data);
    res.status(201).json({ success: true, message: 'Customer created', data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomers = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const search = req.query.search as string | undefined;
    
    // Companies can only see their own customers. Super admin/inspector sees all.
    const companyId = req.user?.role === UserRole.COMPANY ? req.user.companyId! : undefined;
    
    const { items, total } = await customerService.getCustomers(limit, offset, companyId, search);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    if (req.user?.role === UserRole.COMPANY && customer.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    if (req.user?.role === UserRole.COMPANY && customer.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    const updatedCustomer = await customerService.updateCustomer(id, req.body);
    res.json({ success: true, message: 'Customer updated', data: updatedCustomer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const customer = await customerService.getCustomerById(id);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    if (req.user?.role === UserRole.COMPANY && customer.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await customerService.deleteCustomer(id);
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const customer = await customerService.getCustomerByUserId(userId);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }
    
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const customer = await customerService.getCustomerByUserId(userId);
    
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer profile not found' });
    }
    
    const updatedCustomer = await customerService.updateCustomer(customer.id, req.body);
    res.json({ success: true, message: 'Profile updated', data: updatedCustomer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
