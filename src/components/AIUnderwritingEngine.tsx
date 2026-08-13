import React, { useState } from 'react';
import { UnderwritingAudit } from '../types';
import { Shield, Sparkles, AlertTriangle, CheckCircle, ArrowRight, RefreshCw, Cpu, Layers, Lock, Award } from 'lucide-react';

interface AIUnderwritingEngineProps {
  onApplyAuditToQuote: (audit: UnderwritingAudit, companyName: string, revenue: number) => void;
}

export const AIUnderwritingEngine: React.FC<AIUnderwritingEngineProps> = ({
  onApplyAuditToQuote,
}) => {
  const [companyName, setCompanyName] = useState('Apex Financial Technologies');
  const [industry, setIndustry] = useState('FinTech & Cloud Financial Infra');
  const [annualRevenue, setAnnualRevenue] = useState(45000000);
  const [employeeCount, setEmployeeCount] = useState(250);
  const [existingSecurityStack, setExistingSecurityStack] = useState('CrowdStrike Falcon, Okta MFA, Cloudflare WAF, SOC2 Type II');
  const [cloudProvider, setCloudProvider] = useState('AWS Multi-Region (US-East / EU-Central) + GCP BigQuery');
  const [physicalAssetValue, setPhysicalAssetValue] = useState(15000000);
  const [lossHistoryYears, setLossHistoryYears] = useState(4);

  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<UnderwritingAudit | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/risk-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industry,
          annualRevenue,
          employeeCount,
          existingSecurityStack,
          cloudProvider,
          physicalAssetValue,
          lossHistoryYears,
        }),
      });

      const data = await res.json();
      if (data.success && data.audit) {
        setAuditResult(data.audit);
      } else {
        setErrorMsg(data.error || 'Failed to analyze risk profile');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error connecting to underwriting AI backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-920 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-mono font-semibold text-cyan-400 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-800 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Server-Side Gemini 3.6 Flash Engine Active
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">AI Enterprise Risk & Underwriting Audit</h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Perform instant 360° actuarial stress testing across security stacks, cloud infrastructure, and operational risk metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center">
            <Cpu className="w-4 h-4 text-cyan-400 mr-2" /> Company Risk Parameters
          </h3>

          <form onSubmit={handleRunAudit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Entity Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="FinTech & Cloud Financial Infra">FinTech & Cloud Financial Infra</option>
                <option value="SaaS & High Tech Software">SaaS & High Tech Software</option>
                <option value="Healthcare & BioPharma">Healthcare & BioPharma</option>
                <option value="Logistics & Maritime Transport">Logistics & Maritime Transport</option>
                <option value="Aerospace & Advanced Defense">Aerospace & Advanced Defense</option>
                <option value="Energy & Clean Infrastructure">Energy & Clean Infrastructure</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Revenue ($)</label>
                <input
                  type="number"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Employees</label>
                <input
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Security & Compliance Controls</label>
              <input
                type="text"
                value={existingSecurityStack}
                onChange={(e) => setExistingSecurityStack(e.target.value)}
                placeholder="e.g. Okta MFA, CrowdStrike Falcon, SOC2"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cloud & Hosting Infrastructure</label>
              <input
                type="text"
                value={cloudProvider}
                onChange={(e) => setCloudProvider(e.target.value)}
                placeholder="e.g. AWS Multi-region, Kubernetes"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/80 flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Actuarial Telemetry...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Execute AI Underwriting Audit</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-3 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Output Column (7 cols) */}
        <div className="lg:col-span-7">
          {!auditResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mb-4 text-cyan-400">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Ready for Actuarial Stress Testing</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Configure your company parameters on the left and click "Execute AI Underwriting Audit" to generate a real-time risk classification report.
              </p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              {/* Score Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Overall Actuarial Score</span>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                      {auditResult.overallRiskScore}
                    </span>
                    <span className="text-sm font-normal text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="text-right sm:text-right">
                  <span className="text-xs text-slate-400 block font-semibold uppercase">Underwriting Tier</span>
                  <span className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold text-xs border border-emerald-800">
                    {auditResult.tierClassification}
                  </span>
                </div>
              </div>

              {/* Actuarial Verdict */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-850">
                <h4 className="text-xs uppercase tracking-wider font-bold text-cyan-400 mb-1 flex items-center">
                  <Award className="w-4 h-4 mr-1.5" /> Lead Underwriter Verdict
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  "{auditResult.actuarialVerdict}"
                </p>
              </div>

              {/* Critical Vulnerabilities */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-rose-400 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-400" /> Key Risk Vulnerabilities Identified
                </h4>
                <div className="space-y-2">
                  {auditResult.criticalVulnerabilities.map((vuln, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 flex items-start space-x-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{vuln}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount Triggers */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Discount Triggers & Premium Credits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {auditResult.discountTriggers.map((disc, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-200 block">{disc.title}</span>
                        <span className="text-[10px] text-slate-400">Status: {disc.status}</span>
                      </div>
                      <span className="text-emerald-400 font-bold font-mono">-{disc.discountPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onApplyAuditToQuote(auditResult, companyName, annualRevenue)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition"
              >
                <span>Apply Audit Ratings to Custom Policy Builder</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
