import React, { useState } from 'react';
import { ClaimItem, PolicyItem } from '../types';
import { Award, ShieldAlert, DollarSign, TrendingUp, CheckCircle2, AlertTriangle, RefreshCw, Layers, Check, X, Search, Filter } from 'lucide-react';

interface ActuaryConsoleProps {
  claims: ClaimItem[];
  policies: PolicyItem[];
  onUpdateClaimStatus: (claimId: string, newStatus: any, approvedPayout?: number) => void;
}

export const ActuaryConsole: React.FC<ActuaryConsoleProps> = ({
  claims,
  policies,
  onUpdateClaimStatus,
}) => {
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(claims[0]?.id || null);
  const [payoutOverride, setPayoutOverride] = useState<number>(0);

  const totalExposure = policies.reduce((acc, p) => acc + p.coverageLimit, 0);
  const totalPremiumCollected = policies.reduce((acc, p) => acc + p.annualPremium, 0);
  const totalClaimsPaid = claims.reduce((acc, c) => acc + (c.approvedPayout || 0), 0);
  const lossRatio = Math.round((totalClaimsPaid / (totalPremiumCollected || 1)) * 100 * 10) / 10;

  const selectedClaim = claims.find((c) => c.id === selectedClaimId);

  const handleApprove = (claim: ClaimItem) => {
    const payout = payoutOverride > 0 ? payoutOverride : claim.claimedAmount * 0.9;
    onUpdateClaimStatus(claim.id, 'PAYOUT_APPROVED', payout);
  };

  const handleReject = (claim: ClaimItem) => {
    onUpdateClaimStatus(claim.id, 'FORENSIC_REVIEW', 0);
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-920 to-slate-950 border border-amber-800/80 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-mono font-semibold text-amber-400 px-3 py-1 rounded-full bg-amber-950 border border-amber-700">
                Chief Actuary & Executive Underwriter Console
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Syndicate Loss Ratio & Underwriting Controls</h1>
            <p className="text-sm text-slate-300 mt-1">
              Real-time portfolio reserve management, AI fraud audit override queue, and reinsurance retrocession monitoring.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-amber-300 px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800">
              Solvency Capital Ratio: <strong className="text-white">242%</strong>
            </span>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-amber-900/40">
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Syndicate Loss Ratio</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
              {lossRatio}% <span className="text-xs font-normal text-slate-400">(Target &lt; 50%)</span>
            </p>
            <span className="text-[10px] text-emerald-400 block mt-1 font-mono">Optimal Underwriting Health</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Loss Reserves</span>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">
              $68.5M
            </p>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Lloyds Syndicate Backed</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Claim Audits</span>
            <p className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
              {claims.filter((c) => c.status !== 'PAYOUT_APPROVED').length} <span className="text-xs font-normal text-slate-400">Files</span>
            </p>
            <span className="text-[10px] text-amber-400 block mt-1 font-mono">Requires Board Authorization</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Portfolio Exposure</span>
            <p className="text-2xl font-extrabold text-cyan-400 mt-1 font-mono">
              ${(totalExposure / 1000000).toFixed(1)}M
            </p>
            <span className="text-[10px] text-slate-400 block mt-1 font-mono">Across 5 Primary Lines</span>
          </div>
        </div>
      </div>

      {/* Fraud Queue & Claim Decisioning */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Pending Claims Queue */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <ShieldAlert className="w-4 h-4 text-amber-400 mr-2" /> AI Fraud Flag & Approval Queue
          </h3>

          <div className="space-y-3">
            {claims.map((claim) => {
              const isSelected = selectedClaimId === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => {
                    setSelectedClaimId(claim.id);
                    setPayoutOverride(claim.approvedPayout || Math.round(claim.claimedAmount * 0.9));
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-xl'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-400">{claim.claimNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      claim.fraudScore > 25 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      Fraud Score: {claim.fraudScore}/100
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-1.5">{claim.lossCategory}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{claim.companyName} • Claimed: ${claim.claimedAmount.toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Claim Audit & Override Panel */}
        <div className="lg:col-span-7">
          {selectedClaim ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-0.5 rounded bg-amber-950 border border-amber-800">
                    {selectedClaim.claimNumber}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{selectedClaim.lossCategory}</h3>
                  <p className="text-xs text-slate-400 font-mono">Claimant: {selectedClaim.claimantName} ({selectedClaim.companyName})</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Requested Amount</span>
                  <span className="text-xl font-extrabold text-white font-mono">${selectedClaim.claimedAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* AI Forensic Telemetry */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 block">AI Underwriter Telemetry Summary</span>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  "{selectedClaim.aiSummary}"
                </p>
              </div>

              {/* Payout Override Controls */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-4">
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-300">Actuary Disbursement Authorization</h4>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Approved Payout Amount ($)</label>
                  <input
                    type="number"
                    value={payoutOverride}
                    onChange={(e) => setPayoutOverride(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    onClick={() => handleApprove(selectedClaim)}
                    className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Authorize Disbursement (${payoutOverride.toLocaleString()})</span>
                  </button>

                  <button
                    onClick={() => handleReject(selectedClaim)}
                    className="px-4 py-3 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-800 font-bold text-xs flex items-center justify-center space-x-1.5 transition"
                  >
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Send to Forensic Audit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
              <p className="text-xs text-slate-400">Select a claim file to adjust actuarial payout overrides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
