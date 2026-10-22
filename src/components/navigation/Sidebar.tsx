import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Users,
  DollarSign,
  Award,
  ShieldAlert,
  Shield,
  Settings,
  LogOut,
  PlayCircle,
  HelpCircle,
  Mail,
  ChevronRight,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'my_shift'
  | 'team'
  | 'schedule'
  | 'history'
  | 'earnings'
  | 'bonuses'
  | 'fines'
  | 'audit'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, t, logoutUser, settings } = useApp();

  const role = currentUser?.role;

  // Determine navigation items based on role
  const getNavItems = () => {
    if (role === 'CHATTER') {
      return [
        { id: 'my_shift' as NavTab, label: t.nav_my_shift, icon: PlayCircle, badge: 'LIVE' },
        { id: 'schedule' as NavTab, label: t.nav_schedule, icon: Calendar },
        { id: 'history' as NavTab, label: t.nav_shift_history, icon: Clock },
        { id: 'earnings' as NavTab, label: t.nav_earnings, icon: DollarSign },
        { id: 'bonuses' as NavTab, label: t.nav_bonuses, icon: Award },
        { id: 'fines' as NavTab, label: t.nav_fines, icon: ShieldAlert },
      ];
    }

    if (role === 'TEAM_LEAD') {
      return [
        { id: 'dashboard' as NavTab, label: t.nav_dashboard, icon: LayoutDashboard },
        { id: 'schedule' as NavTab, label: t.nav_schedule, icon: Calendar },
        { id: 'history' as NavTab, label: t.nav_shift_history, icon: Clock },
        ...(settings.teamLeadPermissions.canViewSalaries
          ? [{ id: 'earnings' as NavTab, label: t.nav_earnings, icon: DollarSign }]
          : []),
        { id: 'bonuses' as NavTab, label: t.nav_bonuses, icon: Award },
        ...(settings.teamLeadPermissions.canAssignFines
          ? [{ id: 'fines' as NavTab, label: t.nav_fines, icon: ShieldAlert }]
          : []),
      ];
    }

    // OWNER gets everything
    return [
      { id: 'dashboard' as NavTab, label: t.nav_dashboard, icon: LayoutDashboard },
      { id: 'team' as NavTab, label: t.nav_team, icon: Users, badge: 'Slots' },
      { id: 'schedule' as NavTab, label: t.nav_schedule, icon: Calendar },
      { id: 'history' as NavTab, label: t.nav_shift_history, icon: Clock },
      { id: 'earnings' as NavTab, label: t.nav_earnings, icon: DollarSign },
      { id: 'bonuses' as NavTab, label: t.nav_bonuses, icon: Award },
      { id: 'fines' as NavTab, label: t.nav_fines, icon: ShieldAlert },
      { id: 'audit' as NavTab, label: t.nav_audit_log, icon: Shield },
      { id: 'settings' as NavTab, label: t.nav_settings, icon: Settings },
    ];
  };

  const navItems = getNavItems();

  const handleTabClick = (tabId: NavTab) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-[#0a0c12]/95 backdrop-blur-md border-r border-amber-500/15 p-4 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">

          {/* User profile capsule in sidebar */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-xl object-cover border border-amber-500/30 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                  <span>{t[`role_${currentUser.role}`]}</span>
                  {currentUser.slotNumber && <span>#{currentUser.slotNumber}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Nav Items List */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition ${
                        isActive ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        isActive
                          ? 'bg-amber-400 text-[#090A0F]'
                          : 'bg-neutral-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-neutral-800/80 space-y-3">
          <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/60 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300/90 font-semibold">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Служба поддержки:</span>
            </div>
            <a
              href="mailto:Tulpar2026@gmail.com"
              className="text-slate-300 hover:text-amber-300 block font-mono text-[10px] truncate"
            >
              Tulpar2026@gmail.com
            </a>
          </div>

          <button
            onClick={logoutUser}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-neutral-900 hover:bg-red-500/15 text-slate-400 hover:text-red-300 border border-neutral-800 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
