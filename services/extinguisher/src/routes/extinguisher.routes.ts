import { Router } from 'express';
import * as extController from '../controllers/extinguisher.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/extinguisher.validator';

const router = Router();

/**
 * @swagger
 * /extinguishers/catalog:
 *   post:
 *     summary: Add a catalog item
 *     tags: [Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, capacity, price]
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [water, foam, co2, dry_powder, wet_chemical]
 *               capacity:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Catalog item added successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Catalog Routes
router.post('/catalog', authenticate, authorize(UserRole.COMPANY), validate(validators.createCatalogItemSchema), extController.addCatalogItem);
/**
 * @swagger
 * /extinguishers/catalog:
 *   get:
 *     summary: List catalog items
 *     tags: [Catalog]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: companyId
 *         schema:
 *           type: integer
 *         description: Optional company filter
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Optional extinguisher type filter
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Optional name search
 *     responses:
 *       200:
 *         description: Catalog items retrieved successfully
 */
router.get('/catalog', extController.getCatalog); // Public

/**
 * @swagger
 * /extinguishers:
 *   post:
 *     summary: Register a new extinguisher
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serialNumber, type, capacity, manufactureDate, expiryDate]
 *             properties:
 *               serialNumber:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [water, foam, co2, dry_powder, wet_chemical]
 *               capacity:
 *                 type: string
 *               manufactureDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               lastInspectionDate:
 *                 type: string
 *                 format: date
 *               nextInspectionDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Extinguisher registered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Extinguisher Routes
router.post('/', authenticate, authorize(UserRole.COMPANY), validate(validators.registerExtinguisherSchemaWithDates), extController.registerExtinguisher);
/**
 * @swagger
 * /extinguishers:
 *   get:
 *     summary: List extinguishers
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, expired, maintenance, decommissioned]
 *     responses:
 *       200:
 *         description: Extinguishers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authenticate, authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), extController.getExtinguishers);
/**
 * @swagger
 * /extinguishers/my:
 *   get:
 *     summary: List extinguishers for the authenticated customer
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Customer identifier
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer extinguishers retrieved successfully
 *       400:
 *         description: customerId is required
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, authorize(UserRole.CUSTOMER), extController.getMyExtinguishers);
/**
 * @swagger
 * /extinguishers/{id}/status:
 *   patch:
 *     summary: Update extinguisher status
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, expired, maintenance, decommissioned]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Extinguisher not found
 */
router.patch('/:id/status', authenticate, authorize(UserRole.COMPANY), validate(validators.updateExtinguisherStatusSchema), extController.updateExtinguisherStatus);
/**
 * @swagger
 * /extinguishers/expiring:
 *   get:
 *     summary: List extinguishers expiring soon
 *     tags: [Extinguishers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Number of days ahead to check
 *     responses:
 *       200:
 *         description: Expiring extinguishers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/expiring', authenticate, authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), extController.getExpiring);

export default router;
