import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  UserPlus,
  Key,
  Shield,
  Clock,
  Percent,
  CheckCircle,
  Ban,
  Edit2,
  Trash2,
  Lock,
  Mail,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { SUPPORTED_TIMEZONES } from '../../utils/time';

export const TeamSlotsView: React.FC = () => {
  const {
    users,
    addSlot,
    updateUserCredentials,
    toggleUserStatus,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'CHATTER' | 'TEAM_LEAD'>('CHATTER');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addRole, setAddRole] = useState<'CHATTER' | 'TEAM_LEAD'>('CHATTER');
  const [addName, setAddName] = useState('');
  const [addLogin, setAddLogin] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addTz, setAddTz] = useState('Asia/Manila');
  const [addCommission, setAddCommission] = useState('25');
  const [addTlId, setAddTlId] = useState('');

  // Edit credentials modal
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editLogin, setEditLogin] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCommission, setEditCommission] = useState('25');
  const [editTlId, setEditTlId] = useState('');
  const [editTz, setEditTz] = useState('');

  const teamLeads = users.filter(u => u.role === 'TEAM_LEAD');
  const chatters = users.filter(u => u.role === 'CHATTER');

  const filteredChatters = chatters.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeamLeads = teamLeads.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.login.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = (role: 'CHATTER' | 'TEAM_LEAD') => {
    setAddRole(role);
    setAddName('');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setAddLogin(role === 'CHATTER' ? `chatter_${randomSuffix}` : `lead_${randomSuffix}`);
    setAddPassword(`tulpar${randomSuffix}`);
    setAddTz(role === 'CHATTER' ? 'Asia/Manila' : 'Asia/Almaty');
    setAddCommission('25');
    setAddTlId(teamLeads[0]?.id || '');
    setAddModalOpen(true);
  };

  const handleCreateSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addLogin.trim() || !addPassword.trim()) return;
    addSlot(
      addRole,
      addName.trim(),
      addLogin.trim(),
      addPassword.trim(),
      addTz,
      parseFloat(addCommission) || 25,
      addRole === 'CHATTER' ? addTlId : undefined
    );
    setAddModalOpen(false);
  };

  const handleOpenEdit = (user: User) => {
    setEditUser(user);
    setEditLogin(user.login);
    setEditPassword(user.password || '');
    setEditCommission(user.commissionPercent.toString());
    setEditTlId(user.teamLeadId || '');
    setEditTz(user.timezone);
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    updateUserCredentials(
      editUser.id,
      editLogin.trim(),
      editPassword.trim(),
      parseFloat(editCommission) || 25,
      editUser.role === 'CHATTER' ? editTlId : undefined,
      editTz
    );
    setEditUser(null);
  };

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>{t.teamManagementTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.teamSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal('TEAM_LEAD')}
            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-semibold text-slate-200 hover:text-amber-300 transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>+ Ячейка Тимлида/Админа</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('CHATTER')}
            className="px-4 py-2 rounded-xl gold-gradient-bg text-[#090A0F] text-xs font-bold uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Ячейка Чаттера</span>
          </button>
        </div>
      </div>

      {/* Filter and Tabs Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 bg-neutral-900/80 p-1 rounded-xl border border-neutral-800 self-start">
          <button
            onClick={() => setActiveTab('CHATTER')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'CHATTER'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ячейки Чаттеров</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-slate-300">
              {chatters.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('TEAM_LEAD')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'TEAM_LEAD'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Ячейки Тимлидов / Админов</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-slate-300">
              {teamLeads.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* CHATTER SLOTS VIEW */}
      {activeTab === 'CHATTER' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChatters.map((chatter, idx) => {
            const tl = teamLeads.find(l => l.id === chatter.teamLeadId);
            const tzCity = SUPPORTED_TIMEZONES.find(t => t.value === chatter.timezone)?.city || chatter.timezone;
            return (
              <div
                key={chatter.id}
                className="glass-card rounded-2xl p-5 border border-neutral-800 hover:border-amber-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold uppercase">
                      Ячейка Чаттера #{chatter.slotNumber || idx + 1}
                    </span>
                    <button
                      onClick={() => toggleUserStatus(chatter.id)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition ${
                        chatter.status === 'active'
                          ? 'bg-emerald-500/15 text-emerald-300 hover:bg-red-500/20 hover:text-red-300'
                          : 'bg-red-500/20 text-red-300 hover:bg-emerald-500/20 hover:text-emerald-300'
                      }`}
                      title="Нажмите для смены статуса"
                    >
                      {chatter.status === 'active' ? '● Активен' : '✕ Заблокирован'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={chatter.avatar}
                      alt={chatter.name}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/25"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{chatter.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Логин: <strong className="text-amber-300">{chatter.login}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Пароль: <strong className="text-slate-300">{chatter.password}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div className="space-y-2 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs font-mono mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Часовой пояс:</span>
                      <span className="text-slate-200">{tzCity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Комиссия чаттера:</span>
                      <span className="text-amber-300 font-bold">{chatter.commissionPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Закреплен за TL:</span>
                      <span className="text-blue-300 font-sans truncate max-w-[130px]">
                        {tl ? tl.name.split(' ')[0] : 'Не назначен'}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-neutral-800">
                      <span className="text-slate-500 font-sans">Баланс в кошельке:</span>
                      <span className="text-emerald-400 font-bold">${chatter.walletBalance.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => handleOpenEdit(chatter)}
                    className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Логин / Пароль</span>
                  </button>
                  <button
                    onClick={() => toggleUserStatus(chatter.id)}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-400 hover:text-red-400 transition"
                    title={chatter.status === 'active' ? 'Заблокировать' : 'Активировать'}
                  >
                    {chatter.status === 'active' ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TEAM LEAD SLOTS VIEW */}
      {activeTab === 'TEAM_LEAD' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeamLeads.map((tl, idx) => {
            const subordinateChatters = chatters.filter(c => c.teamLeadId === tl.id);
            const tzCity = SUPPORTED_TIMEZONES.find(t => t.value === tl.timezone)?.city || tl.timezone;
            return (
              <div
                key={tl.id}
                className="glass-card-gold rounded-2xl p-5 border border-amber-500/25 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                      Ячейка Тимлида #{tl.slotNumber || idx + 1}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      ● Активен
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={tl.avatar}
                      alt={tl.name}
                      className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">{tl.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Логин: <strong className="text-amber-300">{tl.login}</strong>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Пароль: <strong className="text-slate-300">{tl.password}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs font-mono mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Часовой пояс:</span>
                      <span className="text-slate-200">{tzCity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Чаттеров в команде:</span>
                      <span className="text-amber-300 font-bold">{subordinateChatters.length} чел.</span>
                    </div>
                    <div className="pt-1 border-t border-neutral-800 text-[11px] text-slate-400 font-sans">
                      {subordinateChatters.length > 0 ? (
                        <span>Закреплены: {subordinateChatters.map(c => c.name.split(' ')[0]).join(', ')}</span>
                      ) : (
                        <span className="text-slate-500">Чаттеры пока не назначены</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800">
                  <button
                    onClick={() => handleOpenEdit(tl)}
                    className="flex-1 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Учетные данные</span>
                  </button>
                  <button
                    onClick={() => toggleUserStatus(tl.id)}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-slate-400 hover:text-red-400 transition"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE NEW SLOT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSlotSubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {addRole === 'CHATTER' ? 'Новая рабочая ячейка Чаттера' : 'Новая ячейка Тимлида/Админа'}
                </h3>
                <p className="text-xs text-slate-400">
                  Владелец создаёт аккаунт и выдаёт логин/пароль
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ФИО сотрудника
              </label>
              <input
                type="text"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                placeholder="Например: Артур Мусаев"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Логин доступа
                </label>
                <input
                  type="text"
                  value={addLogin}
                  onChange={e => setAddLogin(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Пароль
                </label>
                <input
                  type="text"
                  value={addPassword}
                  onChange={e => setAddPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Часовой пояс
                </label>
                <select
                  value={addTz}
                  onChange={e => setAddTz(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {SUPPORTED_TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.city} ({tz.value})
                    </option>
                  ))}
                </select>
              </div>

              {addRole === 'CHATTER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Процентная ставка (%)
                  </label>
                  <input
                    type="number"
                    value={addCommission}
                    onChange={e => setAddCommission(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {addRole === 'CHATTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Закрепить за Тимлидом
                </label>
                <select
                  value={addTlId}
                  onChange={e => setAddTlId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Без закрепления --</option>
                  {teamLeads.map(tl => (
                    <option key={tl.id} value={tl.id}>
                      {tl.name} ({tl.login})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                Создать ячейку
              </button>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300"
              >
                {t.cancel}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT USER CREDENTIALS MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEditSubmit}
            className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Редактирование ячейки</h3>
                <p className="text-xs text-slate-400">{editUser.name} ({editUser.role})</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Логин
                </label>
                <input
                  type="text"
                  value={editLogin}
                  onChange={e => setEditLogin(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Пароль
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Часовой пояс
                </label>
                <select
                  value={editTz}
                  onChange={e => setEditTz(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {SUPPORTED_TIMEZONES.map(tz => (
                    <option key={tz.value} value={tz.value}>
                      {tz.city} ({tz.value})
                    </option>
                  ))}
                </select>
              </div>

              {editUser.role === 'CHATTER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Процентная ставка (%)
                  </label>
                  <input
                    type="number"
                    value={editCommission}
                    onChange={e => setEditCommission(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}
            </div>

            {editUser.role === 'CHATTER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Закрепленный Тимлид
                </label>
                <select
                  value={editTlId}
                  onChange={e => setEditTlId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Без закрепления --</option>
                  {teamLeads.map(tl => (
                    <option key={tl.id} value={tl.id}>
                      {tl.name} ({tl.login})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition"
              >
                {t.saveChanges}
              </button>
              <button
                type="button"
                onClick={() => setEditUser(null)}
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
