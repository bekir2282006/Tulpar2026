import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield,
  Globe,
  Clock,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Wallet,
  Menu,
  X,
  Building,
  Key,
} from 'lucide-react';
import { getCurrentTimeHHMM, SUPPORTED_TIMEZONES } from '../utils/time';

interface HeaderProps {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileNav, isMobileNavOpen }) => {
  const { lang, setLang, t, currentUser, logoutUser, updateUserTimezone } = useApp();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTzModal, setShowTzModal] = useState(false);

  const currentTime = currentUser ? getCurrentTimeHHMM(currentUser.timezone) : getCurrentTimeHHMM();
  const userTzObj = SUPPORTED_TIMEZONES.find(x => x.value === currentUser?.timezone);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0d14]/90 backdrop-blur-md border-b border-amber-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={onToggleMobileNav}
              className="md:hidden p-2 text-slate-400 hover:text-amber-400 hover:bg-neutral-900 rounded-lg transition"
              aria-label="Toggle Navigation"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gold-gradient-bg flex items-center justify-center shadow-lg shadow-amber-500/20 text-[#090A0F] font-bold">
              <span className="font-brand-logo text-lg leading-none">T</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-brand-logo font-bold text-lg tracking-widest gold-gradient-text">
                  TULPAR
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  v2.6 PRO
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-1 tracking-tight">
                Workforce & Shift Management
              </p>
            </div>
          </div>
        </div>

        {/* Center Support & Contact Email */}
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-neutral-900/60 px-3 py-1.5 rounded-full border border-neutral-800">
          <Building className="w-3.5 h-3.5 text-amber-400" />
          <span>Support:</span>
          <a
            href="mailto:Tulpar2026@gmail.com"
            className="text-amber-300 hover:underline font-mono font-medium"
          >
            Tulpar2026@gmail.com
          </a>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Timezone & Clock indicator for logged in user */}
          {currentUser && (
            <button
              onClick={() => setShowTzModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-amber-500/40 text-xs text-slate-300 transition"
              title="Нажмите, чтобы изменить часовой пояс"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono font-semibold text-amber-200">{currentTime}</span>
              <span className="hidden md:inline text-slate-400 text-[11px] truncate max-w-[90px]">
                {userTzObj?.city || 'UTC'}
              </span>
            </button>
          )}

          {/* Chatter Wallet Pill */}
          {currentUser?.role === 'CHATTER' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/15 to-yellow-600/10 border border-amber-500/30 text-xs">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline text-slate-400">{t.walletBalance}:</span>
              <span className="font-mono font-bold text-amber-300">${currentUser.walletBalance.toFixed(2)}</span>
            </div>
          )}

          {/* Language Switcher RU / EN */}
          <div className="flex items-center bg-neutral-900/80 p-0.5 rounded-lg border border-neutral-800">
            <button
              onClick={() => setLang('ru')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                lang === 'ru'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                lang === 'en'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              EN
            </button>
          </div>

          {/* Logged-in User menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/30 transition"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-lg object-cover border border-amber-500/30"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-amber-400/80 font-mono">
                    {t[`role_${currentUser.role}`]}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#12151e] border border-amber-500/25 shadow-2xl p-2 z-50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-800 mb-1">
                    <p className="text-xs font-semibold text-slate-100">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/25 font-mono">
                      {t[`role_${currentUser.role}`]}
                    </span>
                  </div>

                  <button
                    onClick={() => setShowTzModal(true)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-amber-300 hover:bg-neutral-800/80 rounded-lg flex items-center gap-2 transition"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Часовой пояс ({userTzObj?.city})</span>
                  </button>

                  <button
                    onClick={logoutUser}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">TULPAR Shield Active</span>
            </div>
          )}

        </div>
      </div>

      {/* Timezone selector Modal */}
      {showTzModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12151e] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                  Выбор часового пояса
                </h3>
              </div>
              <button
                onClick={() => setShowTzModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Расписание смен автоматически пересчитывается для удобной работы в вашей стране (Филиппины, Казахстан, Украина и др.).
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {SUPPORTED_TIMEZONES.map(tz => (
                <button
                  key={tz.value}
                  onClick={() => {
                    updateUserTimezone(currentUser.id, tz.value);
                    setShowTzModal(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex items-center justify-between transition ${
                    currentUser.timezone === tz.value
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-neutral-900/60 border-neutral-800 text-slate-300 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div>{tz.label}</div>
                    <div className="text-[10px] text-slate-400">
                      Текущее время: {getCurrentTimeHHMM(tz.value)}
                    </div>
                  </div>
                  {currentUser.timezone === tz.value && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      Активен
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowTzModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-200 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
