import React, { useState, useMemo } from 'react';
import { IndianPolicy } from '../types';
import type { User } from '../types';
import { INDIAN_POLICIES } from '../data/mockData';
import {
  Activity,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Sliders,
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
  const [selectedPreset, setSelectedPreset] = useState<HospitalizationScenario>(PRESET_SCENARIOS[0]);
  const [actualRoomRentPerDay, setActualRoomRentPerDay] = useState<number>(8000);
  const [roomDays, setRoomDays] = useState<number>(selectedPreset.roomDays);
  const [icuDays, setIcuDays] = useState<number>(selectedPreset.icuDays);
  const [surgeonFee, setSurgeonFee] = useState<number>(selectedPreset.surgeonFee);
  const [otCharges, setOtCharges] = useState<number>(selectedPreset.otCharges);
  const [medicinesCost, setMedicinesCost] = useState<number>(selectedPreset.medicinesCost);
  const [consumablesCost, setConsumablesCost] = useState<number>(selectedPreset.consumablesCost);
  const [diagnosticsCost, setDiagnosticsCost] = useState<number>(selectedPreset.diagnosticsCost);
  const [hasConsumablesRider, setHasConsumablesRider] = useState<boolean>(false);
  const [hasZeroCopayRider, setHasZeroCopayRider] = useState<boolean>(true);
  const [roomType] = useState<'SINGLE_PRIVATE_AC'>('SINGLE_PRIVATE_AC');

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

  const roomTotalCost = actualRoomRentPerDay * roomDays + (actualRoomRentPerDay * 2) * icuDays;
  const totalHospitalBill = roomTotalCost + surgeonFee + otCharges + medicinesCost + consumablesCost + diagnosticsCost;

  const healthPolicies = useMemo(() => {
    return INDIAN_POLICIES.filter((p) => p.category === 'HEALTH' && p.roomRentLimit !== undefined);
  }, []);

  const simulatedResults = useMemo(() => {
    return healthPolicies.map((policy) => {
      const sumInsured = policy.sumInsuredAmount;
      let allowedRoomRent = actualRoomRentPerDay;
      let roomProportionalFactor = 1.0;

      const roomRentLimit = policy.roomRentLimit || 'No Cap';

      if (roomRentLimit.includes('1%')) {
        allowedRoomRent = Math.min(actualRoomRentPerDay, sumInsured * 0.01);
      } else if (roomRentLimit.includes('Single Private AC') && roomType === 'SUITE') {
        allowedRoomRent = actualRoomRentPerDay * 0.6;
      } else if (roomRentLimit.includes('No Cap')) {
        allowedRoomRent = actualRoomRentPerDay;
      }

      if (allowedRoomRent < actualRoomRentPerDay) {
        roomProportionalFactor = allowedRoomRent / actualRoomRentPerDay;
      }

      const associatedCharges = surgeonFee + otCharges;
      const approvedAssociatedCharges = associatedCharges * roomProportionalFactor;
      const roomProportionalDeduction = associatedCharges - approvedAssociatedCharges;

      let approvedConsumables = consumablesCost;
      let consumablesDeduction = 0;
      if (!hasConsumablesRider) {
        approvedConsumables = consumablesCost * 0.15;
        consumablesDeduction = consumablesCost - approvedConsumables;
      }

      let copayPercent = policy.copayPercentage || 0;
      if (hasZeroCopayRider) copayPercent = 0;

      const approvedRoomCost = allowedRoomRent * roomDays + (allowedRoomRent * 2) * icuDays;
      const grossApprovedAmount = approvedRoomCost + approvedAssociatedCharges + medicinesCost + approvedConsumables + diagnosticsCost;
      const copayDeduction = grossApprovedAmount * (copayPercent / 100);
      let netClaimPayout = grossApprovedAmount - copayDeduction;
      netClaimPayout = Math.min(netClaimPayout, sumInsured);

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

  const sortedSimulations = [...simulatedResults].sort((a, b) => b.netClaimPayout - a.netClaimPayout);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>IRDAI OMNI-SIM</span>
          </span>
        </div>
        <h1 className="text-2xl font-black text-white">Quantum Hospitalization Claim Simulator</h1>
        <p className="text-slate-300 text-sm mt-1">Simulate claims with real-time out-of-pocket calculations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Hospitalization Builder</h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                ₹{totalHospitalBill.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-bold text-slate-300 block">Select Medical Scenario:</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SCENARIOS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl text-left text-xs transition border ${
                      selectedPreset.name === preset.name
                        ? 'bg-emerald-950/80 border-emerald-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block truncate">{preset.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      ₹{preset.avgCost.toLocaleString('en-IN')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-300">Room Rent/Day</span>
                  <span className="text-emerald-400 font-mono">₹{actualRoomRentPerDay.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={25000}
                  step={500}
                  value={actualRoomRentPerDay}
                  onChange={(e) => setActualRoomRentPerDay(Number(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Room Days</span>
                    <span className="text-indigo-400 font-mono">{roomDays}</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={roomDays}
                    onChange={(e) => setRoomDays(Number(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">ICU Days</span>
                    <span className="text-amber-400 font-mono">{icuDays}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={7}
                    value={icuDays}
                    onChange={(e) => setIcuDays(Number(e.target.value))}
                    className="w-full accent-amber-500 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          {sortedSimulations.length > 0 && (
            <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/50 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  TOP PERFORMING POLICY
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Bill: ₹{totalHospitalBill.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Approved</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    ₹{sortedSimulations[0].netClaimPayout.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Out-of-Pocket</span>
                  <span className="text-base font-extrabold text-amber-400 font-mono">
                    ₹{sortedSimulations[0].outOfPocketExpense.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Coverage</span>
                  <span className="text-base font-extrabold text-indigo-300 font-mono">
                    {sortedSimulations[0].coverageRatio}%
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Policy Payout Breakdown
            </h3>
            {sortedSimulations.map((result) => (
              <div key={result.policy.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{result.policy.planName}</h4>
                    <p className="text-xs text-slate-400">{result.policy.insurerName}</p>
                  </div>
                  <button
                    onClick={() => onBuyPolicy(result.policy)}
                    className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:brightness-110 flex items-center gap-1"
                  >
                    Select <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400">Approved: ₹{result.netClaimPayout.toLocaleString('en-IN')} ({result.coverageRatio}%)</span>
                  <span className="text-amber-400">You Pay: ₹{result.outOfPocketExpense.toLocaleString('en-IN')}</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden mt-1">
                  <div style={{ width: `${result.coverageRatio}%` }} className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OmniClaimSimulator;