import { authClient } from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'customer' | 'company' | 'super_admin';
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface RequestResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    companyId?: number;
    isActive: boolean;
  };
  token: string;
  refreshToken: string;
}

export interface ProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company?: any;
}

export const authApi = {
  login: (payload: LoginPayload) => 
    authClient.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) => 
    authClient.post<{ id: number; email: string }>('/auth/register', payload),

  verifyAccount: (payload: VerifyAccountPayload) => 
    authClient.post<{ success: boolean }>('/auth/verify', payload),

  requestPasswordReset: (payload: RequestResetPayload) => 
    authClient.post<{ success: boolean }>('/auth/request-reset', payload),

  resetPassword: (payload: ResetPasswordPayload) => 
    authClient.post<{ success: boolean }>('/auth/reset-password', payload),

  refreshToken: (payload: RefreshTokenPayload) => 
    authClient.post<{ token: string }>('/auth/refresh', payload),

  getProfile: () => 
    authClient.get<ProfileResponse>('/auth/profile'),

  updateProfile: (data: Partial<ProfileResponse>) => 
    authClient.put<ProfileResponse>('/auth/profile', data),

  getAllUsers: (limit = 10, offset = 0, companyId?: number) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (companyId) params.append('companyId', companyId.toString());
    return authClient.get<{ items: any[]; total: number }>(`/auth/users?${params}`);
  },

  getAllCompanies: (limit = 10, offset = 0) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    return authClient.get<{ items: any[]; total: number }>(`/auth/companies?${params}`);
  },

  updateCompanyStatus: (companyId: number, isActive: boolean) => 
    authClient.put(`/auth/companies/${companyId}/status`, { isActive }),

  createInspector: (data: { firstName: string; lastName: string; email: string; password: string }) => 
    authClient.post('/auth/users/inspector', data),
};
