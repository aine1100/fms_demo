import { Router } from 'express';
import * as extController from '../controllers/extinguisher.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/extinguisher.validator';

const router = Router();

// Catalog Routes
router.post('/catalog', authenticate, authorize(UserRole.COMPANY), validate(validators.createCatalogItemSchema), extController.addCatalogItem);
router.get('/catalog', extController.getCatalog); // Public

// Extinguisher Routes
router.post('/', authenticate, authorize(UserRole.COMPANY), validate(validators.registerExtinguisherSchema), extController.registerExtinguisher);
router.get('/', authenticate, authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), extController.getExtinguishers);
router.get('/my', authenticate, authorize(UserRole.CUSTOMER), extController.getMyExtinguishers);
router.patch('/:id/status', authenticate, authorize(UserRole.COMPANY), validate(validators.updateExtinguisherStatusSchema), extController.updateExtinguisherStatus);
router.get('/expiring', authenticate, authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), extController.getExpiring);

export default router;
