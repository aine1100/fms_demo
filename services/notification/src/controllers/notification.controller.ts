import { Request, Response } from 'express';
import { AuthRequest, getPaginationParams, buildPaginatedResponse } from '@fms/shared';
import * as notificationService from '../services/notification.service';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const filters = {
      type: req.query.type as string,
      status: req.query.status as string,
    };
    const userId = req.user!.userId;
    
    const { items, total } = await notificationService.getNotifications(userId, limit, offset, filters);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await notificationService.markAsRead(id, req.user!.userId);
    res.json({ success: true, message: 'Marked as read', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    res.json({ success: true, message: 'All marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await notificationService.deleteNotification(id, req.user!.userId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { email, sendEmail, ...data } = req.body;
    data.companyId = req.user!.companyId;
    
    const notification = await notificationService.createNotification(data, email, sendEmail);
    res.status(201).json({ success: true, message: 'Notification sent', data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendBulkNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userIds, ...data } = req.body;
    data.companyId = req.user!.companyId;
    
    const notifications = await notificationService.createBulkNotifications(userIds, data);
    res.status(201).json({ success: true, message: 'Bulk notifications sent', data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
