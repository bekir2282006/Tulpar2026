import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Play,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  Calendar,
  Wallet,
  TrendingUp,
  Percent,
  Sparkles,
  Award,
  ShieldAlert,
  ArrowRight,
  Globe,
  Info,
} from 'lucide-react';
import {
  convertTimeBetweenZones,
  getCurrentTimeHHMM,
  formatCurrentDate,
  SUPPORTED_TIMEZONES,
} from '../../utils/time';

export const ChatterDashboard: React.FC = () => {
  const {
    currentUser,
    shifts,
    startShift,
    endShift,
    bonuses,
    fines,
    settings,
    t,
    lang,
  } = useApp();

  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [startRegisterInput, setStartRegisterInput] = useState<string>('230');
  const [endRegisterInput, setEndRegisterInput] = useState<string>('350');
  const [shiftNote, setShiftNote] = useState('');
  const [completedSuccessToast, setCompletedSuccessToast] = useState<string | null>(null);

  // Live timer for active shift
  const [liveElapsed, setLiveElapsed] = useState<string>('00:00:00');

  // Find today's shift for this chatter
  const todayStr = new Date().toISOString().split('T')[0];
  const myShifts = shifts.filter(s => s.chatterId === currentUser?.id);
  const currentActiveOrTodayShift = myShifts.find(
    s => s.status === 'IN_PROGRESS' || s.date === todayStr
  ) || myShifts[0];

  const chatterTz = currentUser?.timezone || 'Asia/Manila';
  const orgTz = settings.baseTimezone || 'Asia/Almaty';
  const chatterTzName = SUPPORTED_TIMEZONES.find(x => x.value === chatterTz)?.city || 'Ваш город';
  const orgTzName = SUPPORTED_TIMEZONES.find(x => x.value === orgTz)?.city || 'Офис HQ';

  // Live elapsed counter if in progress
  useEffect(() => {
    if (currentActiveOrTodayShift?.status !== 'IN_PROGRESS' || !currentActiveOrTodayShift.actualStart) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const [h, m] = currentActiveOrTodayShift.actualStart!.split(':').map(Number);
      const start = new Date();
      start.setHours(h, m, 0, 0);

      const diffMs = Math.max(0, now.getTime() - start.getTime());
      const hours = Math.floor(diffMs / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, '0');
      setLiveElapsed(`${hours}:${mins}:${secs}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentActiveOrTodayShift]);

  // Convert planned hours to both timezones
  const plannedStartLocal = currentActiveOrTodayShift
    ? convertTimeBetweenZones(currentActiveOrTodayShift.plannedStart, orgTz, chatterTz)
    : '--:--';
  const plannedEndLocal = currentActiveOrTodayShift
    ? convertTimeBetweenZones(currentActiveOrTodayShift.plannedEnd, orgTz, chatterTz)
    : '--:--';

  const handleConfirmStart = () => {
    if (!currentActiveOrTodayShift) return;
    const startVal = parseFloat(startRegisterInput) || 0;
    startShift(currentActiveOrTodayShift.id, startVal);
    setStartModalOpen(false);
  };

  const handleConfirmEnd = () => {
    if (!currentActiveOrTodayShift) return;
    const endVal = parseFloat(endRegisterInput) || 0;
    const res = endShift(currentActiveOrTodayShift.id, endVal, shiftNote);
    setEndModalOpen(false);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#F3E5AB', '#FFFFFF'],
      });
    } catch {
      // safe fallback
    }

    const commPct = currentActiveOrTodayShift.commissionPercent || currentUser?.commissionPercent || 25;
    const toastMsg = `${commPct}% ${currentUser?.name || 'Брайн'} $${res.payout.toFixed(2)} начислено в ваш кошелёк!`;
    setCompletedSuccessToast(toastMsg);
    setTimeout(() => setCompletedSuccessToast(null), 8000);
  };

  // Personal metrics calculations
  const myCompletedShifts = myShifts.filter(s => s.status === 'COMPLETED');
  const totalEarnedNet = myCompletedShifts.reduce((acc, s) => acc + (s.chatterPayout || 0), 0);
  const totalGrossGenerated = myCompletedShifts.reduce((acc, s) => acc + (s.earnedGross || 0), 0);
  const myBonuses = bonuses.filter(b => b.chatterId === currentUser?.id);
  const myFines = fines.filter(f => f.chatterId === currentUser?.id);

  return (
    <div className="space-y-6">

      {/* Top Welcome Banner */}
      <div className="glass-card-gold rounded-2xl p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400/50 shadow-lg shadow-amber-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {currentUser?.name}
                </h1>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  ЧАТТЕР (СЛОТ #{currentUser?.slotNumber || 1})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 capitalize">
                {formatCurrentDate(lang)} • Статус:{' '}
                <span className="text-emerald-400 font-semibold">{t.status_active}</span>
              </p>
              <div className="flex items-center gap-2 text-xs text-amber-300/90 font-mono mt-1">
                <Percent className="w-3.5 h-3.5" />
                <span>Базовая ставка комиссии: <strong className="text-white">{currentUser?.commissionPercent || 25}%</strong></span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Display */}
          <div className="bg-[#0b0d14]/90 border border-amber-500/30 rounded-xl p-4 sm:px-6 flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl gold-gradient-bg flex items-center justify-center text-[#090A0F]">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                {t.walletBalance}
              </div>
              <div className="text-2xl font-extrabold text-amber-300 font-mono">
                ${(currentUser?.walletBalance || 0).toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-400">
                USD • Доступно к выплате
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {completedSuccessToast && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-emerald-500/20 border border-amber-500/40 text-slate-100 flex items-center justify-between shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-amber-300">
                Смена успешно закрыта!
              </div>
              <div className="text-xs text-white font-mono mt-0.5">
                {completedSuccessToast}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCompletedSuccessToast(null)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* THE PROMINENT "MY SHIFT" (МОЯ СМЕНА) BLOCK */}
      <div className="glass-card rounded-2xl border-2 border-amber-500/30 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider gold-gradient-text">
                {t.myShiftTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Автоматическая фиксация рабочего времени, сравнение часовых поясов и расчет процента
            </p>
          </div>

          {/* Current Status Badge */}
          {currentActiveOrTodayShift && (
            <div>
              {currentActiveOrTodayShift.status === 'PENDING' && (
                <span className="px-3.5 py-1.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  {t.status_PENDING}
                </span>
              )}
              {currentActiveOrTodayShift.status === 'IN_PROGRESS' && (
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {t.status_IN_PROGRESS} ({liveElapsed})
                </span>
              )}
              {currentActiveOrTodayShift.status === 'COMPLETED' && (
                <span className="px-3.5 py-1.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                  {t.status_COMPLETED}
                </span>
              )}
              {currentActiveOrTodayShift.status === 'UNCLOSED' && (
                <span className="px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  {t.status_UNCLOSED}
                </span>
              )}
            </div>
          )}
        </div>

        {/* If no shift assigned */}
        {!currentActiveOrTodayShift ? (
          <div className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300 mb-1">{t.shiftNoScheduleNotice}</h3>
            <p className="text-xs text-slate-500">
              Владелец или ваш Тимлид ещё не внесли смену в расписание на сегодня.
            </p>
          </div>
        ) : (
          <div className="pt-6 space-y-6">

            {/* Timezones & Schedule Box: Dual Timezone Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Employee Local Time Box (e.g. Manila Philippines) */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-amber-500/25">
                <div className="flex items-center justify-between text-xs text-amber-300/80 mb-2 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-400" />
                    <span>Твоё местное время ({chatterTzName}):</span>
                  </div>
                  <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
                    {chatterTz}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-white flex items-center gap-2">
                  <span>{plannedStartLocal}</span>
                  <span className="text-slate-500 text-lg">—</span>
                  <span>{plannedEndLocal}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Смена в твоем часовом поясе. Текущее местное время: <strong>{getCurrentTimeHHMM(chatterTz)}</strong>
                </p>
              </div>

              {/* Company HQ Time Box (e.g. Almaty Kazakhstan) */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-semibold">
                  <span>Время организации (Офис HQ / {orgTzName}):</span>
                  <span className="font-mono text-[11px] bg-neutral-800 px-2 py-0.5 rounded text-slate-400">
                    {orgTz}
                  </span>
                </div>
                <div className="text-2xl font-bold font-mono text-slate-300 flex items-center gap-2">
                  <span>{currentActiveOrTodayShift.plannedStart}</span>
                  <span className="text-slate-600 text-lg">—</span>
                  <span>{currentActiveOrTodayShift.plannedEnd}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Время офиса по расписанию Владельца. В офисе сейчас: <strong>{getCurrentTimeHHMM(orgTz)}</strong>
                </p>
              </div>

            </div>

            {/* Shift Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="text-[11px] text-slate-400">{t.actualEnterTime}</div>
                <div className="text-base font-bold font-mono text-slate-100 mt-1">
                  {currentActiveOrTodayShift.actualStart || '—'}
                </div>
                {currentActiveOrTodayShift.lateMinutes ? (
                  <div className="text-[10px] text-amber-400 mt-0.5 font-medium">
                    Опоздание: {currentActiveOrTodayShift.lateMinutes} мин
                  </div>
                ) : currentActiveOrTodayShift.actualStart ? (
                  <div className="text-[10px] text-emerald-400 mt-0.5">Вовремя</div>
                ) : null}
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="text-[11px] text-slate-400">{t.enterStartSales}</div>
                <div className="text-base font-bold font-mono text-amber-300 mt-1">
                  {currentActiveOrTodayShift.startGross !== undefined ? `$${currentActiveOrTodayShift.startGross}` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Касса на старте</div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <div className="text-[11px] text-slate-400">{t.enterEndSales}</div>
                <div className="text-base font-bold font-mono text-amber-300 mt-1">
                  {currentActiveOrTodayShift.endGross !== undefined ? `$${currentActiveOrTodayShift.endGross}` : '—'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Касса на выходе</div>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-yellow-600/10 border border-amber-500/30">
                <div className="text-[11px] text-amber-300 font-semibold">{t.calculatedPayoutLabel}</div>
                <div className="text-lg font-black font-mono text-amber-300 mt-1">
                  {currentActiveOrTodayShift.chatterPayout !== undefined
                    ? `$${currentActiveOrTodayShift.chatterPayout.toFixed(2)}`
                    : 'В расчете'}
                </div>
                <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                  Ставка: {currentActiveOrTodayShift.commissionPercent || 25}%
                </div>
              </div>
            </div>

            {/* Shift Action Buttons */}
            <div className="pt-2">
              {currentActiveOrTodayShift.status === 'PENDING' && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => setStartModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl gold-gradient-bg text-[#090A0F] font-black text-base uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>{t.startShiftButton}</span>
                  </button>
                  <p className="text-xs text-slate-400">
                    Нажмите кнопку для открытия смены. Система автоматически зафиксирует точное время входа и проверит опоздание.
                  </p>
                </div>
              )}

              {currentActiveOrTodayShift.status === 'IN_PROGRESS' && (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => setEndModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-500 to-amber-600 text-white font-black text-base uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-red-500/25 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.endShiftButton}</span>
                  </button>
                  <div className="text-xs text-slate-300 space-y-0.5">
                    <p className="font-semibold text-amber-300">Смена активна ({liveElapsed})</p>
                    <p className="text-slate-400">
                      При закрытии смены введите финальную кассу, и система моментально зачислит 25% в ваш кошелёк.
                    </p>
                  </div>
                </div>
              )}

              {currentActiveOrTodayShift.status === 'COMPLETED' && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-3 text-xs text-slate-200">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-300">Смена завершена.</span> Выплата{' '}
                    <strong className="font-mono text-amber-300">
                      ${currentActiveOrTodayShift.chatterPayout?.toFixed(2)}
                    </strong>{' '}
                    (25% от заработанных ${currentActiveOrTodayShift.earnedGross}) зачислена на баланс вашего кошелька.
                  </div>
                </div>
              )}
            </div>

            {/* Formula demonstration callout */}
            <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-[11px] text-slate-400 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {t.exampleCalculationBadge}
              </span>
            </div>

          </div>
        )}
      </div>

      {/* Summary KPI Cards for Chatter */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Касса Gross (Всего)</div>
          <div className="text-xl font-bold font-mono text-white mt-1">
            ${totalGrossGenerated.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Суммарный объем продаж</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Мой чистый заработок</div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">
            ${totalEarnedNet.toFixed(2)}
          </div>
          <div className="text-[10px] text-amber-400/80 mt-1">Выплачено за смены</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Бонусы и Премии</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            ${myBonuses.filter(b => b.status === 'approved').reduce((acc, b) => acc + b.amount, 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-1">
            {myBonuses.length} начислений
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Штрафы за период</div>
          <div className="text-xl font-bold font-mono text-red-400 mt-1">
            ${myFines.filter(f => f.status === 'active').reduce((acc, f) => acc + f.amount, 0).toFixed(2)}
          </div>
          <div className="text-[10px] text-red-400/80 mt-1">
            {myFines.length} записей
          </div>
        </div>
      </div>

      {/* Shift History Table for Chatter */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Моя история смен</span>
          </h3>
          <span className="text-xs text-slate-400">
            Всего записей: {myShifts.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Дата</th>
                <th className="pb-3">Смена (Офис / Моё)</th>
                <th className="pb-3">Факт. вход / выход</th>
                <th className="pb-3">Касса вход → выход</th>
                <th className="pb-3">Gross</th>
                <th className="pb-3">Выплата (25%)</th>
                <th className="pb-3">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {myShifts.map(s => {
                const sLocalStart = convertTimeBetweenZones(s.plannedStart, orgTz, chatterTz);
                const sLocalEnd = convertTimeBetweenZones(s.plannedEnd, orgTz, chatterTz);
                return (
                  <tr key={s.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 pl-2 font-sans font-medium text-slate-200">
                      {s.date}
                    </td>
                    <td className="py-3 text-slate-300">
                      <div>{s.plannedStart} - {s.plannedEnd} <span className="text-slate-500 text-[10px]">(Офис)</span></div>
                      <div className="text-amber-400/90 text-[11px] font-semibold">{sLocalStart} - {sLocalEnd} ({chatterTzName})</div>
                    </td>
                    <td className="py-3 text-slate-300">
                      {s.actualStart ? `${s.actualStart} → ${s.actualEnd || '...'}` : '—'}
                      {s.lateMinutes ? (
                        <span className="ml-1 text-[10px] text-amber-400">+{s.lateMinutes}м</span>
                      ) : null}
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
                        <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-300 text-[10px]">
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

      {/* START SHIFT MODAL */}
      {startModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Play className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.startShiftModalTitle}</h3>
                <p className="text-xs text-slate-400">Сотрудник: {currentUser?.name}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.enterStartSales}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={startRegisterInput}
                    onChange={e => setStartRegisterInput(e.target.value)}
                    placeholder={t.startSalesPlaceholder}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Укажите стартовую сумму на счету/кассе модели при входе в смену.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Текущее время входа:</span>
                  <span className="font-mono text-amber-300 font-bold">{getCurrentTimeHHMM(chatterTz)} ({chatterTzName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Плановое начало:</span>
                  <span className="font-mono text-slate-200">{plannedStartLocal}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmStart}
                className="flex-1 py-3 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                {t.confirmStart}
              </button>
              <button
                onClick={() => setStartModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300 font-semibold transition"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* END SHIFT MODAL & 25% CALCULATION */}
      {endModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.endShiftModalTitle}</h3>
                <p className="text-xs text-slate-400">Сотрудник: {currentUser?.name}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.enterEndSales}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={endRegisterInput}
                    onChange={e => setEndRegisterInput(e.target.value)}
                    placeholder={t.endSalesPlaceholder}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
              </div>

              {/* Dynamic Math Calculation Box */}
              {(() => {
                const startVal = currentActiveOrTodayShift?.startGross || parseFloat(startRegisterInput) || 0;
                const endVal = parseFloat(endRegisterInput) || 0;
                const earnedGross = Math.max(0, endVal - startVal);
                const pct = currentActiveOrTodayShift?.commissionPercent || 25;
                const payout = earnedGross * (pct / 100);
                return (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-yellow-600/10 to-transparent border border-amber-500/30 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Касса входа:</span>
                      <span className="font-mono text-slate-200">${startVal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Касса выхода:</span>
                      <span className="font-mono text-slate-200">${endVal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-1 border-t border-neutral-800">
                      <span className="text-amber-300">Заработано за смену (Gross):</span>
                      <span className="font-mono text-white">${earnedGross.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1 border-t border-amber-500/20 text-sm">
                      <span className="text-amber-400">Выплата в кошелёк ({pct}%):</span>
                      <span className="font-mono text-amber-300 text-base font-extrabold">
                        ${payout.toFixed(2)} USD
                      </span>
                    </div>
                    <p className="text-[10px] text-amber-300/80 font-mono text-center pt-1">
                      Формула: (${endVal} - ${startVal}) × {pct}% = ${payout.toFixed(2)} {currentUser?.name}
                    </p>
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Примечание / Комментарий к смене (опционально)
                </label>
                <textarea
                  value={shiftNote}
                  onChange={e => setShiftNote(e.target.value)}
                  placeholder="Отличный трафик, чаевые от постоянных фанатов..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmEnd}
                className="flex-1 py-3 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                {t.confirmEnd}
              </button>
              <button
                onClick={() => setEndModalOpen(false)}
                className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300 font-semibold transition"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
