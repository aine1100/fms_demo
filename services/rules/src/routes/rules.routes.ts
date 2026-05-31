import { Router } from 'express';
import * as rulesController from '../controllers/rules.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/rules.validator';

const router = Router();

router.get('/', authenticate, rulesController.getRules);
router.get('/:id', authenticate, rulesController.getRuleById);

router.post('/', authenticate, authorize(UserRole.COMPANY, UserRole.SUPER_ADMIN), validate(validators.createRuleSchema), rulesController.createRule);
router.put('/:id', authenticate, authorize(UserRole.COMPANY, UserRole.SUPER_ADMIN), validate(validators.updateRuleSchema), rulesController.updateRule);
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), rulesController.deleteRule);

export default router;
