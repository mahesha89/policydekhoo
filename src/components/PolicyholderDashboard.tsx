import React, { useState } from 'react';
import { PolicyItem } from '../types';
import { PolicyCard } from './PolicyCard';
import { Shield, ShieldAlert, FileText, Plus, Search, Filter, Briefcase, TrendingUp, CheckCircle } from 'lucide-react';

interface PolicyholderDashboardProps {
  policies: PolicyItem[];
  onOpenCOI: (policy: PolicyItem) => void;
  onFileClaim: (policy: PolicyItem) => void;
  onNavigateTab: (tab: 'products' | 'underwriting' | 'claims') => void;
  onAddEndorsement: (policy: PolicyItem, title: string, limit: string, premium: number) => void;
}

export const PolicyholderDashboard: React.FC<PolicyholderDashboardProps> = ({
  policies,
  onOpenCOI,
  onFileClaim,
  onNavigateTab,
  onAddEndorsement,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeEndorsementPolicy, setActiveEndorsementPolicy] = useState<PolicyItem | null>(null);

  // Endorsement form modal state
  const [endorsementTitle, setEndorsementTitle] = useState('');
  const [endorsementLimit, setEndorsementLimit] = useState('$5,000,000');
  const [endorsementPremium, setEndorsementPremium] = useState(15000);

  const filteredPolicies = policies.filter((p) => {
    const matchesFilter = selectedFilter === 'ALL' || p.type === selectedFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalCoverage = policies.reduce((acc, p) => acc + p.coverageLimit, 0);
  const totalPremium = policies.reduce((acc, p) => acc + p.annualPremium, 0);
  const totalCOIs = policies.reduce((acc, p) => acc + p.coiCount, 0);
  const avgRiskScore = Math.round(policies.reduce((acc, p) => acc + p.riskScore, 0) / (policies.length || 1));

  const handleEndorsementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEndorsementPolicy || !endorsementTitle) return;

    onAddEndorsement(activeEndorsementPolicy, endorsementTitle, endorsementLimit, endorsementPremium);
    setActiveEndorsementPolicy(null);
    setEndorsementTitle('');
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Headline & Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-920 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-xs font-mono font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-800">
                Institutional Syndicate Portfolio
              </span>
              <span className="text-xs text-slate-400">Policy ID Master Index: #AGS-MAIN-882</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Risk & Policy Command Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Real-time actuarial coverage tracking, automated certificate issuance, and instant AI-supported claims processing for Apex Technologies Group.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('products')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/60 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Bind New Policy</span>
            </button>

            <button
              onClick={() => onNavigateTab('underwriting')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold text-xs flex items-center space-x-2 border border-slate-700 transition"
            >
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Run AI Risk Audit</span>
            </button>
          </div>
        </div>

        {/* Portfolio Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Bound Exposure</span>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">
              ${(totalCoverage / 1000000).toFixed(1)}M
            </p>
            <span className="text-[11px] text-emerald-400 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> 100% Solvency Backed
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Annual Premium Total</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              ${(totalPremium / 1000).toFixed(0)}k <span className="text-xs text-slate-400 font-normal">/yr</span>
            </p>
            <span className="text-[11px] text-slate-400 mt-1 block font-mono">
              ${Math.round(totalPremium / 12).toLocaleString()}/month
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Actuarial Risk Rating</span>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">
              {avgRiskScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </p>
            <span className="text-[11px] text-emerald-400 flex items-center mt-1">
              <CheckCircle className="w-3 h-3 mr-1" /> Tier 1 Preferred
            </span>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Certificates Issued</span>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">
              {totalCOIs} <span className="text-xs font-normal text-slate-400">COIs</span>
            </p>
            <span className="text-[11px] text-cyan-400 mt-1 block font-mono">
              Instant B2B Verifiable
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center mr-2">
            <Filter className="w-3.5 h-3.5 mr-1" /> Filter:
          </span>
          {[
            { key: 'ALL', label: 'All Lines' },
            { key: 'CYBER_SECURITY', label: 'Cyber Liability' },
            { key: 'COMMERCIAL_PROPERTY', label: 'Property' },
            { key: 'DIRECTORS_OFFICERS', label: 'D&O Board' },
            { key: 'SUPPLY_CHAIN', label: 'Supply Chain' },
            { key: 'LUXURY_ASSET', label: 'High-Value Fleet' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setSelectedFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedFilter === item.key
                  ? 'bg-emerald-600 text-white font-semibold shadow'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policy #, peril, or line..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Policies List */}
      <div className="space-y-6">
        {filteredPolicies.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No policies found matching criteria</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your filter or search query, or bind a new custom enterprise coverage policy.
            </p>
          </div>
        ) : (
          filteredPolicies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onOpenCOI={onOpenCOI}
              onFileClaim={onFileClaim}
              onAddEndorsement={(p) => setActiveEndorsementPolicy(p)}
            />
          ))
        )}
      </div>

      {/* Policy Endorsement Modal */}
      {activeEndorsementPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Request Endorsement Rider</h3>
              <button
                onClick={() => setActiveEndorsementPolicy(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mt-3">
              Policy: <strong className="text-emerald-400 font-mono">{activeEndorsementPolicy.policyNumber}</strong> ({activeEndorsementPolicy.title})
            </p>

            <form onSubmit={handleEndorsementSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Endorsement Title & Scope</label>
                <input
                  type="text"
                  required
                  value={endorsementTitle}
                  onChange={(e) => setEndorsementTitle(e.target.value)}
                  placeholder="e.g. Zero-Trust Ransomware Rider ($5M Limit)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Coverage Limit Rider</label>
                  <select
                    value={endorsementLimit}
                    onChange={(e) => setEndorsementLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="$2,500,000">$2,500,000</option>
                    <option value="$5,000,000">$5,000,000</option>
                    <option value="$10,000,000">$10,000,000</option>
                    <option value="$25,000,000">$25,000,000</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Est. Additional Premium</label>
                  <input
                    type="number"
                    value={endorsementPremium}
                    onChange={(e) => setEndorsementPremium(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setActiveEndorsementPolicy(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-lg"
                >
                  Submit Rider for Binding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
