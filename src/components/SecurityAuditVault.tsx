import React, { useState } from 'react';
import { User } from '../types';
import {
  ShieldCheck,
  Lock,
  Key,
  FileCheck2,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Cpu,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldAlert,
  Fingerprint,
  Database,
  History,
  FileText,
  UserCheck,
} from 'lucide-react';

interface SecurityAuditVaultProps {
  user: User | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
}

export const SecurityAuditVault: React.FC<SecurityAuditVaultProps> = ({ user, onOpenAuthModal }) => {
  // Tab within Security Vault
  const [subTab, setSubTab] = useState<'ledger' | 'bill-auditor' | 'encryption'>('ledger');

  // Ledger State
  const [searchPolicy, setSearchPolicy] = useState<string>('POL-IND-2026-881920');
  const [verifying, setVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Bill Auditor State
  const [hospitalName, setHospitalName] = useState<string>('Apollo Super Specialty Hospital');
  const [diagnosis, setDiagnosis] = useState<string>('Dengue Hemorrhagic Fever / Acute ICU');
  const [billItems, setBillItems] = useState([
    { item: 'ICU Day 1 to Day 3 Charges', cost: 48000 },
    { item: 'Doctor Visiting & Specialist Fees', cost: 15000 },
    { item: 'Pharmacy & Special Injectables', cost: 22000 },
    { item: 'Hospital PPE, Sanitizers & Gloves (Consumables)', cost: 12000 },
  ]);
  const [auditing, setAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // Locked Gateway Screen for Unauthenticated General Users
  if (!user) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center mx-auto shadow-xl">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
              AUTHENTICATION REQUIRED • GENERAL USER ACCESS RESTRICTED
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Security Vault & Cryptographic Ledger Locked
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              In accordance with IRDAI Cybersecurity Regulations, access to policy SHA-256 cryptographic verification, Gemini AI hospital bill forensic auditing, and AES-256 data logs requires an authenticated user profile.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onOpenAuthModal('login')}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/50 flex items-center space-x-2 transition"
            >
              <UserCheck className="w-4 h-4 text-slate-950" />
              <span>Sign In to Access Vault</span>
            </button>

            <button
              onClick={() => onOpenAuthModal('register')}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 flex items-center space-x-2 transition"
            >
              <span>Register New User</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* Locked Feature Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-3 opacity-75">
            <div className="flex items-center justify-between">
              <Fingerprint className="w-6 h-6 text-emerald-400" />
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                LOCKED
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">SHA-256 Ledger Audit</h3>
            <p className="text-xs text-slate-400">
              Verify policy certificate hashes on the IRDAI decentralized node to confirm tamper-proof authenticity.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-3 opacity-75">
            <div className="flex items-center justify-between">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                LOCKED
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">Gemini 3.6 Forensic Auditor</h3>
            <p className="text-xs text-slate-400">
              Upload and audit hospital bills for unbundled ICU charges, room rent capping breaches, and NPPA price ceilings.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-3 opacity-75">
            <div className="flex items-center justify-between">
              <Lock className="w-6 h-6 text-cyan-400" />
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                LOCKED
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">AES-256 Health Vault</h3>
            <p className="text-xs text-slate-400">
              Store ABHA health records, KYC identification docs, and digital policy certificates with end-to-end encryption.
            </p>
          </div>
        </div>
      </div>
    );
  }


  // Handle Verify Ledger Hash
  const handleVerifyLedger = async () => {
    if (!searchPolicy.trim()) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/verify-policy-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyNumber: searchPolicy }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationResult(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  // Handle Audit Hospital Bill
  const handleAuditBill = async () => {
    setAuditing(true);
    const totalAmount = billItems.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    try {
      const res = await fetch('/api/audit-hospital-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billItems,
          totalAmount,
          hospitalName,
          diagnosis,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAuditResult(data.auditResult);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuditing(false);
    }
  };

  const updateBillItem = (index: number, key: 'item' | 'cost', value: any) => {
    const copy = [...billItems];
    copy[index] = { ...copy[index], [key]: key === 'cost' ? Number(value) : value };
    setBillItems(copy);
  };

  const addBillItem = () => {
    setBillItems([...billItems, { item: 'New Diagnostics / Procedure', cost: 5000 }]);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-emerald-500/50 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-bold">
            <Fingerprint className="w-4 h-4 text-emerald-400" />
            <span>IRDAI Cryptographic Ledger & Forensic Vault</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Security, Cryptography & AI Fraud Vault
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Verify policy SHA-256 cryptographic hashes on the IRDAI decentralized node, audit hospital bills with Gemini 3.6 Flash forensic intelligence, and review enterprise AES-256 encryption status.
          </p>
        </div>
      </div>

      {/* Vault Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('ledger')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 ${
            subTab === 'ledger'
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>SHA-256 Cryptographic Ledger</span>
        </button>

        <button
          onClick={() => setSubTab('bill-auditor')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 ${
            subTab === 'bill-auditor'
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>AI Hospital Bill & Fraud Auditor</span>
        </button>

        <button
          onClick={() => setSubTab('encryption')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition flex items-center space-x-2 ${
            subTab === 'encryption'
              ? 'bg-emerald-950 border border-emerald-500 text-emerald-300 shadow-lg'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4 text-amber-400" />
          <span>AES-256 Vault Safeguards</span>
        </button>
      </div>

      {/* SUB-TAB 1: SHA-256 Cryptographic Ledger Verifier */}
      {subTab === 'ledger' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="space-y-1 border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-emerald-400" />
                <span>Verify Policy / COI Cryptographic Hash</span>
              </h3>
              <p className="text-xs text-slate-400">
                Enter any policy number or COI hash to query the IRDAI tamper-proof registry node.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Policy Number / COI Certificate ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchPolicy}
                  onChange={(e) => setSearchPolicy(e.target.value)}
                  placeholder="e.g. POL-IND-2026-881920"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleVerifyLedger}
                  disabled={verifying}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition disabled:opacity-50 shrink-0"
                >
                  {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Verify</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-850 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Sample Verified Policy Hashes
              </span>
              <div className="space-y-1.5 font-mono text-xs">
                {['POL-IND-2026-881920', 'POL-IND-2026-541092', 'COI-HASH-883921'].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSearchPolicy(num)}
                    className="block text-emerald-400 hover:underline text-left"
                  >
                    • {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>IRDAI Ledger Inspection Output</span>
            </h3>

            {verificationResult ? (
              <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Query ID:</span>
                  <span className="text-white font-bold">{verificationResult.query}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                  <span className="text-slate-400">Cryptographic Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold">
                    {verificationResult.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">SHA-256 Hash Digest:</span>
                  <p className="text-emerald-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
                    {verificationResult.ledgerRecord?.sha256Hash}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">Digital Signature:</span>
                  <p className="text-slate-200 bg-slate-900 p-2 rounded border border-slate-800">
                    {verificationResult.ledgerRecord?.digitalSignature}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block">Audit Trail Entries:</span>
                  <ul className="list-disc pl-4 text-slate-300 space-y-1">
                    {verificationResult.ledgerRecord?.auditTrail.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Database className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                <p className="text-xs">Click "Verify" above to inspect IRDAI cryptographic ledger records.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AI Hospital Bill & Fraud Auditor */}
      {subTab === 'bill-auditor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <span>Forensic Hospital Bill Auditor</span>
              </h3>
              <p className="text-xs text-slate-400">
                Input line items from a hospital discharge summary or medical invoice to run Gemini 3.6 Flash line-by-line IRDAI fraud & overcharging audits.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hospital Name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Diagnosis / Treatment</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Bill Line Items Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Bill Line Items (Total: ₹{billItems.reduce((a, c) => a + (Number(c.cost) || 0), 0).toLocaleString('en-IN')})
                </label>
                <button
                  type="button"
                  onClick={addBillItem}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-2">
                {billItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.item}
                      onChange={(e) => updateBillItem(idx, 'item', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
                    />
                    <div className="w-28 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2 py-2">
                      <span className="text-xs text-slate-500 font-mono pr-1">₹</span>
                      <input
                        type="number"
                        value={item.cost}
                        onChange={(e) => updateBillItem(idx, 'cost', e.target.value)}
                        className="w-full bg-transparent text-xs text-amber-400 font-mono font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleAuditBill}
              disabled={auditing}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-emerald-500 hover:brightness-110 text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {auditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Auditing with Gemini 3.6 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Run AI Forensic Bill Audit</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Audit Results */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>AI Audit Report & Flagged Deductions</span>
            </h3>

            {auditResult ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Approved Payout</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      ₹{auditResult.approvedAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black">
                    Fraud Score: {auditResult.fraudScore}/100
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-300 uppercase block">Line-by-Line Verdicts</span>
                  <div className="space-y-2 text-xs">
                    {auditResult.findings?.map((f: any, idx: number) => (
                      <div key={idx} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex justify-between font-bold text-white">
                          <span>{f.item}</span>
                          <span className={f.status === 'FLAGGED' ? 'text-amber-400' : 'text-emerald-400'}>
                            {f.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{f.note}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-850 italic">
                  "{auditResult.aiSummary}"
                </p>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <FileSpreadsheet className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                <p className="text-xs">Run the AI Forensic Bill Audit to inspect line item breakdown.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AES-256 & Security Safeguards */}
      {subTab === 'encryption' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <Lock className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-lg font-extrabold text-white">PolicyDekho Security Architecture</h3>
              <p className="text-xs text-slate-400">Enterprise grade safeguards conforming to IRDAI & MeitY cybersecurity standards.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <Key className="w-6 h-6 text-emerald-400" />
              <h4 className="font-extrabold text-white text-sm">AES-256-GCM Storage Encryption</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                All saved health records, nominee details, and policy PDFs are encrypted at rest with military-grade keys.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <Fingerprint className="w-6 h-6 text-indigo-400" />
              <h4 className="font-extrabold text-white text-sm">WebAuthn Biometric Session Lock</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optional hardware security key and fingerprint passkey lock on sensitive policy documents and tax certificates.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h4 className="font-extrabold text-white text-sm">Zero-Knowledge AI Sandbox</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gemini 3.6 Flash queries execute in ephemeral server-side sandboxes. No personal data is used for AI retraining.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
