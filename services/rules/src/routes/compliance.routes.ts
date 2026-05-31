import { Router } from 'express';
import * as complianceController from '../controllers/compliance.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/rules.validator';

const router = Router();

router.use(authenticate);

router.post('/reports', authorize(UserRole.INSPECTOR), validate(validators.createComplianceReportSchema), complianceController.createReport);
router.get('/reports', authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), complianceController.getReports);
router.get('/reports/:id', complianceController.getReportById);
router.put('/reports/:id', authorize(UserRole.INSPECTOR), validate(validators.updateComplianceReportSchema), complianceController.updateReport);
router.patch('/reports/:id/resolve', authorize(UserRole.INSPECTOR), complianceController.resolveReport);

router.get('/non-compliant', authorize(UserRole.INSPECTOR, UserRole.SUPER_ADMIN, UserRole.COMPANY), complianceController.getNonCompliant);

export default router;
