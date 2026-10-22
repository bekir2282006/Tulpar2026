import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Plus,
  Send,
} from 'lucide-react';
import { convertTimeBetweenZones, getCurrentTimeHHMM, SUPPORTED_TIMEZONES } from '../../utils/time';

export const TeamLeadDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    shifts,
    settings,
    issueFine,
    requestBonus,
    fineCategories,
    t,
  } = useApp();

  const [fineModalOpen, setFineModalOpen] = useState(false);
  const [bonusModalOpen, setBonusModalOpen] = useState(false);
  const [selectedChatterId, setSelectedChatterId] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [fineAmountInput, setFineAmountInput] = useState('20');
  const [fineReasonInput, setFineReasonInput] = useState('');

  const [bonusTitleInput, setBonusTitleInput] = useState('');
  const [bonusAmountInput, setBonusAmountInput] = useState('25');

  // Filter ONLY chatters assigned to this Team Lead
  const assignedChatters = users.filter(
    u => u.role === 'CHATTER' && u.teamLeadId === currentUser?.id
  );

  const assignedChatterIds = assignedChatters.map(u => u.id);

  // Filter shifts of assigned chatters
  const teamShifts = shifts.filter(s => assignedChatterIds.includes(s.chatterId));
  const activeNowShifts = teamShifts.filter(s => s.status === 'IN_PROGRESS');
  const lateShifts = teamShifts.filter(s => (s.lateMinutes || 0) > 0);

  const permissions = settings.teamLeadPermissions;
  const orgTz = settings.baseTimezone || 'Asia/Almaty';

  const handleIssueFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatterId || !selectedCatId) return;
    const amount = parseFloat(fineAmountInput) || 20;
    issueFine(selectedChatterId, selectedCatId, amount, fineReasonInput || 'Дисциплинарное взыскание от Тимлида');
    setFineModalOpen(false);
    setFineReasonInput('');
  };

  const handleRequestBonus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatterId || !bonusTitleInput) return;
    const amount = parseFloat(bonusAmountInput) || 25;
    requestBonus(selectedChatterId, bonusTitleInput, 'fixed', amount);
    setBonusModalOpen(false);
    setBonusTitleInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* Team Lead Profile Banner */}
      <div className="glass-card-gold rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-14 h-14 rounded-2xl object-cover border border-amber-500/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{currentUser?.name}</h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  {t.role_TEAM_LEAD} (СЛОТ #{currentUser?.slotNumber || 1})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Контроль закреплённой группы • Подчинённых чаттеров:{' '}
                <strong className="text-amber-300 font-mono">{assignedChatters.length}</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {permissions.canAssignFines && (
              <button
                onClick={() => setFineModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-xs font-semibold text-red-300 transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Зафиксировать штраф</span>
              </button>
            )}
            <button
              onClick={() => setBonusModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-xs font-semibold text-amber-300 transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Заявка на бонус</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards for Assigned Team */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Закреплено сотрудников</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {assignedChatters.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">В вашей юрисдикции</div>
        </div>

        <div className="glass-card p-4 rounded-xl border-emerald-500/30">
          <div className="text-xs text-emerald-400 font-medium">Сейчас на смене</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            {activeNowShifts.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Онлайн операторов</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-amber-400 font-medium">Зафиксировано опозданий</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            {lateShifts.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Требуют внимания</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Касса команды (Gross)</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ${teamShifts.reduce((acc, s) => acc + (s.earnedGross || 0), 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Завершенные смены</div>
        </div>
      </div>

      {/* Assigned Chatters Live Roster Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            <span>Моя назначенная команда</span>
          </h3>
          <span className="text-xs text-slate-400">
            Изолированный доступ к данным
          </span>
        </div>

        {assignedChatters.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Владелец пока не закрепил за вами чаттеров. Обратитесь к Emir2026.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedChatters.map(c => {
              const activeShift = shifts.find(
                s => s.chatterId === c.id && (s.status === 'IN_PROGRESS' || s.status === 'PENDING')
              );
              const cTzName = SUPPORTED_TIMEZONES.find(x => x.value === c.timezone)?.city || c.timezone;
              return (
                <div key={c.id} className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.avatar}
                        alt={c.name}
                        className="w-10 h-10 rounded-xl object-cover border border-amber-500/20"
                      />
                      <div>
                        <div className="font-bold text-sm text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Логин: <span className="text-amber-300">{c.login}</span> • Слот #{c.slotNumber}
                        </div>
                      </div>
                    </div>
                    <div>
                      {activeShift?.status === 'IN_PROGRESS' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          ● Онлайн
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 text-[10px]">
                          Офлайн
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-neutral-800 font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Часовой пояс</span>
                      <span className="text-slate-300">{cTzName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block font-sans">Ставка %</span>
                      <span className="text-amber-300">{c.commissionPercent}%</span>
                    </div>
                  </div>

                  {/* Active or Next Shift block */}
                  {activeShift && (
                    <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Смена сегодня:</span>
                        <span className="font-mono text-white">
                          {activeShift.plannedStart} - {activeShift.plannedEnd} (HQ)
                        </span>
                      </div>
                      <div className="flex justify-between text-amber-300/90 font-mono mt-0.5">
                        <span>У сотрудника ({cTzName}):</span>
                        <span>
                          {convertTimeBetweenZones(activeShift.plannedStart, orgTz, c.timezone)} -{' '}
                          {convertTimeBetweenZones(activeShift.plannedEnd, orgTz, c.timezone)}
                        </span>
                      </div>
                      {activeShift.actualStart && (
                        <div className="text-[10px] text-emerald-400 mt-1">
                          Фактический вход: {activeShift.actualStart} (Касса ${activeShift.startGross})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assigned Team Shifts History */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Смены моей команды</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Сотрудник</th>
                <th className="pb-3">Дата</th>
                <th className="pb-3">План (HQ)</th>
                <th className="pb-3">Факт. вход / выход</th>
                <th className="pb-3">Касса</th>
                <th className="pb-3">Опоздание</th>
                <th className="pb-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {teamShifts.map(s => (
                <tr key={s.id} className="hover:bg-neutral-800/30 transition">
                  <td className="py-3 pl-2 font-sans font-semibold text-white">
                    {s.chatterName}
                  </td>
                  <td className="py-3 text-slate-300">{s.date}</td>
                  <td className="py-3 text-slate-300">
                    {s.plannedStart} - {s.plannedEnd}
                  </td>
                  <td className="py-3 text-slate-200">
                    {s.actualStart ? `${s.actualStart} → ${s.actualEnd || '...'}` : '—'}
                  </td>
                  <td className="py-3 text-amber-300">
                    {s.earnedGross !== undefined ? `$${s.earnedGross}` : '—'}
                  </td>
                  <td className="py-3">
                    {s.lateMinutes ? (
                      <span className="text-red-400 font-bold">+{s.lateMinutes} мин</span>
                    ) : s.actualStart ? (
                      <span className="text-emerald-400">Вовремя</span>
                    ) : (
                      '—'
                    )}
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Lead Issue Fine Modal */}
      {fineModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleIssueFine}
            className="w-full max-w-md bg-[#12151e] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Дисциплинарный штраф</h3>
                <p className="text-xs text-slate-400">Назначение штрафа сотруднику вашей группы</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Выберите чаттера
              </label>
              <select
                value={selectedChatterId}
                onChange={e => setSelectedChatterId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                required
              >
                <option value="">-- Выберите чаттера --</option>
                {assignedChatters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.login})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Вид нарушения / штрафа
              </label>
              <select
                value={selectedCatId}
                onChange={e => {
                  setSelectedCatId(e.target.value);
                  const cat = fineCategories.find(c => c.id === e.target.value);
                  if (cat) setFineAmountInput(cat.defaultAmount.toString());
                }}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                required
              >
                <option value="">-- Выберите вид штрафа --</option>
                {fineCategories.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameRu} (Стандарт: ${c.defaultAmount})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Сумма штрафа в USD ($)
              </label>
              <input
                type="number"
                value={fineAmountInput}
                onChange={e => setFineAmountInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Обоснование / комментарий
              </label>
              <textarea
                value={fineReasonInput}
                onChange={e => setFineReasonInput(e.target.value)}
                placeholder="Опоздание на 14 минут, не предупредил команду..."
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition"
              >
                Назначить штраф
              </button>
              <button
                type="button"
                onClick={() => setFineModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Lead Request Bonus Modal */}
      {bonusModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleRequestBonus}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Заявка на поощрение</h3>
                <p className="text-xs text-slate-400">Направляется на подтверждение Владельцу</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Выберите чаттера
              </label>
              <select
                value={selectedChatterId}
                onChange={e => setSelectedChatterId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              >
                <option value="">-- Выберите чаттера --</option>
                {assignedChatters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.login})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Причина / Описание бонуса
              </label>
              <input
                type="text"
                value={bonusTitleInput}
                onChange={e => setBonusTitleInput(e.target.value)}
                placeholder="Премия за высокий средний чек смены"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Сумма бонуса в USD ($)
              </label>
              <input
                type="number"
                value={bonusAmountInput}
                onChange={e => setBonusAmountInput(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Отправить Владельцу
              </button>
              <button
                type="button"
                onClick={() => setBonusModalOpen(false)}
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
