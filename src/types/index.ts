export type UserRole = 'OWNER' | 'TEAM_LEAD' | 'CHATTER';

export interface User {
  id: string;
  login: string;
  password?: string; // Stored securely in organization state for demo owner management
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'blocked';
  avatar?: string;
  teamLeadId?: string; // For chatters assigned to a team lead
  timezone: string; // e.g. 'Asia/Manila', 'Asia/Almaty', 'Europe/Kyiv', 'Europe/Istanbul'
  commissionPercent: number; // default 25%
  walletBalance: number; // USD
  createdAt: string;
  phone?: string;
  notes?: string;
  slotNumber?: number; // Slot ID in Owner's roster
}

export type ShiftStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'UNCLOSED';

export interface Shift {
  id: string;
  chatterId: string;
  chatterName: string;
  date: string; // YYYY-MM-DD
  title?: string; // e.g. "Смена День", "Смена Ночь"
  plannedStart: string; // "10:00"
  plannedEnd: string; // "18:00"
  orgTimezone: string; // e.g. "Asia/Almaty" (UTC+5)
  chatterTimezone: string; // e.g. "Asia/Manila" (UTC+8)
  status: ShiftStatus;
  
  // Real execution metrics
  actualStart?: string; // ISO or "10:00"
  startGross?: number; // e.g. $230 entering sales meter
  actualEnd?: string; // ISO or "18:00"
  endGross?: number; // e.g. $350 exit sales meter
  earnedGross?: number; // 350 - 230 = $120 gross shift sales
  commissionPercent?: number; // 25%
  chatterPayout?: number; // $120 * 25% = $30.00
  lateMinutes?: number;
  durationMinutes?: number;
  note?: string;
  completedAt?: string;
  unclosedReason?: string;
}

export interface FineCategory {
  id: string;
  nameRu: string;
  nameEn: string;
  defaultAmount: number; // in USD
  isActive: boolean;
  createdAt: string;
}

export interface Fine {
  id: string;
  chatterId: string;
  chatterName: string;
  categoryId: string;
  categoryName: string;
  amount: number; // USD at time of issuance
  date: string;
  reason: string;
  issuedBy: string; // User ID
  issuedByName: string;
  createdAt: string;
  status: 'active' | 'waived';
}

export interface BonusRule {
  id: string;
  title: string;
  type: 'fixed' | 'percentage';
  value: number; // $ or %
  calculationBase?: 'shift_earned' | 'monthly_earned' | 'team_sales';
  conditions: string;
  period: 'daily' | 'weekly' | 'monthly';
  assignedToRole?: 'ALL' | 'CHATTER';
  createdAt: string;
}

export interface Bonus {
  id: string;
  chatterId: string;
  chatterName: string;
  title: string;
  type: 'fixed' | 'percentage';
  amount: number; // Final USD
  basisAmount?: number; // For % bonuses (e.g. 25% of $120)
  rate?: number; // e.g. 10%
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  createdAt: string;
  decisionBy?: string;
  decisionAt?: string;
  comment?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
}

export interface InviteToken {
  id: string;
  token: string;
  role: UserRole;
  teamLeadId?: string;
  expiresAt: string;
  isUsed: boolean;
  usedBy?: string;
}

export interface TeamLeadPermissions {
  canViewSalaries: boolean;
  canAssignFines: boolean;
  canEditSchedule: boolean;
  canViewReports: boolean;
}

export interface OrganizationSettings {
  name: string;
  supportEmail: string;
  baseTimezone: string;
  defaultCommission: number;
  currency: string;
  teamLeadPermissions: TeamLeadPermissions;
}
