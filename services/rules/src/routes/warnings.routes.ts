import { Router } from 'express';
import * as warningsController from '../controllers/warnings.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/rules.validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /compliance/warnings:
 *   post:
 *     summary: Issue a warning
 *     tags: [Warnings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               complianceReportId:
 *                 type: integer
 *               customerId:
 *                 type: integer
 *               companyId:
 *                 type: integer
 *               message:
 *                 type: string
 *               severity:
 *                 type: string
 *             required:
 *               - customerId
 *               - companyId
 *               - message
 *               - severity
 *     responses:
 *       201:
 *         description: Warning issued successfully
 */
router.post('/', authorize(UserRole.INSPECTOR), validate(validators.issueWarningSchema), warningsController.issueWarning);

/**
 * @swagger
 * /compliance/warnings:
 *   get:
 *     summary: Get warnings
 *     tags: [Warnings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of warnings
 */
router.get('/', authorize(UserRole.INSPECTOR, UserRole.SUPER_ADMIN, UserRole.COMPANY), warningsController.getWarnings);

/**
 * @swagger
 * /compliance/warnings/customer/{customerId}:
 *   get:
 *     summary: Get warnings for a specific customer
 *     tags: [Warnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Customer warnings
 */
router.get('/customer/:customerId', warningsController.getCustomerWarnings);

/**
 * @swagger
 * /compliance/warnings/{id}/resolve:
 *   patch:
 *     summary: Resolve a warning
 *     tags: [Warnings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Warning resolved successfully
 */
router.patch('/:id/resolve', authorize(UserRole.INSPECTOR), warningsController.resolveWarning);

export default router;
