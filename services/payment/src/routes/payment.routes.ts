import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/payment.validator';

const router = Router();

router.use(authenticate);

// Invoices
/**
 * @swagger
 * /payments/invoices:
 *   post:
 *     summary: Generate a new invoice
 *     tags: [Payments]
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
 *               extinguisherId:
 *                 type: integer
 *               catalogItemId:
 *                 type: integer
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *               tax:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *             required:
 *               - customerId
 *               - description
 *               - amount
 *               - dueDate
 *     responses:
 *       201:
 *         description: Invoice created successfully
 */
router.post('/invoices', authorize(UserRole.COMPANY), validate(validators.generateInvoiceSchema), paymentController.createInvoice);

/**
 * @swagger
 * /payments/invoices:
 *   get:
 *     summary: Get invoices for the current user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of invoices
 */
router.get('/invoices', authorize(UserRole.COMPANY, UserRole.CUSTOMER), paymentController.getInvoices);

/**
 * @swagger
 * /payments/invoices/{id}:
 *   get:
 *     summary: Get invoice by id
 *     tags: [Payments]
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
 *         description: Invoice details
 */
router.get('/invoices/:id', paymentController.getInvoiceById);

// Payments
/**
 * @swagger
 * /payments/pay:
 *   post:
 *     summary: Record a payment for an invoice
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: integer
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               transactionRef:
 *                 type: string
 *               notes:
 *                 type: string
 *             required:
 *               - invoiceId
 *               - amount
 *               - paymentMethod
 *     responses:
 *       201:
 *         description: Payment recorded successfully
 */
router.post('/pay', authorize(UserRole.COMPANY, UserRole.CUSTOMER), validate(validators.recordPaymentSchema), paymentController.recordPayment);

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history list
 */
router.get('/history', authorize(UserRole.COMPANY, UserRole.CUSTOMER, UserRole.SUPER_ADMIN), paymentController.getPaymentsHistory);

/**
 * @swagger
 * /payments/receipts/{id}:
 *   get:
 *     summary: Get receipt by id
 *     tags: [Payments]
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
 *         description: Receipt details
 */
router.get('/receipts/:id', paymentController.getReceiptById);

export default router;
