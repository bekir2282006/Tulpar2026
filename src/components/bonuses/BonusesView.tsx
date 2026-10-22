import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Percent,
  DollarSign,
  TrendingUp,
  Check,
  X,
} from 'lucide-react';

export const BonusesView: React.FC = () => {
  const {
    currentUser,
    users,
    bonuses,
    bonusRules,
    createBonusRule,
    requestBonus,
    approveBonus,
    rejectBonus,
    t,
  } = useApp();

  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [awardModalOpen, setAwardModalOpen] = useState(false);

  // New Rule form
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleType, setRuleType] = useState<'fixed' | 'percentage'>('fixed');
  const [ruleValue, setRuleValue] = useState('50');
  const [ruleBase, setRuleBase] = useState<'shift_earned' | 'monthly_earned' | 'team_sales'>('shift_earned');
  const [ruleConditions, setRuleConditions] = useState('');
  const [rulePeriod, setRulePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Manual Award form
  const [awardChatterId, setAwardChatterId] = useState('');
  const [awardTitle, setAwardTitle] = useState('');
  const [awardType, setAwardType] = useState<'fixed' | 'percentage'>('fixed');
  const [awardAmount, setAwardAmount] = useState('50');
  const [awardBasis, setAwardBasis] = useState('200');
  const [awardRate, setAwardRate] = useState('10');

  const chatters = users.filter(u => u.role === 'CHATTER');
  const isOwner = currentUser?.role === 'OWNER';

  // Visible bonuses based on role
  const visibleBonuses = bonuses.filter(b => {
    if (isOwner) return true;
    if (currentUser?.role === 'TEAM_LEAD') {
      const assignedIds = users.filter(u => u.teamLeadId === currentUser.id).map(u => u.id);
      return assignedIds.includes(b.chatterId);
    }
    return b.chatterId === currentUser?.id;
  });

  const pendingBonuses = visibleBonuses.filter(b => b.status === 'pending');
  const approvedBonuses = visibleBonuses.filter(b => b.status === 'approved');

  const handleCreateRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleTitle.trim()) return;
    createBonusRule({
      title: ruleTitle.trim(),
      type: ruleType,
      value: parseFloat(ruleValue) || 50,
      calculationBase: ruleType === 'percentage' ? ruleBase : undefined,
      conditions: ruleConditions,
      period: rulePeriod,
      assignedToRole: 'CHATTER',
    });
    setRuleModalOpen(false);
    setRuleTitle('');
    setRuleConditions('');
  };

  const handleManualAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardChatterId || !awardTitle.trim()) return;

    let finalAmount = parseFloat(awardAmount) || 50;
    let basis: number | undefined = undefined;
    let rate: number | undefined = undefined;

    if (awardType === 'percentage') {
      basis = parseFloat(awardBasis) || 0;
      rate = parseFloat(awardRate) || 0;
      finalAmount = Math.round((basis * (rate / 100)) * 100) / 100;
    }

    requestBonus(awardChatterId, awardTitle.trim(), awardType, finalAmount, basis, rate);
    setAwardModalOpen(false);
    setAwardTitle('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>{t.bonusesTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.bonusesSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setRuleModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-slate-200 hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{t.createBonusRule}</span>
            </button>
          )}

          {currentUser?.role !== 'CHATTER' && (
            <button
              onClick={() => {
                setAwardChatterId(chatters[0]?.id || '');
                setAwardModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl gold-gradient-bg text-[#090A0F] text-xs font-bold uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.awardBonusManual}</span>
            </button>
          )}
        </div>
      </div>

      {/* Pending Approvals Section for Owner */}
      {isOwner && pendingBonuses.length > 0 && (
        <div className="glass-card-gold rounded-2xl p-6 border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">{t.pendingApprovals} ({pendingBonuses.length})</h3>
            </div>
            <span className="text-xs text-amber-300/80">Окончательное подтверждение</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingBonuses.map(b => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-white">{b.chatterName}</span>
                    <span className="text-base font-extrabold text-amber-300 font-mono">
                      +${b.amount.toFixed(2)} USD
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{b.title}</p>
                  {b.rate && (
                    <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
                      База расчёта: {b.rate}% от ${b.basisAmount} = ${b.amount.toFixed(2)}
                    </p>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    Дата создания: {b.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => approveBonus(b.id)}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.approveBonus}</span>
                  </button>
                  <button
                    onClick={() => rejectBonus(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-400 hover:text-red-400 text-xs flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>{t.rejectBonus}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus Policies List */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Политика бонусной мотивации организации</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {bonusRules.map(rule => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{rule.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    {rule.period}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{rule.conditions}</p>
                {rule.type === 'percentage' && (
                  <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                    База: {rule.calculationBase === 'shift_earned' ? 'Касса за смену' : 'Месячная касса'}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-black text-amber-300 font-mono">
                  {rule.type === 'fixed' ? `+$${rule.value}` : `+${rule.value}%`}
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono">Активно</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approved / Completed Bonuses History */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{t.approvedBonuses}</span>
        </h3>

        {approvedBonuses.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Нет подтвержденных бонусов
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Сотрудник</th>
                  <th className="pb-3">Название премии</th>
                  <th className="pb-3">Сумма USD</th>
                  <th className="pb-3">Расчёт / База</th>
                  <th className="pb-3">Подтвердил</th>
                  <th className="pb-3">Дата</th>
                  <th className="pb-3">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {approvedBonuses.map(b => (
                  <tr key={b.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 pl-2 font-sans font-bold text-white">
                      {b.chatterName}
                    </td>
                    <td className="py-3 text-slate-300 font-sans">{b.title}</td>
                    <td className="py-3 text-base font-extrabold text-emerald-400">
                      +${b.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-slate-400">
                      {b.rate ? `${b.rate}% от $${b.basisAmount}` : 'Фикс'}
                    </td>
                    <td className="py-3 text-amber-300 font-sans">
                      {b.decisionBy || 'Владелец'}
                    </td>
                    <td className="py-3 text-slate-400">{b.createdAt}</td>
                    <td className="py-3 font-sans">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Зачислено в кошелёк
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE BONUS RULE MODAL */}
      {ruleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateRuleSubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.createBonusRule}</h3>
                <p className="text-xs text-slate-400">Настройка политики мотивации команды</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.bonusTitle}
              </label>
              <input
                type="text"
                value={ruleTitle}
                onChange={e => setRuleTitle(e.target.value)}
                placeholder="Например: Премия за дневной рекорд"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.bonusType}
                </label>
                <select
                  value={ruleType}
                  onChange={e => setRuleType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="fixed">Фиксированный USD ($)</option>
                  <option value="percentage">Процентный (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Размер ({ruleType === 'fixed' ? '$ USD' : '%'})
                </label>
                <input
                  type="number"
                  value={ruleValue}
                  onChange={e => setRuleValue(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            {ruleType === 'percentage' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t.percentageBase}
                </label>
                <select
                  value={ruleBase}
                  onChange={e => setRuleBase(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="shift_earned">{t.baseShiftSales}</option>
                  <option value="monthly_earned">{t.baseMonthlySales}</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Условия начисления
              </label>
              <textarea
                value={ruleConditions}
                onChange={e => setRuleConditions(e.target.value)}
                placeholder="При достижении плановой кассы смены от $500..."
                rows={2}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Сохранить правило
              </button>
              <button
                type="button"
                onClick={() => setRuleModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MANUAL AWARD BONUS MODAL */}
      {awardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleManualAwardSubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.awardBonusManual}</h3>
                <p className="text-xs text-slate-400">Поощрение с выбором фиксированной суммы или %</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.employee} (Чаттер)
              </label>
              <select
                value={awardChatterId}
                onChange={e => setAwardChatterId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              >
                {chatters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.login})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.bonusTitle}
              </label>
              <input
                type="text"
                value={awardTitle}
                onChange={e => setAwardTitle(e.target.value)}
                placeholder="Например: Премия за перевыполнение плана"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Тип расчёта
                </label>
                <select
                  value={awardType}
                  onChange={e => setAwardType(e.target.value as any)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="fixed">Фиксированная сумма USD</option>
                  <option value="percentage">Процент от базы</option>
                </select>
              </div>

              {awardType === 'fixed' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Сумма USD ($)
                  </label>
                  <input
                    type="number"
                    value={awardAmount}
                    onChange={e => setAwardAmount(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Процентная ставка (%)
                  </label>
                  <input
                    type="number"
                    value={awardRate}
                    onChange={e => setAwardRate(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    required
                  />
                </div>
              )}
            </div>

            {awardType === 'percentage' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Базовая сумма для начисления процента ($)
                </label>
                <input
                  type="number"
                  value={awardBasis}
                  onChange={e => setAwardBasis(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
                <p className="text-[11px] text-amber-300 font-mono mt-1">
                  Итоговая выплата: ${(parseFloat(awardBasis) * (parseFloat(awardRate) / 100) || 0).toFixed(2)} USD
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Создать заявку
              </button>
              <button
                type="button"
                onClick={() => setAwardModalOpen(false)}
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
