import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Calendar,
  Filter,
  DollarSign,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { convertTimeBetweenZones, SUPPORTED_TIMEZONES } from '../../utils/time';

export const ShiftHistoryView: React.FC = () => {
  const {
    currentUser,
    shifts,
    users,
    settings,
    t,
  } = useApp();

  const [filterEmployee, setFilterEmployee] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const orgTz = settings.baseTimezone || 'Asia/Almaty';

  // Role isolation
  const permittedShifts = shifts.filter(s => {
    if (currentUser?.role === 'OWNER') return true;
    if (currentUser?.role === 'TEAM_LEAD') {
      const assignedIds = users.filter(u => u.teamLeadId === currentUser.id).map(u => u.id);
      return assignedIds.includes(s.chatterId);
    }
    return s.chatterId === currentUser?.id;
  });

  const filteredShifts = permittedShifts.filter(s => {
    if (filterEmployee !== 'ALL' && s.chatterId !== filterEmployee) return false;
    if (filterStatus !== 'ALL' && s.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.chatterName.toLowerCase().includes(q) ||
        (s.note && s.note.toLowerCase().includes(q)) ||
        s.date.includes(q)
      );
    }
    return true;
  });

  const chattersList = users.filter(u => {
    if (currentUser?.role === 'OWNER') return u.role === 'CHATTER';
    if (currentUser?.role === 'TEAM_LEAD') return u.teamLeadId === currentUser.id;
    return u.id === currentUser?.id;
  });

  // Calculate totals
  const totalGross = filteredShifts.reduce((acc, s) => acc + (s.earnedGross || 0), 0);
  const totalPayout = filteredShifts.reduce((acc, s) => acc + (s.chatterPayout || 0), 0);

  const handleExportCSV = () => {
    const headers = ['Date', 'Employee', 'Planned Start', 'Planned End', 'Actual Start', 'Actual End', 'Gross In', 'Gross Out', 'Gross Earned', 'Payout USD', 'Status'];
    const rows = filteredShifts.map(s => [
      s.date,
      `"${s.chatterName}"`,
      s.plannedStart,
      s.plannedEnd,
      s.actualStart || '',
      s.actualEnd || '',
      s.startGross || 0,
      s.endGross || 0,
      s.earnedGross || 0,
      s.chatterPayout || 0,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TULPAR_shifts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>{t.historyTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.historySubtitle}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-amber-300 font-semibold flex items-center gap-2 transition self-start"
        >
          <Download className="w-4 h-4" />
          <span>Экспорт в CSV</span>
        </button>
      </div>

      {/* Aggregated Quick Metrics for Selected Filter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400">Смен в выборке</div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {filteredShifts.length}
          </div>
        </div>
        <div className="p-3.5 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400">Касса Gross (Объем)</div>
          <div className="text-lg font-bold font-mono text-amber-300 mt-1">
            ${totalGross.toFixed(2)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400">Выплаты чаттерам (Net)</div>
          <div className="text-lg font-bold font-mono text-blue-300 mt-1">
            ${totalPayout.toFixed(2)}
          </div>
        </div>
        <div className="p-3.5 rounded-xl glass-card">
          <div className="text-[11px] text-slate-400">Опозданий зафиксировано</div>
          <div className="text-lg font-bold font-mono text-red-300 mt-1">
            {filteredShifts.filter(s => (s.lateMinutes || 0) > 0).length}
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {currentUser?.role !== 'CHATTER' && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Сотрудник:</span>
              <select
                value={filterEmployee}
                onChange={e => setFilterEmployee(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">Все сотрудники</option>
                {chattersList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Статус:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Все статусы</option>
              <option value="COMPLETED">Завершена</option>
              <option value="IN_PROGRESS">На смене</option>
              <option value="PENDING">Ожидание</option>
              <option value="UNCLOSED">Не закрыта</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по дате или имени..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
        </div>
      </div>

      {/* Table of Shifts */}
      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Сотрудник</th>
                <th className="pb-3">Дата</th>
                <th className="pb-3">План (HQ)</th>
                <th className="pb-3">Факт. вход / выход</th>
                <th className="pb-3">Опоздание</th>
                <th className="pb-3">Касса вх → вых</th>
                <th className="pb-3">Gross</th>
                <th className="pb-3">Выплата (25%)</th>
                <th className="pb-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredShifts.map(s => {
                const chatter = users.find(u => u.id === s.chatterId);
                const cTz = chatter?.timezone || s.chatterTimezone || 'Asia/Manila';
                const cCity = SUPPORTED_TIMEZONES.find(t => t.value === cTz)?.city || cTz;

                return (
                  <tr key={s.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 pl-2 font-sans font-bold text-white">
                      <div>{s.chatterName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{cCity}</div>
                    </td>
                    <td className="py-3 text-slate-300">{s.date}</td>
                    <td className="py-3 text-slate-300">
                      {s.plannedStart} - {s.plannedEnd}
                    </td>
                    <td className="py-3 text-slate-200">
                      {s.actualStart ? `${s.actualStart} → ${s.actualEnd || '...'}` : '—'}
                    </td>
                    <td className="py-3">
                      {s.lateMinutes ? (
                        <span className="text-red-400 font-bold">+{s.lateMinutes} мин</span>
                      ) : s.actualStart ? (
                        <span className="text-emerald-400">0 мин</span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 text-slate-300">
                      {s.startGross !== undefined ? `$${s.startGross}` : '—'} → {s.endGross !== undefined ? `$${s.endGross}` : '—'}
                    </td>
                    <td className="py-3 font-bold text-white">
                      {s.earnedGross !== undefined ? `$${s.earnedGross}` : '—'}
                    </td>
                    <td className="py-3 font-bold text-amber-300">
                      {s.chatterPayout !== undefined ? `$${s.chatterPayout.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-3 font-sans">
                      {s.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                          Завершена
                        </span>
                      )}
                      {s.status === 'IN_PROGRESS' && (
                        <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px] font-bold">
                          На смене
                        </span>
                      )}
                      {s.status === 'PENDING' && (
                        <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-[10px]">
                          Ожидает
                        </span>
                      )}
                      {s.status === 'UNCLOSED' && (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                          Не закрыта
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
