import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as authService from '../services/auth.service';
import { generateToken, AuthRequest, getPaginationParams, buildPaginatedResponse, UserRole, sendEmail, redisClient } from '@fms/shared';

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, companyName, companyPhone, companyAddress } = req.body;

    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    if (role === UserRole.INSPECTOR) {
      return res.status(403).json({ success: false, message: 'Inspectors cannot self-register' });
    }

    const companyData = role === UserRole.COMPANY ? {
      name: companyName,
      email,
      phone: companyPhone,
      address: companyAddress
    } : undefined;

    const user = await authService.createUser({ firstName, lastName, email, password, role }, companyData);

    // mark user inactive until verification
    await authService.updateUser(user.id, { isActive: false });

    // generate OTP and store in Redis (10 minutes)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`otp:${email}`, otp, 'EX', 600);

    // send OTP via email
    const subject = 'Verify your account';
    const html = `<p>Your verification code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`;
    await sendEmail({ to: email, subject, html });

    res.status(201).json({ success: true, message: 'User registered successfully. Check email for verification OTP', data: { id: user.id, email: user.email } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyAccount = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const stored = await redisClient.get(`otp:${email}`);
    if (!stored || stored !== otp) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await authService.updateUser(user.id, { isActive: true });
    await redisClient.del(`otp:${email}`);

    res.json({ success: true, message: 'Account verified successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`reset:${email}`, otp, 'EX', 900); // 15 minutes

    const subject = 'Password reset request';
    const html = `<p>Your password reset code is <strong>${otp}</strong>. It expires in 15 minutes.</p>`;
    await sendEmail({ to: email, subject, html });

    res.json({ success: true, message: 'Password reset OTP sent to email' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    const stored = await redisClient.get(`reset:${email}`);
    if (!stored || stored !== otp) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await authService.updateUser(user.id, { password: hashed });
    await redisClient.del(`reset:${email}`);

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await authService.findUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      companyId: user.companyId
    });

    const { generateRefreshToken } = require('@fms/shared');
    const refreshToken = generateRefreshToken({ userId: user.id });
    await authService.saveRefreshToken(user.id, refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: userWithoutPassword, token, refreshToken }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    const storedToken = await authService.findRefreshToken(refreshToken);
    if (!storedToken || storedToken.isRevoked || new Date(storedToken.expiresAt) < new Date()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    const user = await authService.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      companyId: user.companyId
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { token: newToken }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profile = await authService.getProfileWithCompany(userId);
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const updatedUser = await authService.updateUser(userId, req.body);
    res.json({ success: true, message: 'Profile updated', data: updatedUser });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { role, companyId } = req.user!;
    
    // Companies can only see their own users. Super admin sees all.
    const filterCompanyId = role === UserRole.COMPANY ? companyId! : undefined;
    
    const { items, total } = await authService.getAllUsers(limit, offset, filterCompanyId);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInspector = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, password, companyId } = req.body;
    
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const inspector = await authService.createUser({
      firstName,
      lastName,
      email,
      password,
      role: UserRole.INSPECTOR,
      companyId,
    });

    res.status(201).json({ success: true, message: 'Inspector created', data: inspector });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, offset } = getPaginationParams(req.query);
    const { items, total } = await authService.getAllCompanies(limit, offset);
    res.json({ success: true, ...buildPaginatedResponse(items, total, page, limit) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCompanyStatus = async (req: Request, res: Response) => {
  try {
    const companyId = parseInt(req.params.id);
    const { isActive } = req.body;
    const company = await authService.updateCompanyStatus(companyId, isActive);
    res.json({ success: true, message: 'Company status updated', data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
