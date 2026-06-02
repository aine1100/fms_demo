import { Router } from 'express';
import * as complianceController from '../controllers/compliance.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/rules.validator';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /compliance/reports:
 *   post:
 *     summary: Create a compliance report
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *               companyId:
 *                 type: integer
 *               status:
 *                 type: string
 *               findings:
 *                 type: string
 *               actionRequired:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - customerId
 *               - companyId
 *               - status
 *               - findings
 *     responses:
 *       201:
 *         description: Compliance report created successfully
 */
router.post('/reports', authorize(UserRole.INSPECTOR), validate(validators.createComplianceReportSchema), complianceController.createReport);

/**
 * @swagger
 * /compliance/reports:
 *   get:
 *     summary: Get compliance reports
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of compliance reports
 */
router.get('/reports', authorize(UserRole.COMPANY, UserRole.INSPECTOR, UserRole.SUPER_ADMIN), complianceController.getReports);

/**
 * @swagger
 * /compliance/reports/{id}:
 *   get:
 *     summary: Get a compliance report by id
 *     tags: [Compliance]
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
 *         description: Compliance report details
 */
router.get('/reports/:id', complianceController.getReportById);

/**
 * @swagger
 * /compliance/reports/{id}:
 *   put:
 *     summary: Update a compliance report
 *     tags: [Compliance]
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
 *             properties:
 *               status:
 *                 type: string
 *               findings:
 *                 type: string
 *               actionRequired:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Compliance report updated successfully
 */
router.put('/reports/:id', authorize(UserRole.INSPECTOR), validate(validators.updateComplianceReportSchema), complianceController.updateReport);

/**
 * @swagger
 * /compliance/reports/{id}/resolve:
 *   patch:
 *     summary: Resolve a compliance report
 *     tags: [Compliance]
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
 *         description: Compliance report resolved successfully
 */
router.patch('/reports/:id/resolve', authorize(UserRole.INSPECTOR), complianceController.resolveReport);

/**
 * @swagger
 * /compliance/non-compliant:
 *   get:
 *     summary: Get non-compliant customers or reports
 *     tags: [Compliance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Non-compliant records
 */
router.get('/non-compliant', authorize(UserRole.INSPECTOR, UserRole.SUPER_ADMIN, UserRole.COMPANY), complianceController.getNonCompliant);

export default router;
