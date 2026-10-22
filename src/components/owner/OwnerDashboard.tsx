import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Award,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Calendar,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { getCurrentTimeHHMM, SUPPORTED_TIMEZONES } from '../../utils/time';

export const OwnerDashboard: React.FC = () => {
  const {
    users,
    shifts,
    bonuses,
    fines,
    auditLogs,
    settings,
    approveBonus,
    rejectBonus,
    closeUnclosedShift,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [unclosedModalShiftId, setUnclosedModalShiftId] = useState<string | null>(null);
  const [unclosedGrossInput, setUnclosedGrossInput] = useState('200');
  const [unclosedReasonInput, setUnclosedReasonInput] = useState('Сотрудник забыл закрыть смену; закрыто владельцем по логам.');

  // Dynamic calculations from database state
  const totalEmployees = users.filter(u => u.role !== 'OWNER').length;
  const chattersOnShift = shifts.filter(s => s.status === 'IN_PROGRESS');
  const completedShifts = shifts.filter(s => s.status === 'COMPLETED');
  const unclosedShifts = shifts.filter(s => s.status === 'UNCLOSED');

  const totalGrossEarned = completedShifts.reduce((acc, s) => acc + (s.earnedGross || 0), 0);
  const totalPayouts = completedShifts.reduce((acc, s) => acc + (s.chatterPayout || 0), 0);
  const pendingBonuses = bonuses.filter(b => b.status === 'pending');
  const totalFinesUSD = fines.filter(f => f.status === 'active').reduce((acc, f) => acc + f.amount, 0);

  const orgTz = settings.baseTimezone || 'Asia/Almaty';
  const orgTzCity = SUPPORTED_TIMEZONES.find(x => x.value === orgTz)?.city || 'Алматы';

  // Active shifts right now
  const liveShifts = shifts.filter(s => s.status === 'IN_PROGRESS' || s.status === 'UNCLOSED');

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unclosedModalShiftId) return;
    const grossVal = parseFloat(unclosedGrossInput) || 0;
    closeUnclosedShift(unclosedModalShiftId, grossVal, unclosedReasonInput);
    setUnclosedModalShiftId(null);
  };

  return (
    <div className="space-y-6">

      {/* Top Welcome & KPI Header */}
      <div className="glass-card-gold rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black text-white font-brand-logo">
                TULPAR COMMAND CENTER
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                OWNER: Emir2026
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Единый центр аналитики, финансовых потоков USD, дисциплины и контроля смен
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Главный офис ({orgTzCity}):</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {getCurrentTimeHHMM(orgTz)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Unclosed Shifts Alert Notification */}
      {unclosedShifts.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/15 border-2 border-red-500/40 text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-red-300">
                {t.unclosedAlertTitle} ({unclosedShifts.length})
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {t.unclosedAlertDesc}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {unclosedShifts.map(s => (
              <button
                key={s.id}
                onClick={() => setUnclosedModalShiftId(s.id)}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs transition"
              >
                Закрыть вручную ({s.chatterName})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 8 Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.totalStaff}</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">
            {totalEmployees}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Чаттеры и Тимлиды в ячейках
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-emerald-500/30">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
            <span>{t.staffOnShift}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-1">
            {chattersOnShift.length}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            Работают прямо сейчас
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.completedShifts}</span>
            <CheckCircle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">
            {completedShifts.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Успешно закрытых смен
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-amber-500/30">
          <div className="flex items-center justify-between text-xs text-amber-400 font-medium">
            <span>{t.totalGrossEarned}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-1">
            ${totalGrossEarned.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">
            Суммарная касса агентства
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>{t.totalChatterPayouts}</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-blue-300 mt-1">
            ${totalPayouts.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Базовые 25% комиссии сотрудников
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Чистая прибыль (Net)</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
            ${(totalGrossEarned - totalPayouts).toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            Доля организации (75%)
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-yellow-500/30">
          <div className="flex items-center justify-between text-xs text-yellow-400 font-medium">
            <span>{t.pendingBonuses}</span>
            <Award className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-yellow-300 mt-1">
            {pendingBonuses.length}
          </div>
          <div className="text-[10px] text-yellow-400/80 mt-1">
            Требуют решения Владельца
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border-red-500/30">
          <div className="flex items-center justify-between text-xs text-red-400 font-medium">
            <span>{t.totalFinesIssued}</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold font-mono text-red-300 mt-1">
            ${totalFinesUSD.toFixed(2)}
          </div>
          <div className="text-[10px] text-red-400/80 mt-1">
            Удержано за дисциплину
          </div>
        </div>

      </div>

      {/* Visual Analytics Chart Simulation: Velocity & Performance */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Динамика кассы и выплат (USD $)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Соотношение валового дохода (Gross) и выплат чаттерам (25% Net)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
              ● Gross Касса
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
              ● Выплаты 25%
            </span>
          </div>
        </div>

        {/* Visual Bar Graph */}
        <div className="space-y-4">
          {[
            { day: 'Пн', gross: 280, payout: 70, shifts: 3 },
            { day: 'Вт', gross: 450, payout: 112.5, shifts: 4 },
            { day: 'Ср', gross: 390, payout: 97.5, shifts: 3 },
            { day: 'Чт', gross: 520, payout: 130, shifts: 5 },
            { day: 'Пт', gross: 610, payout: 152.5, shifts: 6 },
            { day: 'Сб', gross: 780, payout: 195, shifts: 6 },
            { day: 'Вс (Сегодня)', gross: totalGrossEarned > 0 ? totalGrossEarned : 350, payout: totalPayouts > 0 ? totalPayouts : 87.5, shifts: 4 },
          ].map((bar, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 font-sans">{bar.day}</span>
                <span className="text-slate-400">
                  Gross: <strong className="text-amber-300">${bar.gross}</strong> | Выплата:{' '}
                  <strong className="text-blue-300">${bar.payout}</strong>
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-600 rounded-l-full"
                  style={{ width: `${Math.min(100, (bar.gross / 800) * 100)}%` }}
                />
                <div
                  className="h-full bg-blue-500/60"
                  style={{ width: `${Math.min(100, (bar.payout / 800) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Active Shifts Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {t.activeShiftsLive}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Сейчас на линии: {chattersOnShift.length}
          </span>
        </div>

        {liveShifts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            В данный момент нет активных смен
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Чаттер</th>
                  <th className="pb-3">Смена</th>
                  <th className="pb-3">Часовой пояс</th>
                  <th className="pb-3">Факт. вход</th>
                  <th className="pb-3">Касса на старте</th>
                  <th className="pb-3">Опоздание</th>
                  <th className="pb-3">Статус</th>
                  <th className="pb-3 text-right pr-2">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {liveShifts.map(s => (
                  <tr key={s.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 pl-2 font-sans font-bold text-white">
                      {s.chatterName}
                    </td>
                    <td className="py-3 text-slate-300">
                      {s.plannedStart} - {s.plannedEnd}
                    </td>
                    <td className="py-3 text-slate-400 font-sans">
                      {s.chatterTimezone}
                    </td>
                    <td className="py-3 text-amber-300 font-bold">
                      {s.actualStart || '—'}
                    </td>
                    <td className="py-3 text-slate-300">
                      {s.startGross !== undefined ? `$${s.startGross}` : '—'}
                    </td>
                    <td className="py-3">
                      {s.lateMinutes ? (
                        <span className="text-red-400 font-bold">+{s.lateMinutes} мин</span>
                      ) : (
                        <span className="text-emerald-400">Вовремя</span>
                      )}
                    </td>
                    <td className="py-3 font-sans">
                      {s.status === 'IN_PROGRESS' && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          ● На смене
                        </span>
                      )}
                      {s.status === 'UNCLOSED' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 text-[10px] font-bold">
                          Не закрыта
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => setUnclosedModalShiftId(s.id)}
                        className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white text-[11px] transition"
                      >
                        Управление
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Bonuses Section for Owner Approval */}
      {pendingBonuses.length > 0 && (
        <div className="glass-card-gold rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Бонусы, ожидающие вашего утверждения ({pendingBonuses.length})
              </h3>
            </div>
            <span className="text-xs text-amber-300/80">
              Только Владелец может подтвердить выплату
            </span>
          </div>

          <div className="space-y-3">
            {pendingBonuses.map(b => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{b.chatterName}</span>
                    <span className="text-xs text-amber-400 font-mono font-bold">
                      +${b.amount} USD
                    </span>
                    {b.rate && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                        {b.rate}% от ${b.basisAmount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{b.title}</p>
                  {b.comment && (
                    <p className="text-[11px] text-slate-500 italic mt-0.5">"{b.comment}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveBonus(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 transition shadow-lg shadow-emerald-500/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Утвердить</span>
                  </button>
                  <button
                    onClick={() => rejectBonus(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Отклонить</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>{t.recentActivity}</span>
        </h3>

        <div className="space-y-2.5">
          {auditLogs.slice(0, 6).map(log => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {log.userName} ({log.userRole})
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Close Shift Modal */}
      {unclosedModalShiftId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCloseShiftSubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Принудительное закрытие смены</h3>
                <p className="text-xs text-slate-400">Фиксация кассы выхода и аудит-причины</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Финальная касса выхода (USD $)
              </label>
              <input
                type="number"
                value={unclosedGrossInput}
                onChange={e => setUnclosedGrossInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Официальная причина закрытия (для журнала)
              </label>
              <textarea
                value={unclosedReasonInput}
                onChange={e => setUnclosedReasonInput(e.target.value)}
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Закрыть и рассчитать
              </button>
              <button
                type="button"
                onClick={() => setUnclosedModalShiftId(null)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
