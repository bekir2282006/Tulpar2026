import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Plus,
  User,
  Globe,
  Filter,
  CheckCircle,
  AlertTriangle,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  convertTimeBetweenZones,
  getCurrentTimeHHMM,
  SUPPORTED_TIMEZONES,
  formatCurrentDate,
} from '../../utils/time';

export const ScheduleView: React.FC = () => {
  const {
    currentUser,
    users,
    shifts,
    createShift,
    updateShift,
    settings,
    t,
    lang,
  } = useApp();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedChatterId, setSelectedChatterId] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);
  const [shiftTitle, setShiftTitle] = useState('Смена День (Day)');
  const [plannedStartOrg, setPlannedStartOrg] = useState('10:00');
  const [plannedEndOrg, setPlannedEndOrg] = useState('18:00');
  const [shiftNote, setShiftNote] = useState('');

  const chatters = users.filter(u => u.role === 'CHATTER');
  const orgTz = settings.baseTimezone || 'Asia/Almaty';
  const orgTzCity = SUPPORTED_TIMEZONES.find(x => x.value === orgTz)?.city || 'Офис';

  // Preview chatter timezone conversion
  const targetChatter = chatters.find(c => c.id === selectedChatterId);
  const chatterTz = targetChatter?.timezone || 'Asia/Manila';
  const chatterCity = SUPPORTED_TIMEZONES.find(x => x.value === chatterTz)?.city || chatterTz;
  const localPreviewStart = convertTimeBetweenZones(plannedStartOrg, orgTz, chatterTz);
  const localPreviewEnd = convertTimeBetweenZones(plannedEndOrg, orgTz, chatterTz);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatterId) return;
    const chatter = chatters.find(c => c.id === selectedChatterId);
    if (!chatter) return;

    createShift({
      chatterId: chatter.id,
      chatterName: chatter.name,
      date: shiftDate,
      title: shiftTitle,
      plannedStart: plannedStartOrg,
      plannedEnd: plannedEndOrg,
      orgTimezone: orgTz,
      chatterTimezone: chatter.timezone,
      note: shiftNote || undefined,
    });

    setCreateModalOpen(false);
    setShiftNote('');
  };

  // Only show permitted shifts based on role
  const visibleShifts = shifts.filter(s => {
    if (currentUser?.role === 'OWNER') return true;
    if (currentUser?.role === 'TEAM_LEAD') {
      const myAssignedChatters = users
        .filter(u => u.teamLeadId === currentUser.id)
        .map(u => u.id);
      return myAssignedChatters.includes(s.chatterId);
    }
    // Chatter
    return s.chatterId === currentUser?.id;
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>{t.scheduleTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.scheduleSubtitle}
          </p>
        </div>

        {currentUser?.role !== 'CHATTER' && (
          <button
            onClick={() => {
              setSelectedChatterId(chatters[0]?.id || '');
              setCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] text-xs font-bold uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            <span>{t.createShiftModal}</span>
          </button>
        )}
      </div>

      {/* Schedule Info Box */}
      <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-400" />
          <span>
            Главный часовой пояс офиса: <strong className="text-amber-300 font-mono">{orgTz} ({orgTzCity})</strong>
          </span>
        </div>
        <div className="text-[11px] text-slate-400 hidden sm:block">
          Время пересчитывается индивидуально для каждого чаттера (Филиппины, Украина, Казахстан)
        </div>
      </div>

      {/* Shifts Grid by date */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleShifts.map(s => {
          const chatter = users.find(u => u.id === s.chatterId);
          const cTz = chatter?.timezone || s.chatterTimezone || 'Asia/Manila';
          const cCity = SUPPORTED_TIMEZONES.find(x => x.value === cTz)?.city || cTz;
          const startLocal = convertTimeBetweenZones(s.plannedStart, orgTz, cTz);
          const endLocal = convertTimeBetweenZones(s.plannedEnd, orgTz, cTz);

          return (
            <div
              key={s.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                s.status === 'IN_PROGRESS'
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : s.status === 'UNCLOSED'
                  ? 'border-red-500/40 bg-red-500/5'
                  : 'border-neutral-800 hover:border-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-200">{s.date}</span>
                {s.status === 'IN_PROGRESS' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    ● На смене
                  </span>
                )}
                {s.status === 'PENDING' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 font-semibold">
                    Ожидание
                  </span>
                )}
                {s.status === 'COMPLETED' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-semibold">
                    Завершена
                  </span>
                )}
                {s.status === 'UNCLOSED' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold">
                    Не закрыта
                  </span>
                )}
              </div>

              <div className="mb-3">
                <div className="text-sm font-bold text-white">{s.chatterName}</div>
                <div className="text-[11px] text-amber-400/90 font-mono">{s.title || 'Рабочая смена'}</div>
              </div>

              {/* Time comparison box */}
              <div className="space-y-2 p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans text-[11px]">Офис HQ ({orgTzCity}):</span>
                  <span className="text-slate-200 font-bold">{s.plannedStart} — {s.plannedEnd}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-neutral-800/80 text-amber-300">
                  <span className="text-amber-400/80 font-sans text-[11px]">У сотрудника ({cCity}):</span>
                  <span className="font-bold">{startLocal} — {endLocal}</span>
                </div>
                {s.actualStart && (
                  <div className="flex justify-between pt-1 border-t border-neutral-800/80 text-[11px]">
                    <span className="text-slate-400 font-sans">Факт:</span>
                    <span className="text-emerald-400">
                      {s.actualStart} → {s.actualEnd || '...'}
                    </span>
                  </div>
                )}
              </div>

              {s.note && (
                <p className="text-[11px] text-slate-400 italic mt-3 truncate">
                  "{s.note}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* CREATE SHIFT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.createShiftModal}</h3>
                <p className="text-xs text-slate-400">Назначение графика с контролем часовых поясов</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Выберите сотрудника (Чаттера)
              </label>
              <select
                value={selectedChatterId}
                onChange={e => setSelectedChatterId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              >
                {chatters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.timezone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Дата смены
                </label>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={e => setShiftDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Название смены
                </label>
                <input
                  type="text"
                  value={shiftTitle}
                  onChange={e => setShiftTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Время начала (Офис HQ)
                </label>
                <input
                  type="text"
                  value={plannedStartOrg}
                  onChange={e => setPlannedStartOrg(e.target.value)}
                  placeholder="10:00"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Время окончания (Офис HQ)
                </label>
                <input
                  type="text"
                  value={plannedEndOrg}
                  onChange={e => setPlannedEndOrg(e.target.value)}
                  placeholder="18:00"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {/* Instant timezone preview banner */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-600/10 border border-amber-500/30 text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold mb-1">
                <Clock className="w-4 h-4" />
                <span>Автоматический пересчёт времени сотрудника:</span>
              </div>
              <div className="font-mono text-white text-sm font-bold">
                {localPreviewStart} — {localPreviewEnd} ({chatterCity}, {chatterTz})
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Сотрудник увидит именно это местное время в блоке «МОЯ СМЕНА» и не запутается.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Примечание (опционально)
              </label>
              <textarea
                value={shiftNote}
                onChange={e => setShiftNote(e.target.value)}
                placeholder="Основная дневная смена..."
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Назначить смену
              </button>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
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
