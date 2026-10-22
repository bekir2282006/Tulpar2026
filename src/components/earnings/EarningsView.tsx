import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Calendar,
  Filter,
  CheckCircle,
  Percent,
  Plus,
} from 'lucide-react';
import { SUPPORTED_TIMEZONES } from '../../utils/time';

export const EarningsView: React.FC = () => {
  const {
    currentUser,
    shifts,
    users,
    bonuses,
    fines,
    settings,
    t,
  } = useApp();

  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Role permissions
  const isOwner = currentUser?.role === 'OWNER';
  const isTeamLead = currentUser?.role === 'TEAM_LEAD';

  const visibleShifts = shifts.filter(s => {
    if (isOwner) return true;
    if (isTeamLead) {
      const myAssignedChatters = users.filter(u => u.teamLeadId === currentUser.id).map(u => u.id);
      return myAssignedChatters.includes(s.chatterId);
    }
    return s.chatterId === currentUser?.id;
  });

  const completedShifts = visibleShifts.filter(s => s.status === 'COMPLETED');
  const totalGross = completedShifts.reduce((acc, s) => acc + (s.earnedGross || 0), 0);
  const totalPayout = completedShifts.reduce((acc, s) => acc + (s.chatterPayout || 0), 0);

  // Bonus total
  const visibleBonuses = bonuses.filter(b => {
    if (isOwner) return true;
    if (isTeamLead) {
      const myIds = users.filter(u => u.teamLeadId === currentUser.id).map(u => u.id);
      return myIds.includes(b.chatterId);
    }
    return b.chatterId === currentUser?.id;
  });
  const totalApprovedBonuses = visibleBonuses.filter(b => b.status === 'approved').reduce((acc, b) => acc + b.amount, 0);

  // Fines total
  const visibleFines = fines.filter(f => {
    if (isOwner) return true;
    if (isTeamLead) {
      const myIds = users.filter(u => u.teamLeadId === currentUser.id).map(u => u.id);
      return myIds.includes(f.chatterId);
    }
    return f.chatterId === currentUser?.id;
  });
  const totalFines = visibleFines.filter(f => f.status === 'active').reduce((acc, f) => acc + f.amount, 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span>{t.nav_earnings}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Финансовый учёт кассы (Gross), выплат комиссий (Net) и прозрачные кошельки
          </p>
        </div>

        {/* Currency badge */}
        <div className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-amber-300 font-mono flex items-center gap-1.5 self-start">
          <span>Основная валюта:</span>
          <strong className="text-white">USD ($)</strong>
        </div>
      </div>

      {/* Primary Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border-amber-500/30">
          <div className="text-xs text-amber-400 font-medium">Общая касса (Gross)</div>
          <div className="text-2xl font-extrabold font-mono text-amber-300 mt-1">
            ${totalGross.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Оборот моделей на сменах</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-blue-500/30">
          <div className="text-xs text-blue-400 font-medium">Выплаты чаттерам (25% Net)</div>
          <div className="text-2xl font-extrabold font-mono text-blue-300 mt-1">
            ${totalPayout.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Зачислено в кошельки</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-medium">Начисленные бонусы</div>
          <div className="text-2xl font-extrabold font-mono text-emerald-300 mt-1">
            +${totalApprovedBonuses.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Утверждено Владельцем</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-red-500/30">
          <div className="text-xs text-red-400 font-medium">Удержания (Штрафы)</div>
          <div className="text-2xl font-extrabold font-mono text-red-300 mt-1">
            -${totalFines.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Дисциплинарные вычеты</div>
        </div>
      </div>

      {/* Financial Statement Breakdown Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>Реестр начислений и финансовой кассы</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {completedShifts.length} завершенных операций
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Сотрудник</th>
                <th className="pb-3">Дата смены</th>
                <th className="pb-3">Касса входа</th>
                <th className="pb-3">Касса выхода</th>
                <th className="pb-3">Заработано (Gross)</th>
                <th className="pb-3">Комиссия</th>
                <th className="pb-3">Итоговая выплата (Net)</th>
                <th className="pb-3">Статус начисления</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {completedShifts.map(s => (
                <tr key={s.id} className="hover:bg-neutral-800/30 transition">
                  <td className="py-3 pl-2 font-sans font-bold text-white">
                    {s.chatterName}
                  </td>
                  <td className="py-3 text-slate-300">{s.date}</td>
                  <td className="py-3 text-slate-300">${s.startGross || 0}</td>
                  <td className="py-3 text-slate-300">${s.endGross || 0}</td>
                  <td className="py-3 font-bold text-white">${s.earnedGross || 0}</td>
                  <td className="py-3 text-amber-400/90">{s.commissionPercent || 25}%</td>
                  <td className="py-3 font-extrabold text-amber-300 text-sm">
                    ${(s.chatterPayout || 0).toFixed(2)} USD
                  </td>
                  <td className="py-3 font-sans">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      ✓ В кошельке
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
