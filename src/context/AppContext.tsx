import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Shift,
  FineCategory,
  Fine,
  BonusRule,
  Bonus,
  AuditLog,
  OrganizationSettings,
  UserRole,
} from '../types';
import { Language, translations } from '../locales/translations';
import { convertTimeBetweenZones, getCurrentTimeHHMM, calculateLateMinutes, calculateDurationHours } from '../utils/time';

interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: typeof translations['ru'];
  currentUser: User | null;
  currentRole: UserRole | null;
  users: User[];
  shifts: Shift[];
  fineCategories: FineCategory[];
  fines: Fine[];
  bonusRules: BonusRule[];
  bonuses: Bonus[];
  auditLogs: AuditLog[];
  settings: OrganizationSettings;
  
  // Auth methods
  loginUser: (loginOrEmail: string, pass: string, portalRole: UserRole) => { success: boolean; error?: string };
  logoutUser: () => void;
  switchDemoUser: (userId: string) => void;

  // Chatter Shift actions
  startShift: (shiftId: string, startGross: number) => { success: boolean; message?: string };
  endShift: (shiftId: string, endGross: number, note?: string) => { success: boolean; payout: number };
  
  // Owner & TL Schedule actions
  createShift: (shift: Omit<Shift, 'id' | 'status'>) => void;
  updateShift: (shiftId: string, updates: Partial<Shift>) => void;
  closeUnclosedShift: (shiftId: string, endGross: number, reason: string) => void;

  // Team & Slots actions
  addSlot: (role: 'CHATTER' | 'TEAM_LEAD', name: string, login: string, pass: string, tz: string, commission?: number, tlId?: string) => void;
  updateUserCredentials: (userId: string, newLogin: string, newPass: string, commission?: number, tlId?: string, tz?: string) => void;
  toggleUserStatus: (userId: string) => void;

  // Fine actions
  addFineCategory: (nameRu: string, nameEn: string, defaultAmount: number) => void;
  issueFine: (chatterId: string, categoryId: string, amount: number, reason: string) => void;
  waiveFine: (fineId: string) => void;

  // Bonus actions
  createBonusRule: (rule: Omit<BonusRule, 'id' | 'createdAt'>) => void;
  requestBonus: (chatterId: string, title: string, type: 'fixed' | 'percentage', amount: number, basisAmount?: number, rate?: number) => void;
  approveBonus: (bonusId: string) => void;
  rejectBonus: (bonusId: string) => void;

  // Settings
  updateSettings: (newSettings: OrganizationSettings) => void;
  updateUserTimezone: (userId: string, tz: string) => void;
}

const STORAGE_KEY = 'tulpar_workforce_data_v1';

const INITIAL_SETTINGS: OrganizationSettings = {
  name: 'TULPAR',
  supportEmail: 'Tulpar2026@gmail.com',
  baseTimezone: 'Asia/Almaty',
  defaultCommission: 25,
  currency: 'USD',
  teamLeadPermissions: {
    canViewSalaries: true,
    canAssignFines: true,
    canEditSchedule: true,
    canViewReports: true,
  },
};

const INITIAL_USERS: User[] = [
  {
    id: 'user_owner',
    login: 'Emir2026',
    password: 'Emir2006',
    email: 'Tulpar2026@gmail.com',
    name: 'Эмир (Владелец)',
    role: 'OWNER',
    status: 'active',
    timezone: 'Asia/Almaty',
    commissionPercent: 100,
    walletBalance: 14250,
    createdAt: '2026-01-10',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_tl_alex',
    login: 'alex_tl',
    password: 'alex123',
    email: 'alex.lead@tulpar.work',
    name: 'Алексей Воронов (Team Lead)',
    role: 'TEAM_LEAD',
    status: 'active',
    timezone: 'Europe/Kyiv',
    commissionPercent: 5,
    walletBalance: 1250,
    createdAt: '2026-02-01',
    slotNumber: 1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_tl_karina',
    login: 'karina_tl',
    password: 'karina123',
    email: 'karina.admin@tulpar.work',
    name: 'Карина Ли (Admin/TL)',
    role: 'TEAM_LEAD',
    status: 'active',
    timezone: 'Asia/Almaty',
    commissionPercent: 5,
    walletBalance: 980,
    createdAt: '2026-02-15',
    slotNumber: 2,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
  // Chatters
  {
    id: 'user_chatter_bryan',
    login: 'bryan',
    password: 'bryan123',
    email: 'bryan.ph@tulpar.work',
    name: 'Брайн Сальвадор (Bryan)',
    role: 'CHATTER',
    status: 'active',
    teamLeadId: 'user_tl_alex',
    timezone: 'Asia/Manila', // Philippines UTC+8
    commissionPercent: 25,
    walletBalance: 240,
    createdAt: '2026-03-01',
    slotNumber: 1,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_chatter_daniyar',
    login: 'daniyar',
    password: 'daniyar123',
    email: 'daniyar.kz@tulpar.work',
    name: 'Данияр Каримов',
    role: 'CHATTER',
    status: 'active',
    teamLeadId: 'user_tl_alex',
    timezone: 'Asia/Almaty', // Kazakhstan UTC+5
    commissionPercent: 25,
    walletBalance: 410,
    createdAt: '2026-03-05',
    slotNumber: 2,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user_chatter_mykhailo',
    login: 'mykhailo',
    password: 'mykhailo123',
    email: 'mykhailo.ua@tulpar.work',
    name: 'Михайло Шевченко',
    role: 'CHATTER',
    status: 'active',
    teamLeadId: 'user_tl_karina',
    timezone: 'Europe/Kyiv', // Ukraine UTC+3
    commissionPercent: 25,
    walletBalance: 320,
    createdAt: '2026-03-12',
    slotNumber: 3,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  },
];

const TODAY_STR = new Date().toISOString().split('T')[0];

const INITIAL_SHIFTS: Shift[] = [
  // Bryan's main requested test shift:
  // Scheduled 10:00 - 18:00 org time (Asia/Almaty UTC+5)
  // In Bryan's Philippines timezone (Asia/Manila UTC+8) it corresponds to 13:00 - 21:00!
  {
    id: 'shift_bryan_today',
    chatterId: 'user_chatter_bryan',
    chatterName: 'Брайн Сальвадор (Bryan)',
    date: TODAY_STR,
    title: 'Смена День (Day Shift)',
    plannedStart: '10:00',
    plannedEnd: '18:00',
    orgTimezone: 'Asia/Almaty',
    chatterTimezone: 'Asia/Manila',
    status: 'PENDING',
    commissionPercent: 25,
    note: 'Основная дневная смена. Ожидаемый вход 10:00 Офис / 13:00 Манила.',
  },
  // Yesterday's finished shift for Bryan demonstrating the exact math:
  // Start: 10:00 ($230), End: 18:00 ($350) -> Delta = $120. Payout at 25% = $30.00!
  {
    id: 'shift_bryan_yesterday',
    chatterId: 'user_chatter_bryan',
    chatterName: 'Брайн Сальвадор (Bryan)',
    date: '2026-10-21',
    title: 'Смена День (Day Shift)',
    plannedStart: '10:00',
    plannedEnd: '18:00',
    orgTimezone: 'Asia/Almaty',
    chatterTimezone: 'Asia/Manila',
    status: 'COMPLETED',
    actualStart: '10:02',
    startGross: 230,
    actualEnd: '18:00',
    endGross: 350,
    earnedGross: 120,
    commissionPercent: 25,
    chatterPayout: 30,
    lateMinutes: 0,
    durationMinutes: 478,
    note: 'Выполнено отлично: касса выросла с $230 до $350. Выплата $30 начислена.',
    completedAt: '2026-10-21 18:00',
  },
  // Daniyar's shift active right now
  {
    id: 'shift_daniyar_active',
    chatterId: 'user_chatter_daniyar',
    chatterName: 'Данияр Каримов',
    date: TODAY_STR,
    title: 'Смена Утро (Morning)',
    plannedStart: '08:00',
    plannedEnd: '16:00',
    orgTimezone: 'Asia/Almaty',
    chatterTimezone: 'Asia/Almaty',
    status: 'IN_PROGRESS',
    actualStart: '08:14',
    startGross: 150,
    lateMinutes: 14,
    commissionPercent: 25,
    note: 'Опоздание на 14 минут. Смена в процессе.',
  },
  // Unclosed shift to test Owner alert and manual closure
  {
    id: 'shift_mykhailo_unclosed',
    chatterId: 'user_chatter_mykhailo',
    chatterName: 'Михайло Шевченко',
    date: '2026-10-20',
    title: 'Смена Ночь (Night)',
    plannedStart: '00:00',
    plannedEnd: '08:00',
    orgTimezone: 'Asia/Almaty',
    chatterTimezone: 'Europe/Kyiv',
    status: 'UNCLOSED',
    actualStart: '00:00',
    startGross: 100,
    lateMinutes: 0,
    unclosedReason: 'Сотрудник не нажал кнопку выхода по окончании смены.',
  },
];

const INITIAL_FINE_CATEGORIES: FineCategory[] = [
  {
    id: 'fine_cat_late',
    nameRu: 'Опоздание на смену',
    nameEn: 'Shift Tardiness',
    defaultAmount: 20,
    isActive: true,
    createdAt: '2026-01-15',
  },
  {
    id: 'fine_cat_unclosed',
    nameRu: 'Незакрытая смена без предупреждения',
    nameEn: 'Unclosed shift without notice',
    defaultAmount: 30,
    isActive: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'fine_cat_afk',
    nameRu: 'Необоснованный простой / AFK во время смены',
    nameEn: 'Unjustified idle during shift',
    defaultAmount: 25,
    isActive: true,
    createdAt: '2026-02-10',
  },
];

const INITIAL_FINES: Fine[] = [
  {
    id: 'fine_1',
    chatterId: 'user_chatter_daniyar',
    chatterName: 'Данияр Каримов',
    categoryId: 'fine_cat_late',
    categoryName: 'Опоздание на смену',
    amount: 20,
    date: TODAY_STR,
    reason: 'Опоздание на смену на 14 минут без предупреждения тимлида',
    issuedBy: 'user_tl_alex',
    issuedByName: 'Алексей Воронов (Team Lead)',
    createdAt: TODAY_STR + ' 08:30',
    status: 'active',
  },
];

const INITIAL_BONUS_RULES: BonusRule[] = [
  {
    id: 'brule_top_shift',
    title: 'Топ-продажи смены ($500+ Gross)',
    type: 'fixed',
    value: 50,
    conditions: 'Касса за одну смену превышает $500 USD',
    period: 'daily',
    assignedToRole: 'CHATTER',
    createdAt: '2026-01-20',
  },
  {
    id: 'brule_pct_target',
    title: 'Премия 5% от недельной перевыполненной кассы',
    type: 'percentage',
    value: 5,
    calculationBase: 'shift_earned',
    conditions: 'Достижение недельного таргета в $3,000 USD',
    period: 'weekly',
    assignedToRole: 'CHATTER',
    createdAt: '2026-02-01',
  },
];

const INITIAL_BONUSES: Bonus[] = [
  {
    id: 'bonus_1',
    chatterId: 'user_chatter_bryan',
    chatterName: 'Брайн Сальвадор (Bryan)',
    title: 'Премия за безупречную конверсию диалогов',
    type: 'fixed',
    amount: 50,
    status: 'approved',
    date: '2026-10-21',
    createdAt: '2026-10-21 19:00',
    decisionBy: 'Эмир (Владелец)',
    decisionAt: '2026-10-21 19:30',
    comment: 'Отличная работа по удержанию топовых фанатов',
  },
  {
    id: 'bonus_2',
    chatterId: 'user_chatter_bryan',
    chatterName: 'Брайн Сальвадор (Bryan)',
    title: 'Процентный бонус за повторные чаевые (10% от $120)',
    type: 'percentage',
    amount: 12,
    basisAmount: 120,
    rate: 10,
    status: 'pending',
    date: TODAY_STR,
    createdAt: TODAY_STR + ' 09:00',
    comment: 'Заявка тимлида на поощрение за крупный донат',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-10-22 08:14',
    userId: 'user_chatter_daniyar',
    userName: 'Данияр Каримов',
    userRole: 'CHATTER',
    action: 'Начало смены',
    details: 'Смена начата с задержкой 14 мин. Стартовая касса: $150',
  },
  {
    id: 'log_2',
    timestamp: '2026-10-22 08:30',
    userId: 'user_tl_alex',
    userName: 'Алексей Воронов',
    userRole: 'TEAM_LEAD',
    action: 'Назначение штрафа',
    details: 'Назначен штраф $20 сотруднику Данияр Каримов (Опоздание на смену)',
  },
  {
    id: 'log_3',
    timestamp: '2026-10-21 18:00',
    userId: 'user_chatter_bryan',
    userName: 'Брайн Сальвадор (Bryan)',
    userRole: 'CHATTER',
    action: 'Завершение смены',
    details: 'Смена закрыта. Вход: $230, Выход: $350. Заработано: $120. Выплата: $30.00 (25%)',
  },
  {
    id: 'log_4',
    timestamp: '2026-10-21 19:30',
    userId: 'user_owner',
    userName: 'Эмир (Владелец)',
    userRole: 'OWNER',
    action: 'Подтверждение бонуса',
    details: 'Одобрен бонус $50 сотруднику Брайн Сальвадор',
  },
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('tulpar_lang') as Language) || 'ru';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('tulpar_lang', newLang);
  };

  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [fineCategories, setFineCategories] = useState<FineCategory[]>(INITIAL_FINE_CATEGORIES);
  const [fines, setFines] = useState<Fine[]>(INITIAL_FINES);
  const [bonusRules, setBonusRules] = useState<BonusRule[]>(INITIAL_BONUS_RULES);
  const [bonuses, setBonuses] = useState<Bonus[]>(INITIAL_BONUSES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<OrganizationSettings>(INITIAL_SETTINGS);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.shifts) setShifts(parsed.shifts);
        if (parsed.fineCategories) setFineCategories(parsed.fineCategories);
        if (parsed.fines) setFines(parsed.fines);
        if (parsed.bonusRules) setBonusRules(parsed.bonusRules);
        if (parsed.bonuses) setBonuses(parsed.bonuses);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
        if (parsed.settings) setSettings(parsed.settings);
      }
      
      const savedUser = localStorage.getItem('tulpar_current_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        setCurrentUser(u);
        setCurrentRole(u.role);
      }
    } catch (e) {
      console.error('Failed to load local storage:', e);
    }
  }, []);

  // Sync to LocalStorage on updates
  useEffect(() => {
    try {
      const bundle = {
        users,
        shifts,
        fineCategories,
        fines,
        bonusRules,
        bonuses,
        auditLogs,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, [users, shifts, fineCategories, fines, bonusRules, bonuses, auditLogs, settings]);

  const addAudit = (action: string, details: string, userOverride?: User) => {
    const actor = userOverride || currentUser;
    const newLog: AuditLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toLocaleString('ru-RU', { hour12: false }),
      userId: actor?.id || 'system',
      userName: actor?.name || 'Система',
      userRole: actor?.role || 'OWNER',
      action,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth Methods
  const loginUser = (loginOrEmail: string, pass: string, portalRole: UserRole) => {
    const cleanInput = loginOrEmail.trim().toLowerCase();
    
    // Find matching user
    const matched = users.find(u => 
      (u.login.toLowerCase() === cleanInput || u.email.toLowerCase() === cleanInput)
    );

    if (!matched) {
      return { success: false, error: translations[lang].invalidCredentialsError };
    }

    if (matched.password !== pass) {
      return { success: false, error: translations[lang].invalidCredentialsError };
    }

    if (matched.status === 'blocked') {
      return { success: false, error: translations[lang].blockedAccountError };
    }

    // Role verification against selected portal
    if (matched.role !== portalRole) {
      return { 
        success: false, 
        error: `${translations[lang].invalidRoleError} (${translations[lang][`role_${portalRole}`]}). Роль аккаунта: ${translations[lang][`role_${matched.role}`]}` 
      };
    }

    setCurrentUser(matched);
    setCurrentRole(matched.role);
    localStorage.setItem('tulpar_current_user', JSON.stringify(matched));
    
    addAudit('Вход в систему', `Пользователь ${matched.name} (${matched.role}) успешно вошел в кабинет`, matched);
    return { success: true };
  };

  const logoutUser = () => {
    if (currentUser) {
      addAudit('Выход из системы', `Пользователь ${currentUser.name} вышел из кабинета`);
    }
    setCurrentUser(null);
    setCurrentRole(null);
    localStorage.removeItem('tulpar_current_user');
  };

  const switchDemoUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setCurrentRole(target.role);
      localStorage.setItem('tulpar_current_user', JSON.stringify(target));
      addAudit('Быстрый переход', `Переключение на демо-аккаунт ${target.name} (${target.role})`, target);
    }
  };

  // Shift Actions
  const startShift = (shiftId: string, startGross: number) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return { success: false, message: 'Shift not found' };

    const nowTimeStr = getCurrentTimeHHMM(shift.orgTimezone);
    const late = calculateLateMinutes(shift.plannedStart, nowTimeStr);

    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'IN_PROGRESS',
          actualStart: nowTimeStr,
          startGross,
          lateMinutes: late,
        };
      }
      return s;
    }));

    addAudit(
      'Начало смены',
      `Сотрудник ${shift.chatterName} начал смену в ${nowTimeStr}. Касса входа: $${startGross}. Опоздание: ${late} мин.`
    );

    return { success: true };
  };

  const endShift = (shiftId: string, endGross: number, note?: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return { success: false, payout: 0 };

    const actualEndTime = getCurrentTimeHHMM(shift.orgTimezone);
    const startVal = shift.startGross || 0;
    const grossEarned = Math.max(0, endGross - startVal);
    const commission = shift.commissionPercent ?? (currentUser?.commissionPercent ?? 25);
    const calculatedPayout = Math.round((grossEarned * (commission / 100)) * 100) / 100;
    const duration = shift.actualStart ? calculateDurationHours(shift.actualStart, actualEndTime) : 8;

    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'COMPLETED',
          actualEnd: actualEndTime,
          endGross,
          earnedGross: grossEarned,
          commissionPercent: commission,
          chatterPayout: calculatedPayout,
          durationMinutes: Math.round(duration * 60),
          completedAt: new Date().toLocaleString('ru-RU', { hour12: false }),
          note: note || s.note,
        };
      }
      return s;
    }));

    // Credit chatter wallet
    setUsers(prev => prev.map(u => {
      if (u.id === shift.chatterId) {
        return {
          ...u,
          walletBalance: Math.round((u.walletBalance + calculatedPayout) * 100) / 100,
        };
      }
      return u;
    }));

    // Update current user if it's the chatter
    if (currentUser && currentUser.id === shift.chatterId) {
      setCurrentUser(prev => prev ? {
        ...prev,
        walletBalance: Math.round((prev.walletBalance + calculatedPayout) * 100) / 100,
      } : null);
    }

    addAudit(
      'Завершение смены',
      `Смена закрыта. Вход: $${startVal}, Выход: $${endGross}. Заработано Gross: $${grossEarned}. Процент ${commission}% -> Выплата $${calculatedPayout} зачислена в кошелек.`
    );

    return { success: true, payout: calculatedPayout };
  };

  const closeUnclosedShift = (shiftId: string, endGross: number, reason: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const startVal = shift.startGross || 0;
    const grossEarned = Math.max(0, endGross - startVal);
    const commission = shift.commissionPercent ?? 25;
    const calculatedPayout = Math.round((grossEarned * (commission / 100)) * 100) / 100;

    setShifts(prev => prev.map(s => {
      if (s.id === shiftId) {
        return {
          ...s,
          status: 'COMPLETED',
          endGross,
          earnedGross: grossEarned,
          chatterPayout: calculatedPayout,
          unclosedReason: reason,
          closedBy: currentUser?.name || 'Владелец',
          completedAt: new Date().toLocaleString('ru-RU', { hour12: false }),
        };
      }
      return s;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === shift.chatterId) {
        return {
          ...u,
          walletBalance: Math.round((u.walletBalance + calculatedPayout) * 100) / 100,
        };
      }
      return u;
    }));

    addAudit(
      'Принудительное закрытие смены',
      `Смена сотрудника ${shift.chatterName} закрыта администратором ${currentUser?.name}. Причина: ${reason}. Выплата: $${calculatedPayout}`
    );
  };

  const createShift = (newShiftData: Omit<Shift, 'id' | 'status'>) => {
    const chatter = users.find(u => u.id === newShiftData.chatterId);
    const newShift: Shift = {
      ...newShiftData,
      id: 'shift_' + Date.now(),
      status: 'PENDING',
      commissionPercent: chatter?.commissionPercent ?? settings.defaultCommission,
      chatterTimezone: chatter?.timezone || 'Asia/Manila',
    };

    setShifts(prev => [newShift, ...prev]);
    addAudit(
      'Назначение смены',
      `Назначена новая смена для ${newShift.chatterName} на дату ${newShift.date} (${newShift.plannedStart} - ${newShift.plannedEnd})`
    );
  };

  const updateShift = (shiftId: string, updates: Partial<Shift>) => {
    setShifts(prev => prev.map(s => s.id === shiftId ? { ...s, ...updates } : s));
  };

  // Team & Slots Actions
  const addSlot = (
    role: 'CHATTER' | 'TEAM_LEAD',
    name: string,
    login: string,
    pass: string,
    tz: string,
    commission: number = 25,
    tlId?: string
  ) => {
    const existingSlotCount = users.filter(u => u.role === role).length;
    const newSlotNumber = existingSlotCount + 1;
    
    const newUser: User = {
      id: `user_${role.toLowerCase()}_${Date.now()}`,
      login,
      password: pass,
      email: `${login.toLowerCase()}@tulpar.work`,
      name,
      role,
      status: 'active',
      timezone: tz || (role === 'CHATTER' ? 'Asia/Manila' : 'Asia/Almaty'),
      commissionPercent: commission,
      walletBalance: 0,
      createdAt: new Date().toISOString().split('T')[0],
      teamLeadId: tlId,
      slotNumber: newSlotNumber,
      avatar: `https://images.unsplash.com/photo-${role === 'CHATTER' ? '1535713875002-d1d0cf377fde' : '1560250097-0b93528c311a'}?w=150&auto=format&fit=crop&q=80`,
    };

    setUsers(prev => [...prev, newUser]);
    addAudit(
      'Создание рабочей ячейки',
      `Владелец создал слот #${newSlotNumber} для ${role === 'CHATTER' ? 'Чаттера' : 'Тимлида'}: ${name} (Логин: ${login})`
    );
  };

  const updateUserCredentials = (
    userId: string,
    newLogin: string,
    newPass: string,
    commission?: number,
    tlId?: string,
    tz?: string
  ) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          login: newLogin || u.login,
          password: newPass || u.password,
          commissionPercent: commission !== undefined ? commission : u.commissionPercent,
          teamLeadId: tlId !== undefined ? tlId : u.teamLeadId,
          timezone: tz || u.timezone,
        };
      }
      return u;
    }));

    addAudit('Изменение учетных данных', `Обновлены логин/пароль/параметры пользователя ID: ${userId}`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'blocked' : 'active';
        addAudit(
          nextStatus === 'blocked' ? 'Блокировка аккаунта' : 'Активация аккаунта',
          `Аккаунт ${u.name} переведен в статус: ${nextStatus}`
        );
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const updateUserTimezone = (userId: string, tz: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, timezone: tz } : u));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, timezone: tz } : null);
    }
  };

  // Fine Actions
  const addFineCategory = (nameRu: string, nameEn: string, defaultAmount: number) => {
    const newCategory: FineCategory = {
      id: 'fine_cat_' + Date.now(),
      nameRu,
      nameEn,
      defaultAmount,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setFineCategories(prev => [...prev, newCategory]);
    addAudit('Добавление категории штрафа', `Создан новый вид штрафа: ${nameRu} ($${defaultAmount} USD)`);
  };

  const issueFine = (chatterId: string, categoryId: string, amount: number, reason: string) => {
    const chatter = users.find(u => u.id === chatterId);
    const cat = fineCategories.find(c => c.id === categoryId);
    if (!chatter) return;

    const newFine: Fine = {
      id: 'fine_' + Date.now(),
      chatterId,
      chatterName: chatter.name,
      categoryId,
      categoryName: lang === 'ru' ? (cat?.nameRu || 'Штраф') : (cat?.nameEn || 'Fine'),
      amount,
      date: new Date().toISOString().split('T')[0],
      reason,
      issuedBy: currentUser?.id || 'owner',
      issuedByName: currentUser?.name || 'Владелец',
      createdAt: new Date().toLocaleString('ru-RU', { hour12: false }),
      status: 'active',
    };

    setFines(prev => [newFine, ...prev]);

    // Deduct fine amount from chatter wallet balance
    setUsers(prev => prev.map(u => {
      if (u.id === chatterId) {
        return {
          ...u,
          walletBalance: Math.round((u.walletBalance - amount) * 100) / 100,
        };
      }
      return u;
    }));

    if (currentUser?.id === chatterId) {
      setCurrentUser(prev => prev ? { ...prev, walletBalance: prev.walletBalance - amount } : null);
    }

    addAudit(
      'Назначение штрафа',
      `Наложен штраф $${amount} USD на ${chatter.name}. Причина: ${reason}. Списано с баланса кошелька.`
    );
  };

  const waiveFine = (fineId: string) => {
    const targetFine = fines.find(f => f.id === fineId);
    if (!targetFine || targetFine.status === 'waived') return;

    setFines(prev => prev.map(f => f.id === fineId ? { ...f, status: 'waived' } : f));
    
    // Refund chatter wallet
    setUsers(prev => prev.map(u => {
      if (u.id === targetFine.chatterId) {
        return { ...u, walletBalance: u.walletBalance + targetFine.amount };
      }
      return u;
    }));

    addAudit('Аннулирование штрафа', `Штраф #${fineId} на сумму $${targetFine.amount} аннулирован. Средства возвращены.`);
  };

  // Bonus Actions
  const createBonusRule = (rule: Omit<BonusRule, 'id' | 'createdAt'>) => {
    const newRule: BonusRule = {
      ...rule,
      id: 'brule_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setBonusRules(prev => [...prev, newRule]);
    addAudit('Создание бонусного правила', `Владелец создал политику бонуса: "${rule.title}"`);
  };

  const requestBonus = (
    chatterId: string,
    title: string,
    type: 'fixed' | 'percentage',
    amount: number,
    basisAmount?: number,
    rate?: number
  ) => {
    const chatter = users.find(u => u.id === chatterId);
    if (!chatter) return;

    const newBonus: Bonus = {
      id: 'bonus_' + Date.now(),
      chatterId,
      chatterName: chatter.name,
      title,
      type,
      amount,
      basisAmount,
      rate,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toLocaleString('ru-RU', { hour12: false }),
    };

    setBonuses(prev => [newBonus, ...prev]);
    addAudit('Заявка на бонус', `Создана заявка на бонус: "${title}" ($${amount}) для ${chatter.name}`);
  };

  const approveBonus = (bonusId: string) => {
    const b = bonuses.find(x => x.id === bonusId);
    if (!b || b.status !== 'pending') return;

    setBonuses(prev => prev.map(item => {
      if (item.id === bonusId) {
        return {
          ...item,
          status: 'approved',
          decisionBy: currentUser?.name || 'Владелец',
          decisionAt: new Date().toLocaleString('ru-RU', { hour12: false }),
        };
      }
      return item;
    }));

    // Credit chatter wallet
    setUsers(prev => prev.map(u => {
      if (u.id === b.chatterId) {
        return { ...u, walletBalance: u.walletBalance + b.amount };
      }
      return u;
    }));

    addAudit(
      'Утверждение бонуса',
      `Владелец утвердил бонус $${b.amount} USD для ${b.chatterName}. Средства поступили в кошелек.`
    );
  };

  const rejectBonus = (bonusId: string) => {
    setBonuses(prev => prev.map(item => {
      if (item.id === bonusId) {
        return {
          ...item,
          status: 'rejected',
          decisionBy: currentUser?.name || 'Владелец',
          decisionAt: new Date().toLocaleString('ru-RU', { hour12: false }),
        };
      }
      return item;
    }));

    addAudit('Отклонение бонуса', `Бонус #${bonusId} был отклонен владельцем.`);
  };

  const updateSettings = (newSettings: OrganizationSettings) => {
    setSettings(newSettings);
    addAudit('Обновление настроек', 'Изменены глобальные настройки организации TULPAR');
  };

  const t = translations[lang];

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        currentUser,
        currentRole,
        users,
        shifts,
        fineCategories,
        fines,
        bonusRules,
        bonuses,
        auditLogs,
        settings,
        loginUser,
        logoutUser,
        switchDemoUser,
        startShift,
        endShift,
        closeUnclosedShift,
        createShift,
        updateShift,
        addSlot,
        updateUserCredentials,
        toggleUserStatus,
        updateUserTimezone,
        addFineCategory,
        issueFine,
        waiveFine,
        createBonusRule,
        requestBonus,
        approveBonus,
        rejectBonus,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
