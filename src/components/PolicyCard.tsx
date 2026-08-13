import React, { useState } from 'react';
import { PolicyItem } from '../types';
import { ShieldCheck, FileText, AlertCircle, PlusCircle, CheckCircle2, ChevronDown, ChevronUp, Lock, Building, Landmark, Compass, Award } from 'lucide-react';

interface PolicyCardProps {
  policy: PolicyItem;
  onOpenCOI: (policy: PolicyItem) => void;
  onFileClaim: (policy: PolicyItem) => void;
  onAddEndorsement: (policy: PolicyItem) => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  policy,
  onOpenCOI,
  onFileClaim,
  onAddEndorsement,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CYBER_SECURITY':
        return <Lock className="w-5 h-5 text-cyan-400" />;
      case 'COMMERCIAL_PROPERTY':
        return <Building className="w-5 h-5 text-emerald-400" />;
      case 'DIRECTORS_OFFICERS':
        return <Landmark className="w-5 h-5 text-amber-400" />;
      case 'SUPPLY_CHAIN':
        return <Compass className="w-5 h-5 text-indigo-400" />;
      default:
        return <Award className="w-5 h-5 text-purple-400" />;
    }
  };

  const formattedCoverage = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(policy.coverageLimit);
  const formattedPremium = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(policy.annualPremium);
  const formattedDeductible = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(policy.deductible);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all duration-300">
      {/* Policy Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
            {getTypeIcon(policy.type)}
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold tracking-wide text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800">
                {policy.policyNumber}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                policy.status === 'ACTIVE'
                  ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700'
                  : 'bg-amber-900/60 text-amber-300 border border-amber-700'
              }`}>
                {policy.status.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{policy.title}</h3>
            <p className="text-xs text-slate-400 font-medium">{policy.companyName} • Policyholder: {policy.holderName}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => onOpenCOI(policy)}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Issue COI ({policy.coiCount})</span>
          </button>

          <button
            onClick={() => onFileClaim(policy)}
            className="px-3.5 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-200 text-xs font-semibold flex items-center space-x-1.5 border border-rose-800 transition shadow-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-5 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Total Coverage Limit</span>
          <p className="text-xl font-extrabold text-white mt-0.5 font-mono">{formattedCoverage}</p>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Annual Premium</span>
          <p className="text-xl font-extrabold text-emerald-400 mt-0.5 font-mono">{formattedPremium}</p>
          <span className="text-[10px] text-slate-400">${Math.round(policy.monthlyPremium)}/mo</span>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Policy Deductible</span>
          <p className="text-base font-bold text-slate-200 mt-1 font-mono">{formattedDeductible}</p>
        </div>
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">Actuarial Risk Score</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-lg font-bold text-emerald-400 font-mono">{policy.riskScore}/100</span>
            <div className="flex-1 h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                style={{ width: `${policy.riskScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Perils Preview & Compliance Level */}
      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-300">Audited Compliance Standard:</span>
          <span className="text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{policy.complianceLevel}</span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 self-start md:self-auto"
        >
          <span>{isExpanded ? 'Hide Endorsements & Schedule' : 'View Perils & Active Endorsements'}</span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Perils & Endorsements Section */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-800/80 bg-slate-950/60 rounded-xl p-4 space-y-4">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Insured Perils & Guarantee Terms</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {policy.keyPerilsCovered.map((peril, idx) => (
                <div key={idx} className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{peril}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400">Policy Endorsements ({policy.endorsements.length})</h4>
              <button
                onClick={() => onAddEndorsement(policy)}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Request Policy Endorsement</span>
              </button>
            </div>

            {policy.endorsements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No custom endorsement riders attached. Click request to add high-limit ransomware, flood, or international shipping riders.</p>
            ) : (
              <div className="space-y-2">
                {policy.endorsements.map((end) => (
                  <div key={end.id} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{end.title}</span>
                      <span className="text-slate-400 ml-2 font-mono">Limit: {end.limit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold font-mono">+${end.additionalPremium}/yr</span>
                      <span className="block text-[10px] text-slate-400">Effective: {end.effectiveDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
