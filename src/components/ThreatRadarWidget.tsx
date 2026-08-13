import React, { useState } from 'react';
import { ThreatAlert } from '../types';
import { ShieldAlert, AlertTriangle, ShieldCheck, Check, ArrowRight, ExternalLink } from 'lucide-react';

interface ThreatRadarWidgetProps {
  alerts: ThreatAlert[];
}

export const ThreatRadarWidget: React.FC<ThreatRadarWidgetProps> = ({ alerts }) => {
  const [appliedMitigation, setAppliedMitigation] = useState<Record<string, boolean>>({});

  const toggleMitigation = (id: string) => {
    setAppliedMitigation((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-rose-400 px-3 py-1 rounded-full bg-rose-950 border border-rose-800 flex items-center w-fit">
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" /> Early Warning Threat Radar & Vulnerability Feed
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Active Peril Advisories & Actuarial Alerts</h1>
            <p className="text-sm text-slate-300">
              Live geopolitical, cyber zero-day, and weather hazard advisories impacting active policyholder assets.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Protected Asset Nodes</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">1,480 / 1,480</span>
          </div>
        </div>
      </div>

      {/* Threats List */}
      <div className="space-y-4">
        {alerts.map((alert) => {
          const isApplied = appliedMitigation[alert.id];
          return (
            <div
              key={alert.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                        : 'bg-amber-950 text-amber-300 border-amber-700'
                    }`}
                  >
                    {alert.severity} ADVISORY
                  </span>
                  <span className="text-xs font-mono text-slate-400">{alert.date}</span>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  Affected Policies: <strong className="text-white">{alert.affectedPoliciesCount}</strong>
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{alert.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1 font-mono">
                  <span>Sector: {alert.sector}</span>
                  <span>•</span>
                  <span>Region: {alert.region}</span>
                </div>
              </div>

              {/* Required Mitigation */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5" /> Required Actuarial Mitigation Protocol
                  </span>
                  {isApplied && (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Mitigation Applied
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  "{alert.mitigationSteps}"
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => toggleMitigation(alert.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition ${
                      isApplied
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Mitigation Verified Clean</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm Mitigation Protocol Execution</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
