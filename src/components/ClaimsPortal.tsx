import React, { useState } from 'react';
import { ClaimItem, PolicyItem, ClaimStatus } from '../types';
import { AlertCircle, PhoneCall, FileText, CheckCircle2, ShieldAlert, Sparkles, Upload, Clock, User, ChevronRight, RefreshCw, DollarSign, Lock, AlertTriangle } from 'lucide-react';

interface ClaimsPortalProps {
  claims: ClaimItem[];
  policies: PolicyItem[];
  onSubmitNewClaim: (newClaim: ClaimItem) => void;
}

export const ClaimsPortal: React.FC<ClaimsPortalProps> = ({
  claims,
  policies,
  onSubmitNewClaim,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'LIST' | 'FNOL_WIZARD'>('LIST');

  // FNOL Wizard State
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(policies[0]?.id || '');
  const [lossCategory, setLossCategory] = useState<string>('Cyber Security Incident & Data Breach');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [claimedAmount, setClaimedAmount] = useState<number>(150000);
  const [incidentDescription, setIncidentDescription] = useState<string>(
    'Unusual exfiltration attempt detected across production API gateways resulting in server isolation and temporary business disruption.'
  );
  const [evidenceNotes, setEvidenceNotes] = useState<string>('Attached CrowdStrike EDR telemetry logs and independent incident response invoice.');

  const [isEvaluatingAI, setIsEvaluatingAI] = useState<boolean>(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<any | null>(null);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<ClaimItem | null>(claims[0] || null);

  const handleRunAICheck = async () => {
    setIsEvaluatingAI(true);
    setAiAnalysisResult(null);

    const selectedPol = policies.find((p) => p.id === selectedPolicyId) || policies[0];

    try {
      const res = await fetch('/api/evaluate-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyNumber: selectedPol.policyNumber,
          policyType: selectedPol.type,
          incidentDescription,
          claimAmount: claimedAmount,
          lossCategory,
          incidentDate,
          evidenceNotes,
        }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAiAnalysisResult(data.analysis);
      }
    } catch (err) {
      console.error('Error running AI claim check:', err);
    } finally {
      setIsEvaluatingAI(false);
    }
  };

  const handleFinalClaimSubmission = () => {
    const selectedPol = policies.find((p) => p.id === selectedPolicyId) || policies[0];
    const claimNum = `CLM-2026-${Math.floor(Math.random() * 8999 + 1000)}`;

    const newClaim: ClaimItem = {
      id: `clm-custom-${Date.now()}`,
      claimNumber: claimNum,
      policyId: selectedPol.id,
      policyNumber: selectedPol.policyNumber,
      policyTitle: selectedPol.title,
      claimantName: selectedPol.holderName,
      companyName: selectedPol.companyName,
      lossDate: incidentDate,
      reportedDate: new Date().toISOString().split('T')[0],
      status: aiAnalysisResult?.fraudScore > 25 ? 'ADJUSTER_ASSIGNED' : 'PAYOUT_APPROVED',
      lossCategory,
      claimedAmount,
      approvedPayout: aiAnalysisResult?.recommendedPayout || Math.round(claimedAmount * 0.95),
      deductibleApplied: selectedPol.deductible,
      fraudScore: aiAnalysisResult?.fraudScore || 8,
      fraudRiskLevel: aiAnalysisResult?.fraudRiskLevel || 'LOW_RISK_CLEAR',
      coverageMatchPercentage: aiAnalysisResult?.coverageMatchPercentage || 98,
      evidenceFiles: [
        { id: 'f-user-1', name: 'CrowdStrike_EDR_Log.json', size: '2.4 MB', type: 'SECURITY_LOG', category: 'SECURITY_LOG', dateUploaded: incidentDate },
        { id: 'f-user-2', name: 'Forensic_Statement.pdf', size: '1.2 MB', type: 'AUDIT_DOC', category: 'AUDIT_DOC', dateUploaded: incidentDate },
      ],
      timeline: [
        { id: 't-init-1', date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC', title: 'First Notice of Loss (FNOL) Submitted', author: selectedPol.holderName, note: incidentDescription, badge: 'SYSTEM' },
        { id: 't-init-2', date: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC', title: 'Server-Side AI Forensic Pre-Audit Completed', author: 'Aegis Sentinel AI', note: aiAnalysisResult?.aiUnderwriterSummary || 'Evidence matches policy terms.', badge: 'AI' },
      ],
      adjusterContact: {
        name: 'Sarah Jenkins',
        role: 'Senior Claims Director',
        phone: '+1 (800) 555-9821',
        email: 's.jenkins@aegisshield.com',
      },
      aiSummary: aiAnalysisResult?.aiUnderwriterSummary || 'FNOL verified automatically.',
    };

    onSubmitNewClaim(newClaim);
    setSelectedClaimDetail(newClaim);
    setActiveSubTab('LIST');
    setAiAnalysisResult(null);
  };

  const getStatusBadgeClass = (status: ClaimStatus) => {
    switch (status) {
      case 'PAYOUT_APPROVED':
      case 'DISPATCHED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700';
      case 'ADJUSTER_ASSIGNED':
      case 'FORENSIC_REVIEW':
        return 'bg-amber-950 text-amber-300 border-amber-700';
      default:
        return 'bg-cyan-950 text-cyan-300 border-cyan-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-mono font-semibold text-rose-400 px-3 py-1 rounded-full bg-rose-950/90 border border-rose-800">
              24/7 FNOL Emergency Claims Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">First Notice of Loss & Claims Command</h1>
          <p className="text-sm text-slate-300 mt-1">
            File instant incident reports, review real-time AI evidence audits, and track emergency disbursement advances.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveSubTab('LIST')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeSubTab === 'LIST'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Claims ({claims.length})
          </button>

          <button
            onClick={() => setActiveSubTab('FNOL_WIZARD')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeSubTab === 'FNOL_WIZARD'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/80'
                : 'bg-rose-950 text-rose-200 border border-rose-800 hover:bg-rose-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>File New FNOL Claim</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'FNOL_WIZARD' ? (
        /* FNOL Wizard Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (7 cols): Claim Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
              <PhoneCall className="w-4 h-4 text-rose-400 mr-2" /> Step 1: Claim Incident Particulars
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Active Insured Policy</label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.policyNumber} — {p.title} (${(p.coverageLimit / 1000000).toFixed(1)}M Limit)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Loss Event</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Claim Loss Amount ($)</label>
                  <input
                    type="number"
                    value={claimedAmount}
                    onChange={(e) => setClaimedAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loss Category / Classification</label>
                <input
                  type="text"
                  value={lossCategory}
                  onChange={(e) => setLossCategory(e.target.value)}
                  placeholder="e.g. Distributed Ransomware, Warehousing Flood Damage"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Incident Description & Sequence of Events</label>
                <textarea
                  rows={4}
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Supporting Evidence & Log Documentation</label>
                <input
                  type="text"
                  value={evidenceNotes}
                  onChange={(e) => setEvidenceNotes(e.target.value)}
                  placeholder="e.g. Attached forensic reports, invoice summaries, drone damage photos"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="button"
                onClick={handleRunAICheck}
                disabled={isEvaluatingAI}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {isEvaluatingAI ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Running Server-Side Gemini Forensic Pre-Audit...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Server-Side AI Evidence Pre-Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): AI Audit Results & Submit */}
          <div className="lg:col-span-5">
            {!aiAnalysisResult ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-rose-400 mb-3" />
                <h3 className="text-base font-bold text-white">Automated Forensic Audit Pending</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Fill in your incident details on the left and click "Run Server-Side AI Evidence Pre-Audit" to calculate policy coverage match and estimated disbursement.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400">AI Pre-Audit Result</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-bold border border-emerald-800">
                    {aiAnalysisResult.automatedDecision}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Fraud Risk Score</span>
                    <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">{aiAnalysisResult.fraudScore} / 100</p>
                    <span className="text-[10px] text-slate-400 block font-mono">Classification: {aiAnalysisResult.fraudRiskLevel}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Coverage Match</span>
                    <p className="text-xl font-bold text-cyan-400 font-mono mt-0.5">{aiAnalysisResult.coverageMatchPercentage}%</p>
                    <span className="text-[10px] text-slate-400 block font-mono">100% Insured Terms</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Requested Claim:</span>
                    <span>${claimedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Deductible Applied:</span>
                    <span>-${aiAnalysisResult.deductibleApplied?.toLocaleString() || '50,000'}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-bold text-sm pt-2 border-t border-slate-800">
                    <span>Net Approved Payout:</span>
                    <span>${aiAnalysisResult.netPayout?.toLocaleString() || (claimedAmount * 0.9).toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-850 text-xs text-slate-300 space-y-2">
                  <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">AI Forensic Summary</span>
                  <p className="text-[11px] leading-relaxed">"{aiAnalysisResult.aiUnderwriterSummary}"</p>
                </div>

                <button
                  type="button"
                  onClick={handleFinalClaimSubmission}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit FNOL Claim to Syndicate Board</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Active Claims List & Detailed Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Claims List Column (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Claim Files ({claims.length})</h3>

            <div className="space-y-3">
              {claims.map((claim) => {
                const isSelected = selectedClaimDetail?.id === claim.id;
                return (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaimDetail(claim)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-1 ring-emerald-500 text-white shadow-xl'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400">{claim.claimNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(claim.status)}`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mt-1.5">{claim.lossCategory}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{claim.companyName} • Loss: ${claim.claimedAmount.toLocaleString()}</p>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800/80">
                      <span>Reported: {claim.reportedDate}</span>
                      <span className="text-emerald-400 font-mono">Fraud Score: {claim.fraudScore}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Claim Detailed Inspector (7 cols) */}
          <div className="lg:col-span-7">
            {selectedClaimDetail ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                        {selectedClaimDetail.claimNumber}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(selectedClaimDetail.status)}`}>
                        {selectedClaimDetail.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-2">{selectedClaimDetail.lossCategory}</h3>
                    <p className="text-xs text-slate-400 font-mono">Policy: {selectedClaimDetail.policyNumber} ({selectedClaimDetail.policyTitle})</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">Claim Valuation</span>
                    <span className="text-xl font-extrabold text-white font-mono">${selectedClaimDetail.claimedAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Adjuster Card */}
                {selectedClaimDetail.adjusterContact && (
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-200 block">{selectedClaimDetail.adjusterContact.name}</span>
                        <span className="text-slate-400 text-[11px]">{selectedClaimDetail.adjusterContact.role}</span>
                      </div>
                    </div>

                    <div className="text-right space-y-0.5 font-mono text-[11px]">
                      <span className="text-emerald-400 block">{selectedClaimDetail.adjusterContact.phone}</span>
                      <span className="text-slate-400 block">{selectedClaimDetail.adjusterContact.email}</span>
                    </div>
                  </div>
                )}

                {/* Timeline Events */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">Audit Milestone Timeline</h4>
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {selectedClaimDetail.timeline.map((evt) => (
                      <div key={evt.id} className="relative pl-8 text-xs">
                        <div className="absolute left-1.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                        <div className="bg-slate-950 border border-slate-850 p-3 rounded-xl space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{evt.title}</span>
                            <span className="text-[10px] font-mono text-slate-500">{evt.date}</span>
                          </div>
                          <p className="text-slate-400 text-[11px]">{evt.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence Files */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Attached Evidence Packages</h4>
                  <div className="space-y-2">
                    {selectedClaimDetail.evidenceFiles.map((f) => (
                      <div key={f.id} className="bg-slate-950 border border-slate-850 p-2.5 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-cyan-400" />
                          <span className="font-mono text-slate-200">{f.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{f.size} • {f.dateUploaded}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-xs text-slate-400">Select a claim file from the left to view timeline metrics.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
