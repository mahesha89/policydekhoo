import React, { useState } from 'react';
import { IndianPolicy, InsuranceCategory } from '../types';
import type { User } from '../types';
import { ShieldCheck, Star, Building2, Check, ArrowRight, Filter, IndianRupee, Layers, Zap, Info, Sparkles, HeartPulse, Car, Shield, RefreshCw, Calculator, Building, ExternalLink, Globe, Lock, UserCheck, Crown } from 'lucide-react';
import { HealthInsurersDirectoryModal } from './HealthInsurersDirectoryModal';

interface PolicyCatalogProps {
  policies: IndianPolicy[];
  selectedCategory: InsuranceCategory;
  setSelectedCategory: (cat: InsuranceCategory) => void;
  comparedPolicyIds: string[];
  toggleComparePolicy: (id: string) => void;
  onBuyPolicy: (policy: IndianPolicy) => void;
  openAIAdvisor: () => void;
  onOpenEstimator?: () => void;
  onOpenAIProModal?: () => void;
  user: User | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const PolicyCatalog: React.FC<PolicyCatalogProps> = ({
  policies,
  selectedCategory,
  setSelectedCategory,
  comparedPolicyIds,
  toggleComparePolicy,
  onBuyPolicy,
  openAIAdvisor,
  onOpenEstimator,
  onOpenAIProModal,
  user,
  onOpenAuthModal,
}) => {

  const [searchQuery, setSearchQuery] = useState('');
  const [minCsrFilter, setMinCsrFilter] = useState<number>(0);
  const [selectedSumInsuredFilter, setSelectedSumInsuredFilter] = useState<number | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'CSR_DESC' | 'PRICE_ASC' | 'NETWORK_DESC' | 'RATING_DESC'>('CSR_DESC');
  const [isCompaniesModalOpen, setIsCompaniesModalOpen] = useState(false);

  // Filter policies
  const filteredPolicies = policies
    .filter((p) => p.category === selectedCategory)
    .filter((p) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.planName.toLowerCase().includes(q) ||
        p.insurerName.toLowerCase().includes(q) ||
        p.uin.toLowerCase().includes(q)
      );
    })
    .filter((p) => p.claimSettlementRatio >= minCsrFilter)
    .filter((p) => {
      if (selectedSumInsuredFilter === 'ALL') return true;
      return p.sumInsuredOptions.includes(selectedSumInsuredFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'CSR_DESC') return b.claimSettlementRatio - a.claimSettlementRatio;
      if (sortBy === 'PRICE_ASC') return a.baseAnnualPremium - b.baseAnnualPremium;
      if (sortBy === 'NETWORK_DESC') return b.networkCount - a.networkCount;
      if (sortBy === 'RATING_DESC') return b.starRating - a.starRating;
      return 0;
    });

  const categoriesList: { key: InsuranceCategory; label: string; icon: any; desc: string }[] = [
    { key: 'HEALTH', label: 'Health Insurance', icon: HeartPulse, desc: '100% Cashless • Zero Room Rent Limit' },
    { key: 'TERM_LIFE', label: 'Term Life Insurance', icon: ShieldCheck, desc: '₹1 Crore Cover • Sovereign Backed' },
    { key: 'CAR_MOTOR', label: 'Car Insurance', icon: Car, desc: 'Zero Dep • 10k+ Cashless Garages' },
    { key: 'BIKE_MOTOR', label: 'Bike Insurance', icon: Shield, desc: 'Instant 2-Min Digital Issuance' },
    { key: 'SUPER_TOPUP', label: 'Super Top-Up Cover', icon: RefreshCw, desc: 'High Deductible Low Premium' },
  ];

  return (
    <div className="space-y-6">
      {/* Category Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {categoriesList.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-emerald-500/80 ring-2 ring-emerald-500/20 text-white shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {isActive && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">{cat.label}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{cat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* User Authentication Status Banner */}
      {!user ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-white text-sm block">
                General Mode: Basic Policy Information Only
              </span>
              <p className="text-slate-400 text-xs">
                You are viewing basic policy overviews & prices. <strong className="text-emerald-400 font-semibold">Sign In or Register</strong> to unlock full IRDAI terms, Section 80D tax certificates, and Security Vault.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md hover:brightness-110 flex items-center justify-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuthModal('register')}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
            >
              Register
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs block">
                  {user.fullName} ({user.email})
                </span>
                {user.isAiProSubscriber ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-400 text-emerald-300 text-[10px] font-extrabold flex items-center space-x-1">
                    <Crown className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                    <span>AI Pro Pass Active (₹199/mo)</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">
                    Free Member
                  </span>
                )}
              </div>
              <span className="text-[11px] text-emerald-300">
                ABHA Health ID ({user.abhaId || 'Linked'}) • 80D Tax Statements Unlocked
              </span>
            </div>
          </div>

          {!user.isAiProSubscriber && (
            <button
              onClick={onOpenAIProModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-xs shadow-md hover:brightness-110 flex items-center space-x-1 shrink-0"
            >
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Unlock AI CSR Data (₹199/mo)</span>
            </button>
          )}
        </div>
      )}


      {/* AI Matchmaker & Premium Estimator Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-blue-950 border border-indigo-800/80 p-5 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personalized Premium Estimator Available</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Want a personalized premium estimate for your <span className="text-emerald-400">age</span>, <span className="text-amber-400">coverage</span> & <span className="text-rose-400">medical history</span>?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm">
              Use our actuarial underwriting calculator to calculate exact 18% GST pricing and Section 80D tax benefits before viewing the catalog.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onOpenEstimator && (
              <button
                onClick={onOpenEstimator}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg flex items-center space-x-2 transition"
              >
                <Calculator className="w-4 h-4" />
                <span>Open Premium Estimator</span>
              </button>
            )}

            <button
              onClick={openAIAdvisor}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 shadow-lg flex items-center space-x-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Launch AI Advisor</span>
            </button>

            <button
              onClick={() => setIsCompaniesModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 font-bold text-xs border border-indigo-700 shadow-lg flex items-center space-x-1.5 transition"
            >
              <Building className="w-3.5 h-3.5 text-indigo-400" />
              <span>IRDAI Insurers List (25)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search insurer (Star Health, HDFC ERGO, LIC), UIN, or feature..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* CSR Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">Min CSR:</span>
            <select
              value={minCsrFilter}
              onChange={(e) => setMinCsrFilter(Number(e.target.value))}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none"
            >
              <option value={0} className="bg-slate-900 text-white">All Ratios</option>
              <option value={98} className="bg-slate-900 text-white">&gt; 98% CSR</option>
              <option value={99} className="bg-slate-900 text-white">&gt; 99% Sovereign / Elite</option>
            </select>
          </div>

          {/* Sum Insured Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium">Cover Limit:</span>
            <select
              value={selectedSumInsuredFilter}
              onChange={(e) =>
                setSelectedSumInsuredFilter(
                  e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                )
              }
              className="bg-transparent text-amber-300 font-bold focus:outline-none"
            >
              <option value="ALL" className="bg-slate-900 text-white">All Coverages</option>
              <option value={500000} className="bg-slate-900 text-white">₹5 Lakhs</option>
              <option value={1000000} className="bg-slate-900 text-white">₹10 Lakhs</option>
              <option value={2500000} className="bg-slate-900 text-white">₹25 Lakhs</option>
              <option value={10000000} className="bg-slate-900 text-white">₹1 Crore (Life)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-bold focus:outline-none"
            >
              <option value="CSR_DESC" className="bg-slate-900 text-white">Highest CSR %</option>
              <option value="PRICE_ASC" className="bg-slate-900 text-white">Lowest Premium ₹</option>
              <option value="NETWORK_DESC" className="bg-slate-900 text-white">Max Cashless Hospitals</option>
              <option value="RATING_DESC" className="bg-slate-900 text-white">User Star Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Policy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPolicies.map((policy) => {
          const isCompared = comparedPolicyIds.includes(policy.id);
          const gstAmount = Math.round(policy.baseAnnualPremium * 0.18);
          const totalWithGst = policy.baseAnnualPremium + gstAmount;

          return (
            <div
              key={policy.id}
              className={`bg-slate-900/90 border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all hover:border-indigo-500/60 ${
                isCompared ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={policy.insurerLogo}
                      alt={policy.insurerName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950"
                    />
                    <div>
                      <h3 className="font-extrabold text-white text-base leading-tight">
                        {policy.planName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {policy.insurerName}
                      </p>
                    </div>
                  </div>

                  {policy.badge && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                      {policy.badge}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                  <span>IRDAI UIN: {policy.uin}</span>
                  <div className="flex items-center space-x-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{policy.starRating}</span>
                    <span className="text-slate-500 font-sans">({policy.userReviewsCount.toLocaleString('en-IN')})</span>
                  </div>
                </div>
              </div>

              {/* Key IRDAI Metrics Bar */}
              <div className="bg-slate-950/70 border-b border-slate-800/80 px-5 py-3 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Claim Ratio (CSR)
                  </p>
                  <p className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                    {policy.claimSettlementRatio}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {policy.category === 'CAR_MOTOR' || policy.category === 'BIKE_MOTOR' ? 'Garages' : 'Hospitals'}
                  </p>
                  <p className="text-sm font-extrabold text-cyan-400 font-mono mt-0.5">
                    {policy.networkCount.toLocaleString('en-IN')}+
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Solvency Ratio
                  </p>
                  <p className="text-sm font-extrabold text-amber-300 font-mono mt-0.5">
                    {policy.solvencyRatio}
                  </p>
                </div>
              </div>

              {/* Card Features List */}
              <div className="p-5 space-y-3 flex-1 text-xs">
                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                    Key Coverage Highlights
                  </p>
                  {policy.keyHighlights.slice(0, 3).map((h, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="block text-slate-500 font-medium">Room Rent Limit:</span>
                    <span className="font-semibold text-slate-200">{policy.roomRentCap}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 font-medium">Restoration:</span>
                    <span className="font-semibold text-slate-200">{policy.restoreBenefit}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Pricing & Buy Actions */}
              <div className="p-5 bg-slate-950/90 border-t border-slate-800 space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Starting Premium</p>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-xl font-black text-white font-mono">
                        ₹{totalWithGst.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-400 font-sans">/year</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      ₹{policy.baseAnnualPremium.toLocaleString('en-IN')} base + 18% GST (₹{gstAmount.toLocaleString('en-IN')})
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500">Monthly EMI</p>
                    <p className="text-sm font-bold text-emerald-400 font-mono">
                      ₹{policy.baseMonthlyPremium.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleComparePolicy(policy.id)}
                    className={`px-3 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center space-x-1.5 transition ${
                      isCompared
                        ? 'bg-indigo-950 border-indigo-600 text-indigo-300'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>{isCompared ? 'Compared' : 'Compare'}</span>
                  </button>

                  <button
                    onClick={() => onBuyPolicy(policy)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-1.5 transition active:scale-95 group"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    <span>Select & Route to Portal</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPolicies.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Info className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">No policies match your filters</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your Claim Settlement Ratio (CSR) filter, sum insured limit, or search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setMinCsrFilter(0);
              setSelectedSumInsuredFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {isCompaniesModalOpen && (
        <HealthInsurersDirectoryModal
          onClose={() => setIsCompaniesModalOpen(false)}
          onSelectInsurerForCatalog={(insurerName) => {
            setSearchQuery(insurerName);
          }}
        />
      )}
    </div>
  );
};
