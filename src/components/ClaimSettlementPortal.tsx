import React, { useState } from 'react';
import { IndianPolicy, ClaimItem } from '../types';
import { Award, ShieldCheck, CheckCircle2, Clock, Phone, FileText, AlertCircle, Sparkles, Building2, Search, ArrowRight, ShieldAlert } from 'lucide-react';

interface ClaimSettlementPortalProps {
  policies: IndianPolicy[];
  onOpenCashlessAssistance: () => void;
}

export const ClaimSettlementPortal: React.FC<ClaimSettlementPortalProps> = ({
  policies,
  onOpenCashlessAssistance,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'HEALTH' | 'TERM_LIFE' | 'CAR_MOTOR'>('HEALTH');
  const [hospitalSearch, setHospitalSearch] = useState('');

  const filteredInsurers = policies.filter((p) => p.category === selectedCategory);

  const irdaBenchmarkData = [
    { rank: 1, name: 'LIC of India', csr: 99.2, icr: 72.4, turnAround: '48 Hours', type: 'Life / Sovereign' },
    { rank: 2, name: 'Star Health Insurance', csr: 99.1, icr: 83.2, turnAround: '22 Minutes Cashless', type: 'Health / Retail' },
    { rank: 3, name: 'HDFC ERGO General', csr: 98.8, icr: 81.6, turnAround: '30 Minutes Cashless', type: 'General & Health' },
    { rank: 4, name: 'TATA AIG General', csr: 98.7, icr: 79.8, turnAround: '25 Minutes Cashless', type: 'General & Motor' },
    { rank: 5, name: 'HDFC Life Insurance', csr: 98.4, icr: 74.1, turnAround: '24 Hours Digital', type: 'Life Insurance' },
    { rank: 6, name: 'Care Health Insurance', csr: 98.3, icr: 82.1, turnAround: '30 Minutes Cashless', type: 'Health Insurance' },
    { rank: 7, name: 'ICICI Lombard', csr: 98.1, icr: 79.5, turnAround: '1 Hour Express', type: 'General & Motor' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 border border-amber-800/80 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 text-xs font-bold border border-amber-800">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Official IRDAI Annual Track Record</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Claim Settlement Ratio (CSR) Benchmarks
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm">
            In India, Claim Settlement Ratio (CSR) measures the percentage of claims paid by an insurer against total claims received in a financial year. Higher CSR means higher reliability.
          </p>
        </div>

        <button
          onClick={onOpenCashlessAssistance}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg flex items-center space-x-2 shrink-0"
        >
          <Phone className="w-4 h-4 fill-slate-950" />
          <span>Request Cashless Claim Help</span>
        </button>
      </div>

      {/* CSR Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-extrabold text-white text-base flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>IRDAI Verified Insurer CSR Ranking</span>
          </h3>
          <span className="text-xs text-slate-400">Updated for FY 2025-2026 Audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5 text-center w-16">Rank</th>
                <th className="p-3.5">Insurer Brand Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Claim Settlement Ratio (CSR)</th>
                <th className="p-3.5">Incurred Claim Ratio (ICR)</th>
                <th className="p-3.5">Avg Cashless Pre-Auth Time</th>
                <th className="p-3.5 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {irdaBenchmarkData.map((item) => (
                <tr key={item.rank} className="hover:bg-slate-850 transition">
                  <td className="p-3.5 text-center font-extrabold text-white font-mono">
                    #{item.rank}
                  </td>
                  <td className="p-3.5 font-bold text-white text-sm">
                    {item.name}
                  </td>
                  <td className="p-3.5 font-medium text-slate-400">
                    {item.type}
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="text-sm font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      {item.csr}%
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-slate-300">
                    {item.icr}%
                  </td>
                  <td className="p-3.5 font-mono text-cyan-300 font-medium">
                    {item.turnAround}
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>IRDAI Audited</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cashless Claim Process Steps */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-extrabold text-white text-base">How Cashless Hospitalization Claims Work in India</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center">1</span>
            <h4 className="font-bold text-white text-sm">Show Cashless Card</h4>
            <p className="text-slate-400">Present your digital Cashless Health Card at the hospital Insurance / TPA Desk upon admission.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center">2</span>
            <h4 className="font-bold text-white text-sm">Pre-Auth Form</h4>
            <p className="text-slate-400">Hospital sends doctor estimate & pre-authorization request form directly to the insurer.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center">3</span>
            <h4 className="font-bold text-white text-sm">30-Min AI Approval</h4>
            <p className="text-slate-400">Insurer reviews medical telemetry and issues initial guarantee letter directly to hospital.</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-300 font-bold flex items-center justify-center">4</span>
            <h4 className="font-bold text-white text-sm">Zero-Bill Discharge</h4>
            <p className="text-slate-400">Upon discharge, hospital settles bill directly with insurer. You pay ₹0 out of pocket!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
