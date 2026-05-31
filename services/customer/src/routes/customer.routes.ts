import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/customer.validator';

const router = Router();

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Register a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: integer }
 *               businessName: { type: string }
 *               contactPerson: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *     responses:
 *       201:
 *         description: Customer registered
 */
router.post('/', authenticate, authorize(UserRole.COMPANY), validate(validators.createCustomerSchema), customerController.createCustomer);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List customers
 *     tags: [Customers]
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
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY, UserRole.INSPECTOR), customerController.getCustomers);

/**
 * @swagger
 * /customers/me:
 *   get:
 *     summary: Get own customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile
 */
router.get('/me', authenticate, authorize(UserRole.CUSTOMER), customerController.getMyProfile);

/**
 * @swagger
 * /customers/me:
 *   put:
 *     summary: Update own customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName: { type: string }
 *               contactPerson: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/me', authenticate, authorize(UserRole.CUSTOMER), validate(validators.updateCustomerSchema), customerController.updateMyProfile);

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by id
 *     tags: [Customers]
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
 *         description: Customer details
 */
router.get('/:id', authenticate, customerController.getCustomerById);

/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
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
 *               businessName: { type: string }
 *               contactPerson: { type: string }
 *               address: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *     responses:
 *       200:
 *         description: Customer updated
 */
router.put('/:id', authenticate, authorize(UserRole.COMPANY), validate(validators.updateCustomerSchema), customerController.updateCustomer);

/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete customer
 *     tags: [Customers]
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
 *         description: Customer deleted
 */
router.delete('/:id', authenticate, authorize(UserRole.COMPANY), customerController.deleteCustomer);

export default router;
