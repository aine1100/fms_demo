import { Router } from 'express';
import * as inspController from '../controllers/inspection.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/inspection.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.COMPANY, UserRole.INSPECTOR), validate(validators.scheduleInspectionSchema), inspController.scheduleInspection);
router.get('/', authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), inspController.getInspections);
router.get('/overdue', authorize(UserRole.COMPANY, UserRole.INSPECTOR), inspController.getOverdue);
router.get('/:id', inspController.getInspectionById);
router.put('/:id', authorize(UserRole.COMPANY, UserRole.INSPECTOR), validate(validators.updateInspectionSchema), inspController.updateInspection);
router.patch('/:id/complete', authorize(UserRole.INSPECTOR), validate(validators.completeInspectionSchema), inspController.completeInspection);
router.patch('/:id/cancel', authorize(UserRole.COMPANY), inspController.cancelInspection);
router.get('/extinguisher/:extinguisherId', inspController.getHistory);

export default router;
