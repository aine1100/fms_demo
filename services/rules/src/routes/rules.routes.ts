import { Router } from 'express';
import * as rulesController from '../controllers/rules.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/rules.validator';

const router = Router();

/**
 * @swagger
 * /rules:
 *   get:
 *     summary: Get all rules
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of rules
 */
router.get('/', authenticate, rulesController.getRules);

/**
 * @swagger
 * /rules/{id}:
 *   get:
 *     summary: Get a rule by id
 *     tags: [Rules]
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
 *         description: Rule details
 */
router.get('/:id', authenticate, rulesController.getRuleById);

/**
 * @swagger
 * /rules:
 *   post:
 *     summary: Create a new rule
 *     tags: [Rules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *             required:
 *               - title
 *               - description
 *     responses:
 *       201:
 *         description: Rule created successfully
 */
router.post('/', authenticate, authorize(UserRole.COMPANY, UserRole.SUPER_ADMIN), validate(validators.createRuleSchema), rulesController.createRule);

/**
 * @swagger
 * /rules/{id}:
 *   put:
 *     summary: Update a rule
 *     tags: [Rules]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               documentUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Rule updated successfully
 */
router.put('/:id', authenticate, authorize(UserRole.COMPANY, UserRole.SUPER_ADMIN), validate(validators.updateRuleSchema), rulesController.updateRule);

/**
 * @swagger
 * /rules/{id}:
 *   delete:
 *     summary: Delete a rule
 *     tags: [Rules]
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
 *         description: Rule deleted successfully
 */
router.delete('/:id', authenticate, authorize(UserRole.SUPER_ADMIN), rulesController.deleteRule);

export default router;
