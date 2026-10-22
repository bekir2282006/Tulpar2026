import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Search,
  Filter,
  Clock,
  User,
  Activity,
  Lock,
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.timestamp.includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <span>{t.auditTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.auditSubtitle}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск по действию или автору..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Время операции</th>
                <th className="pb-3">Инициатор</th>
                <th className="pb-3">Действие</th>
                <th className="pb-3">Детали и параметры</th>
                <th className="pb-3 text-right pr-2">Статус проверки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-neutral-800/30 transition">
                  <td className="py-3 pl-2 text-slate-400">
                    {log.timestamp}
                  </td>
                  <td className="py-3 font-sans">
                    <div className="font-bold text-white">{log.userName}</div>
                    <span className="text-[10px] text-amber-400 font-mono">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 text-amber-300 font-semibold font-sans">
                    {log.action}
                  </td>
                  <td className="py-3 text-slate-300 font-sans max-w-md">
                    {log.details}
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-mono border border-emerald-500/25">
                      ✓ Зафиксировано
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
