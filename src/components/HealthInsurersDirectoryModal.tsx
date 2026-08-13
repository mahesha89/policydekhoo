import React, { useState } from 'react';
import { ALL_HEALTH_INSURANCE_COMPANIES } from '../data/mockData';
import { HealthInsuranceCompany } from '../types';
import {
  Building2,
  X,
  Search,
  ShieldCheck,
  Phone,
  Globe,
  MapPin,
  CheckCircle2,
  Award,
  Filter,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HealthInsurersDirectoryModalProps {
  onClose: () => void;
  onSelectInsurerForCatalog?: (insurerName: string) => void;
}

export const HealthInsurersDirectoryModal: React.FC<HealthInsurersDirectoryModalProps> = ({
  onClose,
  onSelectInsurerForCatalog,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    'ALL' | 'STANDALONE_HEALTH' | 'GENERAL_PUBLIC' | 'GENERAL_PRIVATE'
  >('ALL');

  const filteredCompanies = ALL_HEALTH_INSURANCE_COMPANIES.filter((company) => {
    if (selectedTypeFilter !== 'ALL' && company.type !== selectedTypeFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      company.name.toLowerCase().includes(q) ||
      company.shortName.toLowerCase().includes(q) ||
      company.headquarters.toLowerCase().includes(q) ||
      company.irdaiRegNo.includes(q) ||
      company.flagshipPlans.some((p) => p.toLowerCase().includes(q))
    );
  });

  const sahiCount = ALL_HEALTH_INSURANCE_COMPANIES.filter(
    (c) => c.type === 'STANDALONE_HEALTH'
  ).length;
  const psuCount = ALL_HEALTH_INSURANCE_COMPANIES.filter(
    (c) => c.type === 'GENERAL_PUBLIC'
  ).length;
  const privateCount = ALL_HEALTH_INSURANCE_COMPANIES.filter(
    (c) => c.type === 'GENERAL_PRIVATE'
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header Bar */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official IRDAI Directory • 25 Registered Health Insurers</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Complete List of Health Insurance Companies in India
            </h2>
            <p className="text-xs text-slate-300">
              IRDAI licensed Standalone Health Insurers (SAHI), Public Sector Undertakings (PSUs), and Private General Insurance Providers.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-850 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company name, IRDAI reg no, headquarters, or plan name (e.g. Star, Optima, Niva, New India)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedTypeFilter === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Insurers ({ALL_HEALTH_INSURANCE_COMPANIES.length})
            </button>

            <button
              onClick={() => setSelectedTypeFilter('STANDALONE_HEALTH')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedTypeFilter === 'STANDALONE_HEALTH'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Standalone SAHI ({sahiCount})
            </button>

            <button
              onClick={() => setSelectedTypeFilter('GENERAL_PUBLIC')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedTypeFilter === 'GENERAL_PUBLIC'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              PSU Govt ({psuCount})
            </button>

            <button
              onClick={() => setSelectedTypeFilter('GENERAL_PRIVATE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                selectedTypeFilter === 'GENERAL_PRIVATE'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Private General ({privateCount})
            </button>
          </div>
        </div>

        {/* Company Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCompanies.map((company) => {
              return (
                <div
                  key={company.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                >
                  <div className="space-y-3">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-800 bg-slate-900 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                            IRDAI REG #{company.irdaiRegNo}
                          </span>
                          <h3 className="font-extrabold text-sm text-white leading-tight group-hover:text-emerald-400 transition">
                            {company.name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-bold">
                        {company.irdaBadge}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-medium">
                        {company.type === 'STANDALONE_HEALTH'
                          ? 'SAHI Insurer'
                          : company.type === 'GENERAL_PUBLIC'
                          ? 'Public Sector PSU'
                          : 'Private General'}
                      </span>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">CSR %</span>
                        <span className="text-xs font-black text-emerald-400">
                          {company.claimSettlementRatio}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Cashless</span>
                        <span className="text-xs font-black text-white">
                          {(company.cashlessHospitalsCount / 1000).toFixed(1)}k+
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block uppercase">Solvency</span>
                        <span className="text-xs font-black text-amber-300">
                          {company.solvencyRatio}
                        </span>
                      </div>
                    </div>

                    {/* Contact & HQ */}
                    <div className="space-y-1 text-xs text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">HQ: {company.headquarters}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">Toll-Free: {company.customerCare}</span>
                      </div>
                    </div>

                    {/* Flagship Plans */}
                    <div className="space-y-1 border-t border-slate-850 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Flagship Health Plans
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {company.flagshipPlans.map((plan, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800"
                          >
                            {plan}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  {onSelectInsurerForCatalog && (
                    <button
                      onClick={() => {
                        onSelectInsurerForCatalog(company.shortName);
                        onClose();
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Filter Policies in Catalog</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Building2 className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <p className="text-sm">No health insurance company found matching "{searchQuery}".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
