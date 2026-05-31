import { Router } from 'express';
import * as warningsController from '../controllers/warnings.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/rules.validator';

const router = Router();

router.use(authenticate);

router.post('/', authorize(UserRole.INSPECTOR), validate(validators.issueWarningSchema), warningsController.issueWarning);
router.get('/', authorize(UserRole.INSPECTOR, UserRole.SUPER_ADMIN, UserRole.COMPANY), warningsController.getWarnings);
router.get('/customer/:customerId', warningsController.getCustomerWarnings);
router.patch('/:id/resolve', authorize(UserRole.INSPECTOR), warningsController.resolveWarning);

export default router;
