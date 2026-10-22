import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Mail,
  Globe,
  Percent,
  ShieldCheck,
  Check,
  Save,
} from 'lucide-react';
import { SUPPORTED_TIMEZONES } from '../../utils/time';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, t } = useApp();

  const [orgName, setOrgName] = useState(settings.name);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [baseTimezone, setBaseTimezone] = useState(settings.baseTimezone);
  const [defaultCommission, setDefaultCommission] = useState(settings.defaultCommission.toString());

  const [tlSalaries, setTlSalaries] = useState(settings.teamLeadPermissions.canViewSalaries);
  const [tlFines, setTlFines] = useState(settings.teamLeadPermissions.canAssignFines);
  const [tlSchedule, setTlSchedule] = useState(settings.teamLeadPermissions.canEditSchedule);
  const [tlReports, setTlReports] = useState(settings.teamLeadPermissions.canViewReports);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: orgName.trim() || 'TULPAR',
      supportEmail: supportEmail.trim() || 'Tulpar2026@gmail.com',
      baseTimezone,
      defaultCommission: parseFloat(defaultCommission) || 25,
      currency: 'USD',
      teamLeadPermissions: {
        canViewSalaries: tlSalaries,
        canAssignFines: tlFines,
        canEditSchedule: tlSchedule,
        canViewReports: tlReports,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          <span>{t.settingsTitle}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.settingsSubtitle}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{t.settingsSavedNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">

        {/* General Organization Parameters */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Параметры организации</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.orgName}
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.supportEmailLabel}
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.baseOrgTimezone}
              </label>
              <select
                value={baseTimezone}
                onChange={e => setBaseTimezone(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                {SUPPORTED_TIMEZONES.map(tz => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.defaultCommissionRate}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={defaultCommission}
                  onChange={e => setDefaultCommission(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs font-mono">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Lead Permissions */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{t.tlPermissionsTitle}</span>
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={tlSalaries}
                onChange={e => setTlSalaries(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-800 border-neutral-700"
              />
              <div className="text-xs">
                <div className="font-semibold text-white">{t.tlCanViewSalaries}</div>
                <div className="text-slate-400 text-[11px]">Тимлид видит суммы заработка подчинённых чаттеров</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={tlFines}
                onChange={e => setTlFines(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-800 border-neutral-700"
              />
              <div className="text-xs">
                <div className="font-semibold text-white">{t.tlCanAssignFines}</div>
                <div className="text-slate-400 text-[11px]">Тимлид может фиксировать нарушения и выписывать штрафы</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={tlSchedule}
                onChange={e => setTlSchedule(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-800 border-neutral-700"
              />
              <div className="text-xs">
                <div className="font-semibold text-white">{t.tlCanEditSchedule}</div>
                <div className="text-slate-400 text-[11px]">Тимлид может назначать и корректировать смены своей группы</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 transition cursor-pointer">
              <input
                type="checkbox"
                checked={tlReports}
                onChange={e => setTlReports(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-neutral-800 border-neutral-700"
              />
              <div className="text-xs">
                <div className="font-semibold text-white">{t.tlCanViewReports}</div>
                <div className="text-slate-400 text-[11px]">Тимлид может просматривать сводные отчеты активности</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-3 rounded-xl gold-gradient-bg text-[#090A0F] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{t.saveSettingsButton}</span>
        </button>

      </form>

    </div>
  );
};
