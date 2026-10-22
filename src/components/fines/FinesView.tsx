import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';

export const FinesView: React.FC = () => {
  const {
    currentUser,
    users,
    fines,
    fineCategories,
    addFineCategory,
    issueFine,
    waiveFine,
    settings,
    t,
  } = useApp();

  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [newCatNameRu, setNewCatNameRu] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [newCatAmount, setNewCatAmount] = useState('20');

  const [issueFineModal, setIssueFineModal] = useState(false);
  const [targetChatterId, setTargetChatterId] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');
  const [fineAmount, setFineAmount] = useState('20');
  const [fineReason, setFineReason] = useState('');

  const chatters = users.filter(u => u.role === 'CHATTER');

  // Permissions & Isolation
  const isOwner = currentUser?.role === 'OWNER';
  const isTeamLead = currentUser?.role === 'TEAM_LEAD';
  const canIssueFine = isOwner || (isTeamLead && settings.teamLeadPermissions.canAssignFines);

  // Filter fines visible to current user
  const visibleFines = fines.filter(f => {
    if (isOwner) return true;
    if (isTeamLead) {
      const myChatters = users.filter(u => u.teamLeadId === currentUser.id).map(u => u.id);
      return myChatters.includes(f.chatterId);
    }
    return f.chatterId === currentUser?.id;
  });

  const totalFinesSum = visibleFines.filter(f => f.status === 'active').reduce((acc, f) => acc + f.amount, 0);

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameRu.trim()) return;
    addFineCategory(
      newCatNameRu.trim(),
      newCatNameEn.trim() || newCatNameRu.trim(),
      parseFloat(newCatAmount) || 20
    );
    setAddCategoryModal(false);
    setNewCatNameRu('');
    setNewCatNameEn('');
  };

  const handleIssueFineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetChatterId || !selectedCatId) return;
    issueFine(targetChatterId, selectedCatId, parseFloat(fineAmount) || 20, fineReason);
    setIssueFineModal(false);
    setFineReason('');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>{t.finesTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.finesSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setAddCategoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-slate-200 hover:text-amber-300 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{t.addFineCategory}</span>
            </button>
          )}

          {canIssueFine && (
            <button
              onClick={() => {
                setTargetChatterId(chatters[0]?.id || '');
                setSelectedCatId(fineCategories[0]?.id || '');
                setIssueFineModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-red-500/20 flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t.issueFineButton}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl border-red-500/30">
          <div className="text-xs text-red-400 font-medium">Активных штрафов на сумму</div>
          <div className="text-2xl font-extrabold font-mono text-red-300 mt-1">
            ${totalFinesSum.toFixed(2)} USD
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Удержано из баланса кошельков</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Категорий нарушений</div>
          <div className="text-2xl font-extrabold font-mono text-white mt-1">
            {fineCategories.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Базовые виды взысканий</div>
        </div>

        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs text-slate-400 font-medium">Всего зарегистрировано</div>
          <div className="text-2xl font-extrabold font-mono text-slate-300 mt-1">
            {visibleFines.length} записей
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Хронологический архив</div>
        </div>
      </div>

      {/* Dynamic Fine Categories List (Owner can configure) */}
      {isOwner && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>{t.fineCategoriesList}</span>
            </h3>
            <span className="text-xs text-slate-400">
              Создаются прямо в интерфейсе без изменения кода
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {fineCategories.map(cat => (
              <div
                key={cat.id}
                className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{cat.nameRu}</div>
                  <div className="text-[10px] text-slate-500">{cat.nameEn}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-red-400">
                    ${cat.defaultAmount}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">Активен</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fines Logbook Table */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>{t.finesRegistry}</span>
        </h3>

        {visibleFines.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Нет наложенных штрафов
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-800 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="pb-3 pl-2">Сотрудник</th>
                  <th className="pb-3">Вид штрафа</th>
                  <th className="pb-3">Сумма USD</th>
                  <th className="pb-3">Причина / Обоснование</th>
                  <th className="pb-3">Кто назначил</th>
                  <th className="pb-3">Дата</th>
                  <th className="pb-3">Статус</th>
                  {isOwner && <th className="pb-3 text-right pr-2">Действие</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {visibleFines.map(f => (
                  <tr key={f.id} className="hover:bg-neutral-800/30 transition">
                    <td className="py-3 pl-2 font-sans font-bold text-white">
                      {f.chatterName}
                    </td>
                    <td className="py-3 text-red-300 font-medium font-sans">
                      {f.categoryName}
                    </td>
                    <td className="py-3 text-base font-extrabold text-red-400">
                      -${f.amount}
                    </td>
                    <td className="py-3 text-slate-300 font-sans max-w-xs truncate">
                      {f.reason}
                    </td>
                    <td className="py-3 text-slate-400 font-sans">
                      {f.issuedByName}
                    </td>
                    <td className="py-3 text-slate-400">
                      {f.createdAt}
                    </td>
                    <td className="py-3 font-sans">
                      {f.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-bold">
                          Активен
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-500/20 text-slate-400 text-[10px]">
                          Списан
                        </span>
                      )}
                    </td>
                    {isOwner && (
                      <td className="py-3 text-right pr-2">
                        {f.status === 'active' && (
                          <button
                            onClick={() => waiveFine(f.id)}
                            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-amber-300 text-[11px] transition flex items-center gap-1 ml-auto"
                            title="Аннулировать штраф и вернуть средства в кошелёк"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>{t.waiveFine}</span>
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD FINE CATEGORY MODAL */}
      {addCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCategorySubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.addFineCategory}</h3>
                <p className="text-xs text-slate-400">Добавление нового вида дисциплинарного взыскания</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.categoryNameRu}
              </label>
              <input
                type="text"
                value={newCatNameRu}
                onChange={e => setNewCatNameRu(e.target.value)}
                placeholder="Например: Срыв ночной смены"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.categoryNameEn}
              </label>
              <input
                type="text"
                value={newCatNameEn}
                onChange={e => setNewCatNameEn(e.target.value)}
                placeholder="e.g. Missed night shift"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.defaultAmountUSD}
              </label>
              <input
                type="number"
                value={newCatAmount}
                onChange={e => setNewCatAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Сохранить категорию
              </button>
              <button
                type="button"
                onClick={() => setAddCategoryModal(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ISSUE FINE MODAL */}
      {issueFineModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleIssueFineSubmit}
            className="w-full max-w-md bg-[#12151e] border border-red-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{t.issueFineButton}</h3>
                <p className="text-xs text-slate-400">Сумма спишется с баланса кошелька сотрудника</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.selectChatter}
              </label>
              <select
                value={targetChatterId}
                onChange={e => setTargetChatterId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
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
                {t.selectCategory}
              </label>
              <select
                value={selectedCatId}
                onChange={e => {
                  setSelectedCatId(e.target.value);
                  const cat = fineCategories.find(c => c.id === e.target.value);
                  if (cat) setFineAmount(cat.defaultAmount.toString());
                }}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-400"
                required
              >
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
                value={fineAmount}
                onChange={e => setFineAmount(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t.fineReason}
              </label>
              <textarea
                value={fineReason}
                onChange={e => setFineReason(e.target.value)}
                placeholder="Опоздание на смену без предупреждения..."
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
                Наложить штраф
              </button>
              <button
                type="button"
                onClick={() => setIssueFineModal(false)}
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
