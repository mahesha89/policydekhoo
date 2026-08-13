import React from 'react';
import { BoughtPolicy } from '../types';
import { ShieldCheck, UserCheck, Download, FileText, PhoneCall, Calendar, IndianRupee, Sparkles, Building2, CheckCircle2 } from 'lucide-react';

interface MyPoliciesViewProps {
  boughtPolicies: BoughtPolicy[];
  onFileClaim: (policy: BoughtPolicy) => void;
  openCOIModal: () => void;
  onBrowseCatalog: () => void;
}

export const MyPoliciesView: React.FC<MyPoliciesViewProps> = ({
  boughtPolicies,
  onFileClaim,
  openCOIModal,
  onBrowseCatalog,
}) => {
  if (boughtPolicies.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto">
          <UserCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">No Active Policies Purchased Yet</h2>
        <p className="text-slate-400 text-xs sm:text-sm">
          Browse top Indian insurance policies from Star Health, HDFC ERGO, LIC, Care Health & ICICI Lombard to protect your family and vehicle today.
        </p>
        <button
          onClick={onBrowseCatalog}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-xs hover:bg-emerald-400 transition"
        >
          Explore Insurance Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            My Active Insurance Portfolio
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            You have {boughtPolicies.length} active IRDAI policy protection certificates in your digital vault.
          </p>
        </div>

        <button
          onClick={openCOIModal}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-2"
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Download IRDAI Certificate (COI)</span>
        </button>
      </div>

      {/* Grid of Bought Policies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boughtPolicies.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 flex flex-col justify-between"
          >
            {/* Top Card Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Active • {p.category}
                  </span>
                  <h3 className="font-extrabold text-white text-lg leading-tight mt-1">
                    {p.planName}
                  </h3>
                  <p className="text-xs text-slate-400">{p.insurerName}</p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-500">Coverage Limit</p>
                  <p className="text-lg font-black text-emerald-400 font-mono">
                    ₹{(p.sumInsured / 100000).toFixed(0)} Lakhs
                  </p>
                </div>
              </div>

              {/* Policy Number Details */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans font-bold uppercase">Policy Number</span>
                  <span className="font-bold text-white">{p.policyNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block font-sans font-bold uppercase">Cashless ID</span>
                  <span className="font-bold text-cyan-300">{p.cashlessCardNumber}</span>
                </div>
              </div>

              {/* Insured Profile & Nominee */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block font-medium">Proposer:</span>
                  <span className="font-bold text-white">{p.proposerName}</span>
                  <p className="text-[11px] text-slate-400">{p.city}, {p.state}</p>
                </div>

                <div>
                  <span className="text-slate-500 block font-medium">Nominee:</span>
                  <span className="font-bold text-white">{p.nomineeName}</span>
                  <p className="text-[11px] text-slate-400">{p.nomineeRelation}</p>
                </div>
              </div>

              {/* Period */}
              <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1 border-t border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Valid: <strong>{p.policyStartDate}</strong> to <strong>{p.policyEndDate}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Paid: ₹{p.totalPremiumPaid.toLocaleString('en-IN')} (incl. GST)
              </span>

              <button
                onClick={() => onFileClaim(p)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center space-x-1"
              >
                <PhoneCall className="w-3.5 h-3.5 fill-slate-950" />
                <span>File Cashless Claim</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
