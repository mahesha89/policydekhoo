import React from 'react';
import { IndianPolicy } from '../types';
import {
  ShieldCheck,
  Check,
  X,
  ArrowLeft,
  Zap,
  Star,
  Building2,
  IndianRupee,
  Layers,
  Sparkles,
  AlertCircle,
  TrendingUp,
  LineChart as LineChartIcon,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface PolicyComparisonViewProps {
  comparedPolicies: IndianPolicy[];
  onRemoveFromCompare: (id: string) => void;
  onBuyPolicy: (policy: IndianPolicy) => void;
  onBackToCatalog: () => void;
  openAIAdvisor: () => void;
}

const AGE_GROUPS = [
  { label: 'Age 20', age: 20, multiplier: 0.82 },
  { label: 'Age 30', age: 30, multiplier: 1.00 },
  { label: 'Age 40', age: 40, multiplier: 1.22 },
  { label: 'Age 50', age: 50, multiplier: 1.55 },
  { label: 'Age 60', age: 60, multiplier: 2.05 },
  { label: 'Age 70', age: 70, multiplier: 2.70 },
];

const POLICY_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4', '#ec4899'];

export const PolicyComparisonView: React.FC<PolicyComparisonViewProps> = ({
  comparedPolicies,
  onRemoveFromCompare,
  onBuyPolicy,
  onBackToCatalog,
  openAIAdvisor,
}) => {
  if (comparedPolicies.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">No Policies Selected for Comparison</h2>
        <p className="text-slate-400 text-sm">
          Select 2 or 3 policies from the catalog to compare Claim Settlement Ratios (CSR), cashless hospital networks, room rent caps, and premiums side-by-side.
        </p>
        <button
          onClick={onBackToCatalog}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-sm hover:bg-emerald-400 transition"
        >
          Browse Insurance Catalog
        </button>
      </div>
    );
  }

  // Generate chart data mapping age groups to calculated annual premiums (incl. 18% GST)
  const chartData = AGE_GROUPS.map((group) => {
    const point: Record<string, any> = { ageGroup: group.label };
    comparedPolicies.forEach((policy) => {
      const baseWithGst = Math.round(policy.baseAnnualPremium * 1.18);
      point[policy.id] = Math.round(baseWithGst * group.multiplier);
    });
    return point;
  });

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBackToCatalog}
            className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1 mb-1 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Policies</span>
          </button>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Side-by-Side Policy Comparison Matrix
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Comparing {comparedPolicies.length} Indian insurance plans verified against IRDAI official annual report benchmarks.
          </p>
        </div>

        <button
          onClick={openAIAdvisor}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg hover:brightness-110"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Ask AI to Recommend Winner</span>
        </button>
      </div>

      {/* Age Group Premium Price Trend Line Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Actuarial Rate Progression</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              Premium Price Trends Across Age Groups
            </h3>
            <p className="text-xs text-slate-400">
              Projected annual premiums (inclusive of statutory 18% GST) as policyholders age from 20 to 70 years.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <LineChartIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono font-bold text-slate-300">Recharts Interactive Mode</span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="ageGroup"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#020617',
                  borderColor: '#334155',
                  borderRadius: '1rem',
                  padding: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
                labelStyle={{ color: '#f8fafc', fontWeight: 800, marginBottom: '8px' }}
                formatter={(value: any, name: any) => {
                  const policy = comparedPolicies.find((p) => p.id === name);
                  const label = policy ? `${policy.planName} (${policy.insurerName})` : name;
                  return [`₹${Number(value).toLocaleString('en-IN')}/yr`, label];
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                formatter={(value) => {
                  const policy = comparedPolicies.find((p) => p.id === value);
                  return (
                    <span className="text-slate-200 font-bold ml-1">
                      {policy ? `${policy.planName}` : value}
                    </span>
                  );
                }}
              />
              {comparedPolicies.map((policy, idx) => (
                <Line
                  key={policy.id}
                  type="monotone"
                  dataKey={policy.id}
                  name={policy.id}
                  stroke={POLICY_COLORS[idx % POLICY_COLORS.length]}
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#0f172a' }}
                  activeDot={{ r: 8, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/80">
              <th className="p-4 w-64 text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-slate-950">
                Feature / Metric
              </th>
              {comparedPolicies.map((p) => (
                <th key={p.id} className="p-4 min-w-[260px] border-l border-slate-800 bg-slate-900/60">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <img
                        src={p.insurerLogo}
                        alt={p.insurerName}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-950"
                      />
                      <button
                        onClick={() => onRemoveFromCompare(p.id)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-base leading-tight">{p.planName}</h3>
                      <p className="text-xs text-slate-400">{p.insurerName}</p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => onBuyPolicy(p)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-md flex items-center justify-center space-x-1 group"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-950 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Select & Route to Portal</span>
                      </button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/80 text-xs">
            {/* Row: IRDAI Claim Settlement Ratio */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-extrabold text-slate-200 bg-slate-950/40">
                IRDAI Claim Settlement Ratio (CSR)
              </td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 font-mono">
                  <span className="text-base font-black text-emerald-400">{p.claimSettlementRatio}%</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">IRDAI Official Rating</p>
                </td>
              ))}
            </tr>

            {/* Row: Incurred Claim Ratio */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Incurred Claim Ratio (ICR)</td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 font-mono font-bold text-slate-200">
                  {p.incurredClaimRatio}%
                </td>
              ))}
            </tr>

            {/* Row: Cashless Hospitals / Garages */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Cashless Network Count</td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 font-mono font-extrabold text-cyan-400">
                  {p.networkCount.toLocaleString('en-IN')}+ Cashless Network
                </td>
              ))}
            </tr>

            {/* Row: Room Rent Capping */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Room Rent Limit</td>
              {comparedPolicies.map((p) => {
                const isNoCap = p.roomRentCap.toLowerCase().includes('no');
                return (
                  <td key={p.id} className="p-4 border-l border-slate-800 font-semibold">
                    <span className={isNoCap ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                      {p.roomRentCap}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row: Restoration Benefit */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Sum Insured Restoration</td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 text-slate-200 font-medium">
                  {p.restoreBenefit}
                </td>
              ))}
            </tr>

            {/* Row: Pre & Post Hospitalization */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Pre / Post Hospitalization</td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 text-slate-200">
                  {p.prePostHospitalization}
                </td>
              ))}
            </tr>

            {/* Row: Waiting Period */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Pre-Existing Disease Wait</td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 text-slate-200 font-mono">
                  {p.waitingPeriodPreExisting}
                </td>
              ))}
            </tr>

            {/* Row: Co-Payment Clause */}
            <tr className="hover:bg-slate-850/50">
              <td className="p-4 font-bold text-slate-300 bg-slate-950/40">Co-Pay Deduction</td>
              {comparedPolicies.map((p) => (
                <td key={p.id} className="p-4 border-l border-slate-800 text-emerald-400 font-bold">
                  {p.copay}
                </td>
              ))}
            </tr>

            {/* Row: Annual Premium (+ 18% GST) */}
            <tr className="bg-slate-950/80">
              <td className="p-4 font-black text-white bg-slate-950">
                Annual Premium (incl. 18% GST)
              </td>
              {comparedPolicies.map((p) => {
                const gst = Math.round(p.baseAnnualPremium * 0.18);
                const total = p.baseAnnualPremium + gst;
                return (
                  <td key={p.id} className="p-4 border-l border-slate-800">
                    <div className="text-xl font-black text-white font-mono">
                      ₹{total.toLocaleString('en-IN')}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      ₹{p.baseAnnualPremium.toLocaleString('en-IN')} base + ₹{gst.toLocaleString('en-IN')} GST
                    </p>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

