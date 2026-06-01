// User Types — must match backend enum: 'super_admin' | 'company' | 'customer' | 'inspector'
export type UserRole = 'super_admin' | 'company' | 'customer' | 'inspector'

export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  // Computed convenience field
  name?: string
  role: UserRole
  avatar?: string
  companyId?: number
  companyName?: string
  phone?: string
  createdAt: string
  lastLogin?: string
  isVerified?: boolean
  isActive: boolean
}

// Company Types
export interface Company {
  id: string
  name: string
  logo?: string
  email: string
  phone: string
  address: string
  isActive: boolean
  createdAt: string
  totalExtinguishers: number
  activeInspectors: number
  pendingInspections: number
}

// Extinguisher Types
export type ExtinguisherStatus = 'active' | 'expired' | 'maintenance' | 'decommissioned'
export type ExtinguisherType = 'ABC' | 'CO2' | 'Water' | 'Foam' | 'Dry Chemical' | 'Wet Chemical'

export interface Extinguisher {
  id: string
  serialNumber: string
  type: ExtinguisherType
  capacity: string
  location: string
  customerId: string
  customerName: string
  companyId: string
  status: ExtinguisherStatus
  manufactureDate: string
  expiryDate: string
  lastInspectionDate?: string
  nextInspectionDate?: string
  photo?: string
  qrCode?: string
  notes?: string
}

// Inspection Types
export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
export type InspectionResult = 'pass' | 'fail' | 'requires_maintenance'

export interface Inspection {
  id: string
  extinguisherId: string
  extinguisherSerial: string
  inspectorId: string
  inspectorName: string
  customerId: string
  customerName: string
  companyId: string
  scheduledDate: string
  completedDate?: string
  status: InspectionStatus
  result?: InspectionResult
  checklist?: InspectionChecklist
  photos?: string[]
  notes?: string
  signature?: string
}

export interface InspectionChecklist {
  pressureGauge: boolean
  physicalCondition: boolean
  pin: boolean
  tamperSeal: boolean
  nozzle: boolean
  hose: boolean
  label: boolean
  mounting: boolean
  accessClear: boolean
  serviceTag: boolean
}

// Invoice Types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  companyId: string
  amount: number
  tax: number
  total: number
  status: InvoiceStatus
  dueDate: string
  paidDate?: string
  items: InvoiceItem[]
  createdAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

// Notification Types
export type NotificationType = 'info' | 'warning' | 'error' | 'success'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
  link?: string
}

// Dashboard Stats
export interface AdminStats {
  totalCompanies: number
  activeInspectors: number
  pendingInspections: number
  overdueExtinguishers: number
  monthlyRevenue: number
  complianceRate: number
}

export interface CompanyStats {
  totalExtinguishers: number
  activeExtinguishers: number
  expiredExtinguishers: number
  maintenanceRequired: number
  totalCustomers: number
  pendingInspections: number
  completedInspections: number
  monthlyRevenue: number
}

export interface CustomerStats {
  totalExtinguishers: number
  activeExtinguishers: number
  upcomingServices: number
  pendingPayments: number
}

export interface InspectorStats {
  todayInspections: number
  weekInspections: number
  completedThisMonth: number
  passRate: number
}
