import { Router } from 'express';
import * as notifController from '../controllers/notification.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/notification.validator';

const router = Router();

router.use(authenticate);

router.get('/', notifController.getNotifications);
router.get('/unread-count', notifController.getUnreadCount);
router.patch('/:id/read', notifController.markAsRead);
router.patch('/read-all', notifController.markAllAsRead);
router.delete('/:id', notifController.deleteNotification);

router.post('/send', authorize(UserRole.COMPANY, UserRole.SUPER_ADMIN), validate(validators.sendNotificationSchema), notifController.sendNotification);
router.post('/send-bulk', authorize(UserRole.COMPANY, UserRole.SUPER_ADMIN), validate(validators.sendBulkNotificationSchema), notifController.sendBulkNotification);

export default router;
