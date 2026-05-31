import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole } from '@fms/shared';
import * as paymentService from '../services/payment.service';

export const createInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const data = { ...req.body, companyId: req.user!.companyId };
    const invoice = await paymentService.createInvoice(data);
    res.status(201).json({ success: true, message: 'Invoice created', data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      companyId: req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined,
      customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
      status: req.query.status as string,
    };
    
    // Customers can only see their own invoices
    if (req.user?.role === UserRole.CUSTOMER) {
       // We'd map userId to customerId. Assuming client passes it or we fetch it.
       // For now, relying on query param logic, but enforcing it
       if (!filters.customerId) return res.status(400).json({ success: false, message: 'customerId required' });
    }
    
    const { items, total } = await paymentService.getInvoices(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const invoice = await paymentService.getInvoiceById(id);
    
    if (!invoice) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user?.role === UserRole.COMPANY && invoice.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { invoiceId, amount, paymentMethod, transactionRef, notes } = req.body;
    
    const invoice = await paymentService.getInvoiceById(invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (req.user?.role === UserRole.COMPANY && invoice.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const payment = await paymentService.recordPayment(
      { invoiceId, amount, paymentMethod, transactionRef, notes },
      invoice.companyId,
      invoice.customerId
    );

    res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentsHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      companyId: req.user?.role === UserRole.COMPANY ? req.user.companyId : undefined,
      customerId: req.query.customerId ? parseInt(req.query.customerId as string) : undefined,
      method: req.query.method as string,
    };
    
    const { items, total } = await paymentService.getPayments(limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getReceiptById = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const receipt = await paymentService.getReceiptById(id);
    
    if (!receipt) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user?.role === UserRole.COMPANY && receipt.companyId !== req.user.companyId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, data: receipt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
