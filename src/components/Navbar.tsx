import React from 'react';
import type { User } from '../types';
import { Shield, FileText, Calculator, PhoneCall, Award, UserCheck, ShieldCheck, Sparkles, Building2, Layers, Search, IndianRupee, Lock, LogOut, Activity, Crown } from 'lucide-react';

export type MainTabType = 'estimator' | 'catalog' | 'compare' | 'my-policies' | 'claim-settlement' | 'hospitals' | 'security-vault' | 'ai-advisor' | 'omni-simulator';

interface NavbarProps {
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  comparedCount: number;
  boughtCount: number;
  openAIAdvisor: () => void;
  openCOIModal: () => void;
  openAIProModal: () => void;
  user: User | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  comparedCount,
  boughtCount,
  openAIAdvisor,
  openCOIModal,
  openAIProModal,
  user,
  onOpenAuthModal,
  onLogout,
}) => {

  return (
    <header className="bg-slate-950 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-2xl">
      {/* IRDAI Official Regulation Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" />
            IRDAI Compliant Portal | 100% Verified Indian Insurers
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">
            CSR Verified Track Record: <strong className="text-emerald-300 font-mono">99.2% (LIC) • 99.1% (Star Health) • 98.8% (HDFC ERGO)</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={openAIProModal}
            className={`flex items-center space-x-1.5 px-3 py-0.5 rounded-full font-extrabold text-[11px] shadow-md transition ${
              user?.isAiProSubscriber
                ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 hover:brightness-110'
            }`}
          >
            <Crown className={`w-3.5 h-3.5 ${user?.isAiProSubscriber ? 'text-emerald-400 fill-emerald-400' : 'fill-slate-950 text-slate-950'}`} />
            <span>{user?.isAiProSubscriber ? 'AI Pro Active (₹199/mo)' : 'AI Pro Data Pass ₹199/mo'}</span>
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold text-[11px] shadow-sm hover:brightness-110 transition"
          >
            <Calculator className="w-3 h-3 text-emerald-400" />
            <span>Premium Estimator</span>
          </button>

          <button
            onClick={openAIAdvisor}
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-[11px] shadow-sm hover:brightness-110 transition"
          >
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span>AI Policy Matchmaker</span>
          </button>

          <button
            onClick={openCOIModal}
            className="hidden md:flex items-center space-x-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] border border-slate-700 transition"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>IRDAI Certificate (COI)</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('catalog')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-950/50 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-mono">
                Policy<span className="text-emerald-400">Dekho</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                India
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-0.5">
              Compare Insurance Policies & Claim Settlement Ratios
            </p>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('omni-simulator')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'omni-simulator'
                ? 'bg-indigo-950 text-indigo-300 shadow-md border border-indigo-500/50 font-extrabold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Omni Claim Simulator</span>
            <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-indigo-900 text-indigo-200 border border-indigo-700">
              NEW
            </span>
          </button>

          <button
            onClick={() => setActiveTab('estimator')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'estimator'
                ? 'bg-emerald-950 text-emerald-300 shadow-md border border-emerald-500/50 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Premium Estimator</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'catalog'
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Compare & Buy</span>
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 relative ${
              activeTab === 'compare'
                ? 'bg-slate-800 text-indigo-400 shadow-md border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Policy Matrix</span>
            {comparedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center -ml-1">
                {comparedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('claim-settlement')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'claim-settlement'
                ? 'bg-slate-800 text-emerald-400 shadow-md border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>IRDAI CSR Leaderboard</span>
          </button>

          <button
            onClick={() => setActiveTab('hospitals')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'hospitals'
                ? 'bg-slate-800 text-cyan-400 shadow-md border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Cashless Hospitals</span>
          </button>

          <button
            onClick={() => setActiveTab('security-vault')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
              activeTab === 'security-vault'
                ? 'bg-emerald-950/80 text-emerald-300 shadow-md border border-emerald-500/50 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Lock className={`w-4 h-4 ${!user ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span>Security Vault</span>
            {!user && (
              <span className="text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                LOCKED
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('my-policies')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 relative ${
              activeTab === 'my-policies'
                ? 'bg-emerald-950/80 text-emerald-300 shadow-md border border-emerald-800'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>My Active Policies</span>
            {boughtCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center -ml-1">
                {boughtCount}
              </span>
            )}
          </button>
        </nav>

        {/* Desktop User Authentication Button / Profile Pill */}
        <div className="hidden lg:flex items-center ml-2">
          {!user ? (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950/50 flex items-center space-x-1.5 transition active:scale-95"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Sign In / Register</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2.5 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 shadow-md">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                {user.fullName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-bold text-white block leading-tight max-w-[100px] truncate">
                    {user.fullName}
                  </span>
                  {user.isAiProSubscriber && (
                    <Crown className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" title="AI Pro Subscriber (₹199/mo)" />
                  )}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold flex items-center space-x-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>{user.isAiProSubscriber ? 'AI Pro Pass' : 'Verified User'}</span>
                </span>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="ml-1 p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu triggers */}
        <div className="lg:hidden flex items-center space-x-2">
          {!user ? (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-extrabold flex items-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>Sign In</span>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-1"
            >
              <span>{user.fullName.split(' ')[0]}</span>
              <LogOut className="w-3 h-3 text-rose-400" />
            </button>
          )}

          <button
            onClick={() => setActiveTab('estimator')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-extrabold flex items-center space-x-1"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estimator</span>
          </button>
        </div>

      </div>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-2 py-2 flex items-center justify-around text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('estimator')}
          className={`px-2.5 py-1.5 rounded font-bold shrink-0 ${activeTab === 'estimator' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' : 'text-slate-400'}`}
        >
          Estimator
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-2.5 py-1.5 rounded shrink-0 ${activeTab === 'catalog' ? 'bg-slate-800 text-emerald-400 font-bold' : 'text-slate-400'}`}
        >
          Policies
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-2.5 py-1.5 rounded shrink-0 ${activeTab === 'compare' ? 'bg-slate-800 text-indigo-400 font-bold' : 'text-slate-400'}`}
        >
          Compare ({comparedCount})
        </button>
        <button
          onClick={() => setActiveTab('claim-settlement')}
          className={`px-2.5 py-1.5 rounded shrink-0 ${activeTab === 'claim-settlement' ? 'bg-slate-800 text-amber-300 font-bold' : 'text-slate-400'}`}
        >
          CSR Ratios
        </button>
        <button
          onClick={() => setActiveTab('hospitals')}
          className={`px-2.5 py-1.5 rounded shrink-0 ${activeTab === 'hospitals' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
        >
          Hospitals
        </button>
        <button
          onClick={() => setActiveTab('security-vault')}
          className={`px-2.5 py-1.5 rounded shrink-0 ${activeTab === 'security-vault' ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/50' : 'text-slate-400'}`}
        >
          Vault
        </button>
        <button
          onClick={() => setActiveTab('my-policies')}
          className={`px-2.5 py-1.5 rounded shrink-0 ${activeTab === 'my-policies' ? 'bg-emerald-950 text-emerald-300 font-bold' : 'text-slate-400'}`}
        >
          My Cover ({boughtCount})
        </button>
      </div>
    </header>
  );
};
