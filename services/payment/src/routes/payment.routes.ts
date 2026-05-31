import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/payment.validator';

const router = Router();

router.use(authenticate);

// Invoices
router.post('/invoices', authorize(UserRole.COMPANY), validate(validators.generateInvoiceSchema), paymentController.createInvoice);
router.get('/invoices', authorize(UserRole.COMPANY, UserRole.CUSTOMER), paymentController.getInvoices);
router.get('/invoices/:id', paymentController.getInvoiceById);

// Payments
router.post('/pay', authorize(UserRole.COMPANY, UserRole.CUSTOMER), validate(validators.recordPaymentSchema), paymentController.recordPayment);
router.get('/history', authorize(UserRole.COMPANY, UserRole.CUSTOMER, UserRole.SUPER_ADMIN), paymentController.getPaymentsHistory);
router.get('/receipts/:id', paymentController.getReceiptById);

export default router;
