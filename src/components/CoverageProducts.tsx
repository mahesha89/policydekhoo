import React, { useState } from 'react';
import { PolicyItem, PolicyType } from '../types';
import { Shield, Calculator, Check, ArrowRight, Zap, CheckCircle2, Lock, Building, Landmark, Compass, Award, Percent } from 'lucide-react';

interface CoverageProductsProps {
  onBindPolicy: (newPolicy: PolicyItem) => void;
  onNavigateToUnderwriting: () => void;
}

export const CoverageProducts: React.FC<CoverageProductsProps> = ({
  onBindPolicy,
  onNavigateToUnderwriting,
}) => {
  const [selectedType, setSelectedType] = useState<PolicyType>('CYBER_SECURITY');
  const [companyName, setCompanyName] = useState('Apex Technologies Group');
  const [coverageLimit, setCoverageLimit] = useState<number>(25000000);
  const [deductible, setDeductible] = useState<number>(100000);
  const [annualRevenue, setAnnualRevenue] = useState<number>(45000000);
  const [employeeCount, setEmployeeCount] = useState<number>(250);
  const [lossHistoryYears, setLossHistoryYears] = useState<number>(5); // years clean
  const [hasSOC2, setHasSOC2] = useState<boolean>(true);
  const [hasISO27001, setHasISO27001] = useState<boolean>(true);
  const [hasMultiCloudSLA, setHasMultiCloudSLA] = useState<boolean>(false);

  // Calculate actuarial premium dynamically
  const baseRatePercentage = {
    CYBER_SECURITY: 0.0032,
    COMMERCIAL_PROPERTY: 0.0048,
    DIRECTORS_OFFICERS: 0.0028,
    SUPPLY_CHAIN: 0.0055,
    LUXURY_ASSET: 0.0038,
    ENVIRONMENTAL_HAZARD: 0.0062,
    EXECUTIVE_UMBRELLA: 0.0022,
  }[selectedType];

  const rawBasePremium = coverageLimit * baseRatePercentage;
  const revenueFactor = Math.log10(Math.max(100000, annualRevenue)) / 7;
  const headcountFactor = 1 + (employeeCount / 2000);
  const deductibleDiscountMultiplier = 1 - (deductible / 2000000);
  const lossHistoryDiscountMultiplier = Math.max(0.75, 1 - (lossHistoryYears * 0.04));

  let complianceDiscount = 0;
  if (hasSOC2) complianceDiscount += 0.12;
  if (hasISO27001) complianceDiscount += 0.08;
  if (hasMultiCloudSLA) complianceDiscount += 0.05;

  const totalDiscountPercent = Math.min(35, Math.round(complianceDiscount * 100 + (lossHistoryYears * 3)));
  const finalAnnualPremium = Math.round(
    rawBasePremium * revenueFactor * headcountFactor * deductibleDiscountMultiplier * lossHistoryDiscountMultiplier * (1 - complianceDiscount)
  );
  const monthlyPremium = Math.round(finalAnnualPremium / 12);
  const calculatedRiskScore = Math.min(99, Math.max(50, 75 + Math.round(complianceDiscount * 40) + (lossHistoryYears * 2)));

  const handleBindSubmit = () => {
    const newPolicyNumber = `AGS-${selectedType.slice(0, 2)}-2026-${Math.floor(Math.random() * 8999 + 1000)}`;
    const titleMap: Record<PolicyType, string> = {
      CYBER_SECURITY: 'Enterprise Cyber Breach & Ransomware Defense Syndicate',
      COMMERCIAL_PROPERTY: 'Commercial Real Estate & Contingent Business Interruption',
      DIRECTORS_OFFICERS: 'Executive Directors & Officers Board Liability (Side A/B/C)',
      SUPPLY_CHAIN: 'Global Freight & Semiconductor Supply Chain Loss Protection',
      LUXURY_ASSET: 'High-Net-Worth Fleet, Fine Art & Aviation Hull Coverage',
      ENVIRONMENTAL_HAZARD: 'Industrial Environmental Hazard & Chemical Spill Indemnity',
      EXECUTIVE_UMBRELLA: 'Global Executive Umbrella Liability Syndicate',
    };

    const newPolicy: PolicyItem = {
      id: `pol-custom-${Date.now()}`,
      policyNumber: newPolicyNumber,
      holderName: 'Enterprise Risk Manager',
      companyName: companyName || 'Apex Financial Technologies',
      type: selectedType,
      title: titleMap[selectedType],
      coverageLimit,
      deductible,
      annualPremium: finalAnnualPremium,
      monthlyPremium,
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'ACTIVE',
      riskScore: calculatedRiskScore,
      complianceLevel: `${hasSOC2 ? 'SOC2 Type II • ' : ''}${hasISO27001 ? 'ISO 27001 • ' : ''}Aegis Tier 1`,
      insuredAssetsCount: Math.round(employeeCount * 1.5),
      coiCount: 1,
      endorsements: [],
      keyPerilsCovered: [
        'Direct Financial Loss & Business Interruption',
        'Regulatory Compliance Legal Fine Defense',
        'Third-Party Liability & Forensic Audit Retainer',
        'Immediate Emergency 24/7 FNOL Advance Payout',
      ],
    };

    onBindPolicy(newPolicy);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-800">
              Interactive Actuarial Calculator
            </span>
            <h1 className="text-2xl font-extrabold text-white mt-2">Custom Policy & Coverage Builder</h1>
            <p className="text-sm text-slate-300">
              Configure enterprise coverage limits, deductibles, and security controls to generate instant binding quotes backed by Aegis Syndicate reserves.
            </p>
          </div>

          <button
            onClick={onNavigateToUnderwriting}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 font-semibold text-xs border border-slate-700 transition self-start md:self-auto flex items-center space-x-2"
          >
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Deep AI Risk Assessment Audit</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Line Selection & Controls on Left, Live Premium Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Line selection & Sliders */}
        <div className="lg:col-span-7 space-y-6">
          {/* Select Policy Line */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Select Syndicate Coverage Line</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'CYBER_SECURITY' as PolicyType, label: 'Cyber Liability', icon: Lock, color: 'text-cyan-400' },
                { type: 'COMMERCIAL_PROPERTY' as PolicyType, label: 'Commercial Real Estate', icon: Building, color: 'text-emerald-400' },
                { type: 'DIRECTORS_OFFICERS' as PolicyType, label: 'Directors & Officers', icon: Landmark, color: 'text-amber-400' },
                { type: 'SUPPLY_CHAIN' as PolicyType, label: 'Supply Chain & Freight', icon: Compass, color: 'text-indigo-400' },
                { type: 'LUXURY_ASSET' as PolicyType, label: 'Luxury Fleet & Marine', icon: Award, color: 'text-purple-400' },
                { type: 'ENVIRONMENTAL_HAZARD' as PolicyType, label: 'Environmental Hazard', icon: Shield, color: 'text-rose-400' },
              ].map((item) => {
                const IconComp = item.icon;
                const isSelected = selectedType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedType(item.type)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      isSelected
                        ? 'bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20 text-white shadow-lg'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 mb-2 ${item.color}`} />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Business & Actuarial Parameters */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Configure Actuarial Exposure & Limits</h3>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Entity / Insured Corporation</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Coverage Limit Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Coverage Limit per Occurrence</label>
                <span className="text-sm font-mono font-bold text-emerald-400">${(coverageLimit / 1000000).toFixed(1)}M</span>
              </div>
              <input
                type="range"
                min={1000000}
                max={100000000}
                step={1000000}
                value={coverageLimit}
                onChange={(e) => setCoverageLimit(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-950"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>$1.0M</span>
                <span>$25.0M</span>
                <span>$50.0M</span>
                <span>$100.0M</span>
              </div>
            </div>

            {/* Deductible Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Self-Insured Retention (Deductible)</label>
                <span className="text-sm font-mono font-bold text-slate-200">${(deductible / 1000).toFixed(0)}k</span>
              </div>
              <input
                type="range"
                min={25000}
                max={1000000}
                step={25000}
                value={deductible}
                onChange={(e) => setDeductible(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>$25k</span>
                <span>$250k</span>
                <span>$500k</span>
                <span>$1.0M</span>
              </div>
            </div>

            {/* Revenue & Employee Count Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Annual Enterprise Revenue</label>
                <select
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value={10000000}>$10,000,000 / yr</option>
                  <option value={45000000}>$45,000,000 / yr</option>
                  <option value={100000000}>$100,000,000 / yr</option>
                  <option value={500000000}>$500,000,000 / yr</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loss-Free Operating History</label>
                <select
                  value={lossHistoryYears}
                  onChange={(e) => setLossHistoryYears(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value={1}>1 Year Clean (-4%)</option>
                  <option value={3}>3 Years Clean (-12%)</option>
                  <option value={5}>5+ Years Clean (-20%)</option>
                </select>
              </div>
            </div>

            {/* Security & Compliance Discount Triggers */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Audited Compliance Controls (Instant Discounts)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setHasSOC2(!hasSOC2)}
                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                    hasSOC2 ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="font-bold block">SOC2 Type II</span>
                    <span className="text-[10px] text-slate-400">-12% Premium</span>
                  </div>
                  {hasSOC2 && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setHasISO27001(!hasISO27001)}
                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                    hasISO27001 ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="font-bold block">ISO 27001</span>
                    <span className="text-[10px] text-slate-400">-8% Premium</span>
                  </div>
                  {hasISO27001 && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setHasMultiCloudSLA(!hasMultiCloudSLA)}
                  className={`p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition ${
                    hasMultiCloudSLA ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="font-bold block">Multi-Cloud Failover</span>
                    <span className="text-[10px] text-slate-400">-5% Premium</span>
                  </div>
                  {hasMultiCloudSLA && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Live Quote & Binding Panel */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl sticky top-24 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Actuarial Quote Output</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[11px] font-bold border border-emerald-800 flex items-center">
                <Zap className="w-3 h-3 mr-1" /> Instant Binding Ready
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Calculated Annual Premium</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  ${finalAnnualPremium.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">/ year</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Billed at <strong className="text-white">${monthlyPremium.toLocaleString()}</strong> per month
              </p>
            </div>

            {/* Discount Summary */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-300">
                <span className="flex items-center">
                  <Percent className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Applied Discount Credit:
                </span>
                <span className="text-emerald-400 font-mono font-bold">-{totalDiscountPercent}% Off Base</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Calculated Risk Score:</span>
                <span className="text-cyan-400 font-mono font-bold">{calculatedRiskScore} / 100</span>
              </div>
            </div>

            {/* Included Protections List */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Standard Perils & Service SLA</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>24/7 Forensic AI Claim Pre-Audit & FNOL Processing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Zero-Retain Certificate of Insurance (COI) Instant Generator</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Emergency 25% Advance Disburse within 4 hours of loss</span>
                </li>
              </ul>
            </div>

            {/* Bind Action Button */}
            <button
              onClick={handleBindSubmit}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/80 flex items-center justify-center space-x-2 transition transform active:scale-[0.99]"
            >
              <span>Bind Policy & Add to Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-500 leading-tight">
              Underwritten by Aegis Shield Syndicate LLC. Binding constitutes legally enforceable insurance contract subject to final verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
