import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Crown,
  MessageSquare,
  Users,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Mail,
  KeyRound,
  AlertCircle,
  Ticket,
  HelpCircle,
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { lang, t, loginUser } = useApp();
  
  // Selected portal card: null (cards view) or 'OWNER' | 'CHATTER' | 'TEAM_LEAD'
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteError, setInviteError] = useState('');

  const handleCardSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage('');
    // Strict privacy: clean empty inputs with zero exposed credentials
    setLoginInput('');
    setPasswordInput('');
  };

  const handleBackToCards = () => {
    setSelectedRole(null);
    setErrorMessage('');
    setLoginInput('');
    setPasswordInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!loginInput.trim() || !passwordInput.trim()) {
      setErrorMessage(t.invalidCredentialsError);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = loginUser(loginInput, passwordInput, selectedRole);
      setIsLoading(false);
      if (!res.success && res.error) {
        setErrorMessage(res.error);
      }
    }, 250);
  };

  const handleValidateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) {
      setInviteError('Введите выданный вам код приглашения');
      return;
    }
    setInviteError('Недействительный или просроченный токен приглашения. Обратитесь к Владельцу для активации вашей рабочей ячейки.');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center px-4 py-8 relative">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-yellow-600/5 rounded-full blur-2xl pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10">

        {/* 3 Portal Cards Selection */}
        {!selectedRole ? (
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Изолированная 3-уровневая система доступа TULPAR</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
                <span className="font-brand-logo gold-gradient-text">TULPAR</span> — {t.selectPortal}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                {t.selectPortalDesc}
              </p>
            </div>

            {/* The 3 Dedicated Entry Cards (No logins or passwords shown) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: OWNER */}
              <div
                onClick={() => handleCardSelect('OWNER')}
                className="group relative rounded-2xl glass-card-gold p-7 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                    Super Admin
                  </span>
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-[#090A0F] mb-6 shadow-lg shadow-amber-500/30 group-hover:rotate-3 transition">
                    <Crown className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition">
                    1. {t.ownerTitle}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {t.ownerSubtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition">
                    <span>{t.enterPortal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 2: CHATTER */}
              <div
                onClick={() => handleCardSelect('CHATTER')}
                className="group relative rounded-2xl glass-card p-7 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    Operator
                  </span>
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 group-hover:rotate-3 transition">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition">
                    2. {t.chatterTitle}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {t.chatterSubtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition">
                    <span>{t.enterPortal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Card 3: TEAM LEAD / ADMIN */}
              <div
                onClick={() => handleCardSelect('TEAM_LEAD')}
                className="group relative rounded-2xl glass-card p-7 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    Supervisor
                  </span>
                </div>

                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20 group-hover:rotate-3 transition">
                    <Users className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition">
                    3. {t.teamleadTitle}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {t.teamleadSubtitle}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition">
                    <span>{t.enterPortal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Utilities */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-6 border-t border-neutral-800">
              <div className="flex items-center gap-2">
                <span>Поддержка сервиса:</span>
                <a
                  href="mailto:Tulpar2026@gmail.com"
                  className="text-amber-300 hover:underline font-mono"
                >
                  Tulpar2026@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="hover:text-amber-300 flex items-center gap-1.5 transition"
                >
                  <Ticket className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.hasInviteCode}</span>
                </button>
                <button
                  onClick={() => setShowForgotModal(true)}
                  className="hover:text-amber-300 flex items-center gap-1.5 transition"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.forgotPassword}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          /* Dedicated Clean Login Form with Zero Exposed Credentials */
          <div className="max-w-md mx-auto">
            <button
              onClick={handleBackToCards}
              className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-300 transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              <span>{t.backToCards}</span>
            </button>

            <div className="rounded-2xl glass-card-gold p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    {selectedRole === 'OWNER' && <Crown className="w-5 h-5" />}
                    {selectedRole === 'CHATTER' && <MessageSquare className="w-5 h-5" />}
                    {selectedRole === 'TEAM_LEAD' && <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">
                      Вход в кабинет {t[`role_${selectedRole}`]}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Введите ваш персональный логин и пароль
                    </p>
                  </div>
                </div>
              </div>

              {/* Error message */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {t.loginField}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginInput}
                      onChange={e => setLoginInput(e.target.value)}
                      placeholder="Введите логин или email"
                      className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition pl-10"
                      required
                      autoComplete="username"
                    />
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      {t.passwordField}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 transition"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={e => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-900/90 border border-neutral-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition pl-10 font-mono"
                      required
                      autoComplete="current-password"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-sm tracking-wide hover:opacity-95 transition shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <span>Проверка доступа...</span>
                  ) : (
                    <>
                      <span>{t.signInButton}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-slate-500">
                <span>Закрытая организация TULPAR • Доступ выдаётся администратором</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.forgotPassword}</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {t.forgotPasswordNotice}
            </p>
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-slate-300 space-y-2 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email службы поддержки:</span>
                <span className="font-mono text-amber-300 font-semibold">Tulpar2026@gmail.com</span>
              </div>
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white transition"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Invite Code Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">{t.registerByInvite}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Регистрация в TULPAR осуществляется исключительно по персональному приглашению Владельца. Введите выданный вам токен.
            </p>
            <form onSubmit={handleValidateInvite} className="space-y-4 mb-4">
              <input
                type="text"
                value={inviteCodeInput}
                onChange={e => {
                  setInviteCodeInput(e.target.value);
                  setInviteError('');
                }}
                placeholder="TULPAR-INVITE-XXXX-XXXX"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 uppercase tracking-widest font-mono focus:outline-none focus:border-amber-400"
              />
              {inviteError && (
                <p className="text-xs text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                  {inviteError}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs"
                >
                  Проверить токен
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-slate-300 font-semibold"
                >
                  {t.close}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
