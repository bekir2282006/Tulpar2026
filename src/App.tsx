import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { AuthPortal } from './components/auth/AuthPortal';
import { Sidebar, NavTab } from './components/navigation/Sidebar';
import { ChatterDashboard } from './components/chatter/ChatterDashboard';
import { TeamLeadDashboard } from './components/teamlead/TeamLeadDashboard';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { TeamSlotsView } from './components/owner/TeamSlotsView';
import { ScheduleView } from './components/schedule/ScheduleView';
import { ShiftHistoryView } from './components/history/ShiftHistoryView';
import { EarningsView } from './components/earnings/EarningsView';
import { BonusesView } from './components/bonuses/BonusesView';
import { FinesView } from './components/fines/FinesView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';
import {
  PlayCircle,
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Shield,
  Award,
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser, t } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  // Default tab based on role
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  useEffect(() => {
    if (currentUser?.role === 'CHATTER') {
      setCurrentTab('my_shift');
    } else {
      setCurrentTab('dashboard');
    }
  }, [currentUser?.role]);

  // If user is not logged in, show Auth Portal with 3 distinct cards
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100">
        <Header />
        <main className="flex-1">
          <AuthPortal />
        </main>
        <footer className="py-4 text-center text-xs text-slate-500 border-t border-neutral-900 bg-[#06070a]">
          <span>TULPAR Workforce Suite • Контакт: </span>
          <a href="mailto:Tulpar2026@gmail.com" className="text-amber-400 hover:underline font-mono">
            Tulpar2026@gmail.com
          </a>
        </footer>
      </div>
    );
  }

  // Render appropriate view based on active tab & role
  const renderContent = () => {
    switch (currentTab) {
      case 'my_shift':
        return <ChatterDashboard />;

      case 'dashboard':
        if (currentUser.role === 'OWNER') return <OwnerDashboard />;
        if (currentUser.role === 'TEAM_LEAD') return <TeamLeadDashboard />;
        return <ChatterDashboard />;

      case 'team':
        return <TeamSlotsView />;

      case 'schedule':
        return <ScheduleView />;

      case 'history':
        return <ShiftHistoryView />;

      case 'earnings':
        return <EarningsView />;

      case 'bonuses':
        return <BonusesView />;

      case 'fines':
        return <FinesView />;

      case 'audit':
        return <AuditLogView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <OwnerDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      <Header
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
        isMobileNavOpen={mobileNavOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 pb-24 md:pb-8">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Quick Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0a0c12]/95 backdrop-blur-md border-t border-amber-500/15 px-2 py-2 flex items-center justify-around">
        {currentUser.role === 'CHATTER' ? (
          <>
            <button
              onClick={() => setCurrentTab('my_shift')}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold ${
                currentTab === 'my_shift' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <PlayCircle className="w-4 h-4 mb-0.5" />
              <span>Смена</span>
            </button>
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold ${
                currentTab === 'schedule' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4 mb-0.5" />
              <span>График</span>
            </button>
            <button
              onClick={() => setCurrentTab('history')}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold ${
                currentTab === 'history' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <Clock className="w-4 h-4 mb-0.5" />
              <span>История</span>
            </button>
            <button
              onClick={() => setCurrentTab('earnings')}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold ${
                currentTab === 'earnings' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4 mb-0.5" />
              <span>Касса</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
                currentTab === 'dashboard' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mb-0.5" />
              <span>Панель</span>
            </button>
            {currentUser.role === 'OWNER' && (
              <button
                onClick={() => setCurrentTab('team')}
                className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
                  currentTab === 'team' ? 'text-amber-300' : 'text-slate-400'
                }`}
              >
                <Users className="w-4 h-4 mb-0.5" />
                <span>Слоты</span>
              </button>
            )}
            <button
              onClick={() => setCurrentTab('schedule')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
                currentTab === 'schedule' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <Calendar className="w-4 h-4 mb-0.5" />
              <span>Смены</span>
            </button>
            <button
              onClick={() => setCurrentTab('earnings')}
              className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-[10px] font-semibold ${
                currentTab === 'earnings' ? 'text-amber-300' : 'text-slate-400'
              }`}
            >
              <DollarSign className="w-4 h-4 mb-0.5" />
              <span>Финансы</span>
            </button>
          </>
        )}
      </div>

      <footer className="hidden md:block py-3 text-center text-xs text-slate-500 border-t border-neutral-900 bg-[#06070a]">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-[11px]">
          <span>© 2026 TULPAR Workforce Management • All Rights Reserved</span>
          <div className="flex items-center gap-3">
            <span>Контактная почта:</span>
            <a href="mailto:Tulpar2026@gmail.com" className="text-amber-400 hover:underline font-mono">
              Tulpar2026@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
