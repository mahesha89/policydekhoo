echo "import React, { useState, useMemo } from 'react';
import { IndianPolicy } from '../types';
import type { User } from '../types';
import { INDIAN_POLICIES } from '../data/mockData';

import {
  Activity,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Stethoscope,
  Clock,
  IndianRupee,
  Layers,
  Sparkles,
  ExternalLink,
  Info,
  Sliders,
  Download,
  Flame,
  Zap,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  FileCheck2,
  Lock,
  Crown,
} from 'lucide-react';

interface HospitalizationScenario {
  name: string;
  category: string;
  avgCost: number;
  roomDays: number;
  icuDays: number;
  surgeonFee: number;
  otCharges: number;
  medicinesCost: number;
  consumablesCost: number;
  diagnosticsCost: number;
}

const PRESET_SCENARIOS: HospitalizationScenario[] = [
  {
    name: 'Cardiac Angioplasty & Stenting',
    category: 'Cardiology',
    avgCost: 350000,
    roomDays: 4,
    icuDays: 2,
    surgeonFee: 90000,
    otCharges: 70000,
    medicinesCost: 60000,
    consumablesCost: 35000,
    diagnosticsCost: 45000,
  },
  {
    name: 'Total Knee Replacement (Single)',
    category: 'Orthopedics',
    avgCost: 280000,
    roomDays: 5,
    icuDays: 0,
    surgeonFee: 80000,
    otCharges: 65000,
    medicinesCost: 40000,
    consumablesCost: 25000,
    diagnosticsCost: 30000,
  },
  {
    name: 'Severe Dengue ICU Treatment',
    category: 'General Medicine',
    avgCost: 160000,
    roomDays: 6,
    icuDays: 3,
    surgeonFee: 30000,
    otCharges: 10000,
    medicinesCost: 50000,
    consumablesCost: 22000,
    diagnosticsCost: 28000,
  },
  {
    name: 'Laparoscopic Cholecystectomy',
    category: 'Gastroenterology',
    avgCost: 120000,
    roomDays: 3,
    icuDays: 0,
    surgeonFee: 40000,
    otCharges: 30000,
    medicinesCost: 20000,
    consumablesCost: 12000,
    diagnosticsCost: 18000,
  },
];

interface OmniClaimSimulatorProps {
  onBuyPolicy: (policy: IndianPolicy) => void;
  openAIAdvisor: () => void;
  onOpenAIProModal?: () => void;
  user?: User | null;
  onOpenAuthModal?: (mode?: 'login' | 'register', reason?: string) => void;
}

export const OmniClaimSimulator: React.FC<OmniClaimSimulatorProps> = ({
  onBuyPolicy,
  openAIAdvisor,
  onOpenAIProModal,
  user,
  onOpenAuthModal,
}) => {
  // Selected Treatment Scenario
  const [selectedPreset, setSelectedPreset] = useState<HospitalizationScenario>(PRESET_SCENARIOS[0]);

  // Dynamic Custom Sliders State
  const [hospitalTier, setHospitalTier] = useState<'METRO_NABH' | 'TIER2_MULTISPECIALTY' | 'LOCAL_CLINIC'>('METRO_NABH');
  const [roomType, setRoomType] = useState<'SINGLE_PRIVATE_AC' | 'SHARED_ROOM' | 'SUITE' | 'DELUXE_SUITE'>('SINGLE_PRIVATE_AC');
  const [actualRoomRentPerDay, setActualRoomRentPerDay] = useState<number>(8000);
  const [roomDays, setRoomDays] = useState<number>(selectedPreset.roomDays);
  const [icuDays, setIcuDays] = useState<number>(selectedPreset.icuDays);

  // Expenses breakdown
  const [surgeonFee, setSurgeonFee] = useState<number>(selectedPreset.surgeonFee);
  const [otCharges, setOtCharges] = useState<number>(selectedPreset.otCharges);
  const [medicinesCost, setMedicinesCost] = useState<number>(selectedPreset.medicinesCost);
  const [consumablesCost, setConsumablesCost] = useState<number>(selectedPreset.consumablesCost);
  const [diagnosticsCost, setDiagnosticsCost] = useState<number>(selectedPreset.diagnosticsCost);

  // Rider Toggles
  const [hasConsumablesRider, setHasConsumablesRider] = useState<boolean>(false);
  const [hasZeroCopayRider, setHasZeroCopayRider] = useState<boolean>(true);

  // Apply preset selection
  const handleSelectPreset = (preset: HospitalizationScenario) => {
    setSelectedPreset(preset);
    setRoomDays(preset.roomDays);
    setIcuDays(preset.icuDays);
    setSurgeonFee(preset.surgeonFee);
    setOtCharges(preset.otCharges);
    setMedicinesCost(preset.medicinesCost);
    setConsumablesCost(preset.consumablesCost);
    setDiagnosticsCost(preset.diagnosticsCost);
  };

  // Total Estimated Bill
  const roomTotalCost = actualRoomRentPerDay * roomDays + (actualRoomRentPerDay * 2) * icuDays;
  const totalHospitalBill = roomTotalCost + surgeonFee + otCharges + medicinesCost + consumablesCost + diagnosticsCost;

  // Filter health policies for simulation (with safety check)
  const healthPolicies = useMemo(() => {
    return INDIAN_POLICIES.filter((p) => p.category === 'HEALTH' && p.roomRentLimit !== undefined);
  }, []);

  // Simulation Algorithm per Policy
  const simulatedResults = useMemo(() => {
    return healthPolicies.map((policy) => {
      const sumInsured = policy.sumInsuredAmount;

      // 1. Room Rent Capping & Proportional Deduction Logic
      let allowedRoomRent = actualRoomRentPerDay;
      let roomProportionalFactor = 1.0;

      // Calculate room limit based on policy terms with safety check
      const roomRentLimit = policy.roomRentLimit || 'No Cap';

      if (roomRentLimit.includes('1%')) {
        allowedRoomRent = Math.min(actualRoomRentPerDay, sumInsured * 0.01);
      } else if (roomRentLimit.includes('Single Private AC') && roomType === 'SUITE') {
        allowedRoomRent = actualRoomRentPerDay * 0.6; // 40% excess
      } else if (roomRentLimit.includes('No Cap')) {
        allowedRoomRent = actualRoomRentPerDay;
      }

      if (allowedRoomRent < actualRoomRentPerDay) {
        roomProportionalFactor = allowedRoomRent / actualRoomRentPerDay;
      }

      // Proportional deduction applies to Surgeon + OT + Doctor charges
      const associatedCharges = surgeonFee + otCharges;
      const approvedAssociatedCharges = associatedCharges * roomProportionalFactor;
      const roomProportionalDeduction = associatedCharges - approvedAssociatedCharges;

      // 2. Consumables Deduction
      let approvedConsumables = consumablesCost;
      let consumablesDeduction = 0;
      if (!hasConsumablesRider) {
        // Without rider, 85% of consumables (PPE, syringes, gloves) are non-payable
        approvedConsumables = consumablesCost * 0.15;
        consumablesDeduction = consumablesCost - approvedConsumables;
      }

      // 3. Copay Calculation
      let copayPercent = policy.copayPercentage || 0;
      if (hasZeroCopayRider) copayPercent = 0;

      // 4. Approved Room & ICU Payout
      const approvedRoomCost = allowedRoomRent * roomDays + (allowedRoomRent * 2) * icuDays;

      // Sum of Approved Payable Items
      const grossApprovedAmount = approvedRoomCost + approvedAssociatedCharges + medicinesCost + approvedConsumables + diagnosticsCost;

      // Apply Copay
      const copayDeduction = grossApprovedAmount * (copayPercent / 100);
      let netClaimPayout = grossApprovedAmount - copayDeduction;

      // Cap at Sum Insured
      netClaimPayout = Math.min(netClaimPayout, sumInsured);

      // Total Out of Pocket for Policyholder
      const outOfPocketExpense = Math.max(0, totalHospitalBill - netClaimPayout);
      const coverageRatio = Math.round((netClaimPayout / totalHospitalBill) * 100);

      return {
        policy,
        totalHospitalBill,
        netClaimPayout: Math.round(netClaimPayout),
        outOfPocketExpense: Math.round(outOfPocketExpense),
        coverageRatio: Math.min(100, Math.max(0, coverageRatio)),
        deductions: {
          roomProportionalDeduction: Math.round(roomProportionalDeduction),
          consumablesDeduction: Math.round(consumablesDeduction),
          copayDeduction: Math.round(copayDeduction),
        },
      };
    });
  }, [
    healthPolicies,
    actualRoomRentPerDay,
    roomDays,
    icuDays,
    surgeonFee,
    otCharges,
    medicinesCost,
    consumablesCost,
    diagnosticsCost,
    roomType,
    hasConsumablesRider,
    hasZeroCopayRider,
    totalHospitalBill,
  ]);

  // Sort best performing policies
  const sortedSimulations = [...simulatedResults].sort((a, b) => b.netClaimPayout - a.netClaimPayout);

  return (
    <div className=\\"space-y-8 animate-in fade-in duration-300\\">
      {/* Header Banner */}
      <div className=\\"bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden\\">
        <div className=\\"absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none\\" />

        <div className=\\"relative z-10 space-y-3 max-w-3xl\\">
          <div className=\\"flex items-center space-x-2\\">
            <span className=\\"px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1.5\\">
              <Sparkles className=\\"w-3.5 h-3.5 text-emerald-400\\" />
              <span>IRDAI OMNI-SIM ΓÇó WORLD-FIRST CLAIM SIMULATOR</span>
            </span>
            <span className=\\"px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/50 text-indigo-300 text-xs font-mono font-bold\\">
              IRDAI CIRCULAR 2024 COMPLIANT
            </span>
          </div>

          <h1 className=\\"text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight\\">
            Quantum Hospitalization Claim & Out-Of-Pocket Simulator
          </h1>

          <p className=\\"text-slate-300 text-xs sm:text-sm leading-relaxed\\">
            Simulate real medical emergencies (Surgeries, ICU Stays, Dengue, Cardiac Angioplasty) with custom room rents, doctor fees, and consumables. Watch in real-time how room rent proportional deductions and non-payable clauses impact your out-of-pocket payout across top Indian health policies!
          </p>
        </div>
      </div>

      {/* Main Simulation Layout: Left Controls, Right Realtime Visualizer */}
      <div className=\\"grid grid-cols-1 lg:grid-cols-12 gap-8\\">
        {/* Left Column: Hospitalization Scenario Builder (5 cols) */}
        <div className=\\"lg:col-span-5 space-y-6\\">
          <div className=\\"bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6\\">
            <div className=\\"flex items-center justify-between border-b border-slate-800 pb-4\\">
              <div className=\\"flex items-center space-x-2\\">
                <Sliders className=\\"w-5 h-5 text-emerald-400\\" />
                <h2 className=\\"text-base font-extrabold text-white\\">Hospitalization Builder</h2>
              </div>
              <span className=\\"text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800\\">
                Total: Γé╣{totalHospitalBill.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Quick Preset Selector Buttons */}
            <div className=\\"space-y-2\\">
              <label className=\\"text-xs font-bold text-slate-300 block\\">
                ⚡ Select Sample Medical Scenario:
              </label>
              <div className=\\"grid grid-cols-2 gap-2\\">
                {PRESET_SCENARIOS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className=\\"p-2.5 rounded-2xl text-left text-xs transition border \\${
                      selectedPreset.name === preset.name
                        ? 'bg-emerald-950/80 border-emerald-500 text-white font-extrabold shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }\\"
                  >
                    <span className=\\"font-bold block truncate\\">{preset.name}</span>
                    <span className=\\"text-[10px] text-emerald-400 font-mono font-bold\\">
                      ~₹{preset.avgCost.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Room Rent & ICU Sliders */}
            <div className=\\"space-y-4 pt-2 border-t border-slate-800\\">
              <div>
                <div className=\\"flex justify-between text-xs font-bold mb-1\\">
                  <span className=\\"text-slate-300\\">Room Rent per Day</span>
                  <span className=\\"text-emerald-400 font-mono\\">₹{actualRoomRentPerDay.toLocaleString('en-IN')}/day</span>
                </div>
                <input
                  type=\\"range\\"
                  min={2000}
                  max={25000}
                  step={500}
                  value={actualRoomRentPerDay}
                  onChange={(e) => setActualRoomRentPerDay(Number(e.target.value))}
                  className=\\"w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer h-2\\"
                />
                <div className=\\"flex justify-between text-[10px] text-slate-500 mt-1 font-mono\\">
                  <span>₹2,000 (Shared)</span>
                  <span>₹8,000 (Private AC)</span>
                  <span>₹25,000 (Suite)</span>
                </div>
              </div>

              <div className=\\"grid grid-cols-2 gap-4\\">
                <div>
                  <div className=\\"flex justify-between text-xs font-bold mb-1\\">
                    <span className=\\"text-slate-300\\">Room Days</span>
                    <span className=\\"text-indigo-400 font-mono\\">{roomDays} days</span>
                  </div>
                  <input
                    type=\\"range\\"
                    min={1}
                    max={15}
                    value={roomDays}
                    onChange={(e) => setRoomDays(Number(e.target.value))}
                    className=\\"w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2\\"
                  />
                </div>

                <div>
                  <div className=\\"flex justify-between text-xs font-bold mb-1\\">
                    <span className=\\"text-slate-300\\">ICU Days</span>
                    <span className=\\"text-amber-400 font-mono\\">{icuDays} days</span>
                  </div>
                  <input
                    type=\\"range\\"
                    min={0}
                    max={7}
                    value={icuDays}
                    onChange={(e) => setIcuDays(Number(e.target.value))}
                    className=\\"w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer h-2\\"
                  />
                </div>
              </div>
            </div>

            {/* Expenses Sliders */}
            <div className=\\"space-y-4 pt-2 border-t border-slate-800\\">
              <div>
                <div className=\\"flex justify-between text-xs font-bold mb-1\\">
                  <span className=\\"text-slate-300\\">Surgeon & Specialist Fee</span>
                  <span className=\\"text-slate-100 font-mono\\">₹{surgeonFee.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type=\\"range\\"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={surgeonFee}
                  onChange={(e) => setSurgeonFee(Number(e.target.value))}
                  className=\\"w-full accent-teal-500 bg-slate-950 rounded-lg cursor-pointer h-2\\"
                />
              </div>

              <div>
                <div className=\\"flex justify-between text-xs font-bold mb-1\\">
                  <span className=\\"text-slate-300\\">Operation Theatre (OT) Charges</span>
                  <span className=\\"text-slate-100 font-mono\\">₹{otCharges.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type=\\"range\\"
                  min={5000}
                  max={150000}
                  step={5000}
                  value={otCharges}
                  onChange={(e) => setOtCharges(Number(e.target.value))}
                  className=\\"w-full accent-teal-500 bg-slate-950 rounded-lg cursor-pointer h-2\\"
                />
              </div>

              <div>
                <div className=\\"flex justify-between text-xs font-bold mb-1\\">
                  <span className=\\"text-slate-300\\">Consumables (Gloves, PPE, Syringes)</span>
                  <span className=\\"text-amber-400 font-mono\\">₹{consumablesCost.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type=\\"range\\"
                  min={2000}
                  max={60000}
                  step={2000}
                  value={consumablesCost}
                  onChange={(e) => setConsumablesCost(Number(e.target.value))}
                  className=\\"w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer h-2\\"
                />
              </div>
            </div>

            {/* Rider Simulation Toggles */}
            <div className=\\"space-y-3 pt-2 border-t border-slate-800 text-xs\\">
              <label className=\\"font-bold text-slate-300 block\\">
                🛡️ Test Optional Policy Riders:
              </label>

              <div className=\\"flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800\\">
                <div>
                  <span className=\\"font-bold text-white block\\">Consumables Cover Rider</span>
                  <span className=\\"text-slate-400 text-[10px]\\">Covers gloves, masks & surgical items</span>
                </div>
                <input
                  type=\\"checkbox\\"
                  checked={hasConsumablesRider}
                  onChange={(e) => setHasConsumablesRider(e.target.checked)}
                  className=\\"w-5 h-5 accent-emerald-500 rounded cursor-pointer\\"
                />
              </div>

              <div className=\\"flex items-center justify-between bg-slate-950 p-3 rounded-2xl border border-slate-800\\">
                <div>
                  <span className=\\"font-bold text-white block\\">Zero Copay / Any Age Cover</span>
                  <span className=\\"text-slate-400 text-[10px]\\">Eliminates mandatory senior copay</span>
                </div>
                <input
                  type=\\"checkbox\\"
                  checked={hasZeroCopayRider}
                  onChange={(e) => setHasZeroCopayRider(e.target.checked)}
                  className=\\"w-5 h-5 accent-emerald-500 rounded cursor-pointer\\"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Realtime Policy Payout Matrix (7 cols) */}
        <div className=\\"lg:col-span-7 space-y-6\\">
          {/* Top Recommendation Summary */}
          {sortedSimulations.length > 0 && (
            <div className=\\"bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/50 rounded-3xl p-6 shadow-xl space-y-3\\">
              <div className=\\"flex items-center justify-between\\">
                <span className=\\"px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center space-x-1\\">
                  <CheckCircle2 className=\\"w-3.5 h-3.5 text-emerald-400\\" />
                  <span>TOP PERFORMING POLICY SIMULATION</span>
                </span>
                <span className=\\"text-xs text-slate-400 font-mono\\">
                  Bill Amount: ₹{totalHospitalBill.toLocaleString('en-IN')}
                </span>
              </div>

              <div className=\\"flex items-center space-x-3\\">
                <div>
                  <h3 className=\\"text-lg font-black text-white leading-tight\\">
                    {sortedSimulations[0].policy.planName}
                  </h3>
                  <p className=\\"text-xs text-slate-300\\">
                    {sortedSimulations[0].policy.insurerName} • Sum Insured ₹{(sortedSimulations[0].policy.sumInsuredAmount / 100000).toFixed(0)} Lakhs
                  </p>
                </div>
              </div>

              <div className=\\"grid grid-cols-3 gap-3 pt-2 text-center\\">
                <div className=\\"bg-slate-950/80 p-3 rounded-2xl border border-slate-800\\">
                  <span className=\\"text-[10px] text-slate-400 font-bold uppercase block\\">Approved Cashless</span>
                  <span className=\\"text-base font-extrabold text-emerald-400 font-mono\\">
                    ₹{sortedSimulations[0].netClaimPayout.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className=\\"bg-slate-950/80 p-3 rounded-2xl border border-slate-800\\">
                  <span className=\\"text-[10px] text-slate-400 font-bold uppercase block\\">Out-Of-Pocket Pay</span>
                  <span className=\\"text-base font-extrabold text-amber-400 font-mono\\">
                    ₹{sortedSimulations[0].outOfPocketExpense.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className=\\"bg-slate-950/80 p-3 rounded-2xl border border-slate-800\\">
                  <span className=\\"text-[10px] text-slate-400 font-bold uppercase block\\">Coverage Ratio</span>
                  <span className=\\"text-base font-extrabold text-indigo-300 font-mono\\">
                    {sortedSimulations[0].coverageRatio}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* List of Simulated Policies with Live Visual Progress Bars */}
          <div className=\\"space-y-4\\">
            <h3 className=\\"text-sm font-extrabold text-white flex items-center space-x-2\\">
              <Activity className=\\"w-4 h-4 text-emerald-400\\" />
              <span>Simulated Claim Payout Breakdown Across All Policies</span>
            </h3>

            {sortedSimulations.map((result) => {
              const { policy, netClaimPayout, outOfPocketExpense, coverageRatio, deductions } = result;

              return (
                <div
                  key={policy.id}
                  className=\\"bg-slate-900 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition space-y-4 shadow-lg\\"
                >
                  {/* Policy Header */}
                  <div className=\\"flex items-start justify-between gap-4\\">
                    <div className=\\"flex items-center space-x-3\\">
                      <div>
                        <h4 className=\\"text-sm font-extrabold text-white\\">{policy.planName}</h4>
                        <p className=\\"text-xs text-slate-400\\">{policy.insurerName}</p>
                      </div>
                    </div>

                    <div className=\\"text-right shrink-0\\">
                      <span className=\\"text-xs text-slate-400 block font-mono\\">
                        Base Premium: <strong className=\\"text-white\\">₹{policy.baseAnnualPremium.toLocaleString('en-IN')}</strong>/yr
                      </span>
                      <button
                        onClick={() => onBuyPolicy(policy)}
                        className=\\"mt-1 px-3 py-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md hover:brightness-110 flex items-center space-x-1\\"
                      >
                        <span>Select & Route</span>
                        <ExternalLink className=\\"w-3 h-3 text-slate-950\\" />
                      </button>
                    </div>
                  </div>

                  {/* Visual Bar Indicator */}
                  <div className=\\"space-y-1.5\\">
                    <div className=\\"flex justify-between text-xs font-mono\\">
                      <span className=\\"text-emerald-400 font-bold\\">
                        Approved: ₹{netClaimPayout.toLocaleString('en-IN')} ({coverageRatio}%)
                      </span>
                      <span className=\\"text-amber-400 font-bold\\">
                        You Pay: ₹{outOfPocketExpense.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className=\\"w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800\\">
                      <div
                        style={{ width: `${coverageRatio}%` }}
                        className=\\"bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300\\"
                      />
                      <div
                        style={{ width: `${100 - coverageRatio}%` }}
                        className=\\"bg-amber-500/80 h-full transition-all duration-300\\"
                      />
                    </div>
                  </div>

                  {/* Deductions Breakdown Pills */}
                  <div className=\\"grid grid-cols-3 gap-2 text-[11px]\\">
                    <div className=\\"bg-slate-950 p-2 rounded-xl border border-slate-800/80\\">
                      <span className=\\"text-slate-400 block font-bold\\">Room Rent Penalty</span>
                      <span className=\\"text-rose-400 font-mono font-extrabold\\">
                        -₹{deductions.roomProportionalDeduction.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className=\\"bg-slate-950 p-2 rounded-xl border border-slate-800/80\\">
                      <span className=\\"text-slate-400 block font-bold\\">Consumables Cut</span>
                      <span className=\\"text-amber-400 font-mono font-extrabold\\">
                        -₹{deductions.consumablesDeduction.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className=\\"bg-slate-950 p-2 rounded-xl border border-slate-800/80\\">
                      <span className=\\"text-slate-400 block font-bold\\">Co-Pay Deduction</span>
                      <span className=\\"text-indigo-400 font-mono font-extrabold\\">
                        -₹{deductions.copayDeduction.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};" > src\components\OmniClaimSimulator.tsx