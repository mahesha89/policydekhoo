import React, { useState, useEffect } from 'react';
import { IndianPolicy, InsuranceCategory } from '../types';
import type { User } from '../types';
import {
  Calculator,
  ShieldCheck,
  Sparkles,
  IndianRupee,
  ArrowRight,
  Check,
  AlertCircle,
  Activity,
  Heart,
  Loader2,
  FileCheck,
  TrendingUp,
  Sliders,
  Shield,
  Zap,
  ExternalLink,
  Lock,
  User as UserIcon,
  Crown,
} from 'lucide-react';

interface PremiumEstimatorProps {
  policies: IndianPolicy[];
  onApplyEstimateToCatalog: (filters: { category: InsuranceCategory; sumInsured: number; maxBudget?: number }) => void;
  onBuyPolicy: (policy: IndianPolicy) => void;
  openAIAdvisorWithDetails?: () => void;
  user?: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register', reason?: string) => void;
  onOpenAIProModal?: () => void;
}

export const PremiumEstimator: React.FC<PremiumEstimatorProps> = ({
  policies,
  onApplyEstimateToCatalog,
  onBuyPolicy,
  openAIAdvisorWithDetails,
  user,
  onOpenAuthModal,
  onOpenAIProModal,
}) => {
  // Inputs
  const [age, setAge] = useState<number>(32);
  const [sumInsured, setSumInsured] = useState<number>(1000000); // Default ₹10 Lakhs
  const [category, setCategory] = useState<InsuranceCategory>('HEALTH');
  const [familyScope, setFamilyScope] = useState<string>('Self + Spouse + 1 Child');
  const [city, setCity] = useState<string>(user?.city || 'Mumbai');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  useEffect(() => {
    if (user?.city) {
      setCity(user.city);
    }
  }, [user]);

  // States
  const [isCalculatingAI, setIsCalculatingAI] = useState<boolean>(false);
  const [aiEstimate, setAiEstimate] = useState<any>(null);

  const medicalConditionOptions = [
    { id: 'diabetes', label: 'Diabetes (Type 1/2)', loading: 12 },
    { id: 'hypertension', label: 'Hypertension (High BP)', loading: 10 },
    { id: 'cardiac', label: 'Heart Condition / Stent', loading: 25 },
    { id: 'asthma', label: 'Asthma / Respiratory', loading: 8 },
    { id: 'thyroid', label: 'Thyroid Disorder', loading: 5 },
    { id: 'smoking', label: 'Tobacco / Smoking', loading: 20 },
    { id: 'surgery', label: 'Surgery (Last 3 Yrs)', loading: 15 },
  ];

  const toggleCondition = (id: string) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Client-side Instant Math (updates dynamically as user changes controls)
  const calculateLocalEstimate = () => {
    let baseRate = 0.008; // 0.8% base for Health
    if (category === 'TERM_LIFE') baseRate = 0.0011;
    else if (category === 'CAR_MOTOR') baseRate = 0.024;

    const ageBracket = Math.max(0, age - 25);
    const ageMultiplier = 1 + (ageBracket / 10) * 0.18;

    let medicalLoadingPercent = 0;
    selectedConditions.forEach((condId) => {
      const match = medicalConditionOptions.find((m) => m.id === condId);
      if (match) medicalLoadingPercent += match.loading;
    });

    const medicalMultiplier = 1 + medicalLoadingPercent / 100;
    const baseCalculated = Math.round(sumInsured * baseRate * ageMultiplier * medicalMultiplier);
    const gstAmount = Math.round(baseCalculated * 0.18);
    const totalAnnual = baseCalculated + gstAmount;
    const monthly = Math.round(totalAnnual / 12);
    const taxSavings = Math.min(25000, Math.round(totalAnnual * 0.3));

    return {
      baseCalculated,
      ageLoadingPercent: Math.round((ageMultiplier - 1) * 100),
      medicalLoadingPercent,
      gstAmount,
      totalAnnual,
      monthly,
      taxSavings,
      riskTier:
        medicalLoadingPercent > 20
          ? 'MODERATE_UNDERWRITING'
          : medicalLoadingPercent > 0
          ? 'STANDARD_PLUS'
          : 'PREFERRED_TIER',
    };
  };

  const localEst = calculateLocalEstimate();

  // Call Server-Side Gemini API for Deep Actuarial Assessment
  const handleFetchAIAssessment = async () => {
    if (!user) {
      if (onOpenAuthModal) {
        onOpenAuthModal('login', 'Sign in to access Gemini 3.6 Flash Actuarial Analysis');
      }
      return;
    }

    if (!user.isAiProSubscriber) {
      if (onOpenAIProModal) {
        onOpenAIProModal();
      }
      return;
    }

    setIsCalculatingAI(true);
    try {
      const conditionLabels = selectedConditions.map(
        (id) => medicalConditionOptions.find((m) => m.id === id)?.label || id
      );

      const response = await fetch('/api/estimate-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          age,
          sumInsured,
          medicalHistory: conditionLabels,
          category,
          familyScope,
          city,
        }),
      });

      const data = await response.json();
      if (data.success && data.estimate) {
        setAiEstimate(data.estimate);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculatingAI(false);
    }
  };

  // Find top 2 matching policies from catalog based on selected category & sum insured
  const matchingPolicies = policies
    .filter((p) => p.category === category)
    .slice(0, 2);

  const displayEstimate = aiEstimate || {
    basePremium: localEst.baseCalculated,
    ageLoadingPercent: localEst.ageLoadingPercent,
    medicalLoadingPercent: localEst.medicalLoadingPercent,
    gstAmount: localEst.gstAmount,
    totalAnnualPremium: localEst.totalAnnual,
    monthlyPremium: localEst.monthly,
    section80dTaxSavings: localEst.taxSavings,
    riskTier: localEst.riskTier,
    keyFactors: [
      `Age ${age} actuarial risk bracket (+${localEst.ageLoadingPercent}% loading applied).`,
      selectedConditions.length > 0
        ? `Medical history adjustment for selected conditions (+${localEst.medicalLoadingPercent}% risk loading).`
        : '100% clean medical history discount applied.',
      `Selected coverage of ₹${(sumInsured / 100000).toFixed(0)} Lakhs (${category.replace('_', ' ')}).`,
      `Includes 18% statutory Goods & Services Tax (GST) as per IRDAI mandates.`,
    ],
    actuarialNote: `Based on an age of ${age} in ${city} with ₹${(sumInsured / 100000).toFixed(0)} Lakhs sum insured, your estimated premium is ₹${localEst.totalAnnual.toLocaleString('en-IN')}/year. Eligible for Section 80D tax savings up to ₹${localEst.taxSavings.toLocaleString('en-IN')}.`,
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300 text-xs font-bold">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>IRDAI Actuarial Premium Underwriting Tool</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Personalized Premium Estimator
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Estimate your exact health and life insurance premium in real time before viewing the catalog. Input your age, coverage amount, and medical history to get transparent 18% GST pricing and Section 80D tax benefit calculations.
          </p>
        </div>
      </div>

      {/* Main Grid: Inputs vs Real-time Estimate Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Input Controls (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>1. Underwriting Parameters</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">Instant Recalculation</span>
          </div>

          {/* Policy Category Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Select Insurance Line
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCategory('HEALTH')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  category === 'HEALTH'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Health Cover</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('TERM_LIFE')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  category === 'TERM_LIFE'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <UserIcon className="w-4 h-4 text-indigo-400" />
                <span>Term Life</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('CAR_MOTOR')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center space-x-2 ${
                  category === 'CAR_MOTOR'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Car / Motor</span>
              </button>
            </div>
          </div>

          {/* INPUT A: Age Input with Slider & Age Quick Presets */}
          <div className="space-y-3 bg-slate-950 p-4.5 rounded-2xl border border-slate-850">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <span>Insured Person's Age</span>
              </label>
              <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
                <input
                  type="number"
                  min={18}
                  max={80}
                  value={age}
                  onChange={(e) => setAge(Math.min(80, Math.max(18, Number(e.target.value))))}
                  className="w-12 bg-transparent text-emerald-400 font-mono font-black text-base text-right focus:outline-none"
                />
                <span className="text-xs text-slate-400 font-bold">Years</span>
              </div>
            </div>

            <input
              type="range"
              min={18}
              max={75}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />

            <div className="flex flex-wrap gap-2 pt-1">
              {[25, 32, 42, 55, 65].map((presetAge) => (
                <button
                  key={presetAge}
                  type="button"
                  onClick={() => setAge(presetAge)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition ${
                    age === presetAge
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {presetAge} yrs {presetAge >= 60 ? '(Senior Citizen)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* INPUT B: Coverage Amount (Sum Insured) */}
          <div className="space-y-3 bg-slate-950 p-4.5 rounded-2xl border border-slate-850">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Desired Coverage Amount (Sum Insured)</span>
              </label>
              <span className="text-base font-black text-amber-400 font-mono">
                ₹{(sumInsured / 100000).toFixed(0)} Lakhs
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[500000, 1000000, 2500000, 5000000].map((amt) => {
                const isSelected = sumInsured === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSumInsured(amt)}
                    className={`py-2 px-3 rounded-xl border text-center transition ${
                      isSelected
                        ? 'bg-indigo-950 border-indigo-500 text-white font-extrabold ring-1 ring-indigo-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-xs font-mono font-bold">
                      ₹{(amt / 100000).toFixed(0)} Lakhs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INPUT C: Medical History & Pre-existing Conditions */}
          <div className="space-y-3 bg-slate-950 p-4.5 rounded-2xl border border-slate-850">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>Medical History & Pre-Existing Conditions</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedConditions.length === 0 ? 'Clean Record (-5% Discount)' : `${selectedConditions.length} Selected`}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              Select any existing health conditions for accurate actuarial risk loading:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {medicalConditionOptions.map((cond) => {
                const isChecked = selectedConditions.includes(cond.id);
                return (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggleCondition(cond.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${
                      isChecked
                        ? 'bg-rose-950/60 border-rose-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          isChecked ? 'bg-rose-500 text-slate-950 font-bold' : 'border border-slate-700'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>{cond.label}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-rose-400">
                      +{cond.loading}%
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedConditions.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedConditions([])}
                className="text-[11px] text-indigo-400 hover:underline font-semibold pt-1 block"
              >
                Clear all medical conditions (Reset to Clean History)
              </button>
            )}
          </div>

          {/* INPUT D: Family & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Family Coverage Scope
              </label>
              <select
                value={familyScope}
                onChange={(e) => setFamilyScope(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Individual">Individual (Self Only)</option>
                <option value="Self + Spouse">Self + Spouse</option>
                <option value="Self + Spouse + 1 Child">Self + Spouse + 1 Child</option>
                <option value="Family Floater (Self + Spouse + 2 Kids)">Family Floater (Self + Spouse + 2 Kids)</option>
                <option value="Senior Citizens (Parents)">Senior Citizens (Parents 60+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                City / Zone
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="Mumbai">Mumbai (Zone A)</option>
                <option value="Delhi NCR">Delhi NCR (Zone A)</option>
                <option value="Bengaluru">Bengaluru (Zone A)</option>
                <option value="Chennai">Chennai (Zone A)</option>
                <option value="Pune">Pune / Tier-2 City</option>
                <option value="Ahmedabad">Ahmedabad / Tier-2 City</option>
              </select>
            </div>
          </div>

          {/* Trigger Full Gemini AI Actuarial Deep Audit */}
          <button
            type="button"
            onClick={handleFetchAIAssessment}
            disabled={isCalculatingAI}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:brightness-110 text-white font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            {isCalculatingAI ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Gemini 3.6 Flash Actuarial Analysis...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Verify with Gemini AI Actuarial Engine</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Premium Card & Recommendations (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Estimate Display Box */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 flex items-center space-x-1">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Estimated Premium Quote</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-extrabold text-[10px] uppercase">
                {displayEstimate.riskTier?.replace('_', ' ')}
              </span>
            </div>

            {/* Pricing Summary */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Estimated Annual Premium</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                  ₹{displayEstimate.totalAnnualPremium.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-400 font-mono">/ year</span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                or approximately <strong className="text-emerald-300">₹{displayEstimate.monthlyPremium.toLocaleString('en-IN')}/month</strong>
              </p>
            </div>

            {/* Cost Breakdown Items */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>Base Risk Rate ({category.replace('_', ' ')}):</span>
                <span>₹{displayEstimate.basePremium.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>+ Age Loading ({age} yrs):</span>
                <span>+{displayEstimate.ageLoadingPercent}%</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>+ Medical Underwriting Loading:</span>
                <span>+{displayEstimate.medicalLoadingPercent}%</span>
              </div>
              <div className="flex justify-between text-amber-300 border-t border-slate-850 pt-2 font-bold">
                <span>Statutory 18% GST (Tax):</span>
                <span>+₹{displayEstimate.gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-400 border-t border-slate-800 pt-2 font-bold font-sans text-[11px]">
                <span>Est. Section 80D Income Tax Savings:</span>
                <span>Save ~₹{displayEstimate.section80dTaxSavings.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Key Factors bullets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Underwriting Insights
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {displayEstimate.keyFactors.map((factor: string, idx: number) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actuarial Note */}
            <p className="text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-850 leading-relaxed italic">
              "{displayEstimate.actuarialNote}"
            </p>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  onApplyEstimateToCatalog({
                    category,
                    sumInsured,
                    maxBudget: displayEstimate.totalAnnualPremium,
                  })
                }
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 shadow-xl transition"
              >
                <span>Browse Matching Policies in Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {openAIAdvisorWithDetails && (
                <button
                  type="button"
                  onClick={openAIAdvisorWithDetails}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 border border-slate-700 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Consult AI Matchmaker with Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Matching Policy Cards */}
          {matchingPolicies.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Insurers Matching Your Profile Budget
              </h4>

              <div className="space-y-3">
                {matchingPolicies.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.insurerLogo}
                        alt={p.insurerName}
                        className="w-9 h-9 rounded-xl object-cover bg-slate-900 border border-slate-800"
                      />
                      <div>
                        <h5 className="font-bold text-white text-xs">{p.planName}</h5>
                        <p className="text-[10px] text-slate-400">
                          {p.insurerName} • CSR {p.claimSettlementRatio}%
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onBuyPolicy(p)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shrink-0 shadow-md flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3 text-slate-950" />
                      <span>Route to Portal</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
