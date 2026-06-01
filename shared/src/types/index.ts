// Shared types and enums
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  COMPANY = 'company',
  CUSTOMER = 'customer',
  INSPECTOR = 'inspector',
}

export enum ExtinguisherType {
  WATER = 'water',
  FOAM = 'foam',
  CO2 = 'co2',
  DRY_POWDER = 'dry_powder',
  WET_CHEMICAL = 'wet_chemical',
}

export enum ExtinguisherStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  MAINTENANCE = 'maintenance',
  DECOMMISSIONED = 'decommissioned',
}

export enum NotificationType {
  EXPIRY = 'expiry',
  INSPECTION = 'inspection',
  PAYMENT = 'payment',
  RULES = 'rules',
  GENERAL = 'general',
}

export enum NotificationStatus {
  SEEN = 'seen',
  UNSEEN = 'unseen',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_MONEY = 'mobile_money',
  CARD = 'card',
}

export enum PaymentStatus {
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum InspectionResult {
  PASSED = 'passed',
  FAILED = 'failed',
  REQUIRES_MAINTENANCE = 'requires_maintenance',
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  WARNING = 'warning',
}

export enum WarningSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Interfaces
export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  companyId?: number | null;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  items?: T[];
  total?: number;
  page?: number;
  totalPages?: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
