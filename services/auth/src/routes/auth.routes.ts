import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate, authenticate, authorize, UserRole } from '@fms/shared';
import * as validators from '../validators/auth.validator';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [customer, company] }
 *               companyName: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', validate(validators.registerSchema), authController.register);
router.post('/verify', validate(validators.verifyAccountSchema), authController.verifyAccount);
/**
 * @swagger
 * /auth/verify:
 *   post:
 *     summary: Verify user account with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', validate(validators.loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Token refreshed successful
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validate(validators.refreshTokenSchema), authController.refresh);
/**
 * @swagger
 * /auth/request-reset:
 *   post:
 *     summary: Request password reset OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Password reset OTP sent
 */
router.post('/request-reset', validate(validators.requestResetSchema), authController.requestPasswordReset);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired OTP
 */
router.post('/reset-password', validate(validators.resetPasswordSchema), authController.resetPassword);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authenticate, validate(validators.updateProfileSchema), authController.updateProfile);

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.COMPANY), authController.getUsers);

/**
 * @swagger
 * /auth/users/inspector:
 *   post:
 *     summary: Create inspector user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               companyId: { type: integer }
 *     responses:
 *       201:
 *         description: Inspector created
 */
router.post('/users/inspector', authenticate, authorize(UserRole.SUPER_ADMIN), validate(validators.createInspectorSchema), authController.createInspector);

/**
 * @swagger
 * /auth/companies:
 *   get:
 *     summary: List all companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of companies
 */
router.get('/companies', authenticate, authorize(UserRole.SUPER_ADMIN), authController.getCompanies);

/**
 * @swagger
 * /auth/companies/{id}/status:
 *   put:
 *     summary: Update company status
 *     tags: [Companies]
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
 *               isActive: { type: boolean }
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/companies/:id/status', authenticate, authorize(UserRole.SUPER_ADMIN), authController.updateCompanyStatus);

export default router;
