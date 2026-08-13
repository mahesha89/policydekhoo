import React, { useState } from 'react';
import { CertificateOfInsurance, IndianPolicy, BoughtPolicy } from '../types';
import { FileText, Printer, Copy, Check, ShieldCheck, X, IndianRupee } from 'lucide-react';

interface COIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  boughtPolicies?: BoughtPolicy[];
}

export const COIGeneratorModal: React.FC<COIGeneratorModalProps> = ({
  isOpen,
  onClose,
  boughtPolicies = [],
}) => {
  if (!isOpen) return null;

  const [holderName, setHolderName] = useState('Employer HR & Visa Verification Department');
  const [holderAddress, setHolderAddress] = useState('Bandha Kurla Complex (BKC), Mumbai, Maharashtra');
  const [copied, setCopied] = useState(false);

  const activePolicy = boughtPolicies[0] || {
    policyNumber: 'POL-IND-2026-889101',
    insurerName: 'Star Health Insurance',
    planName: 'Comprehensive Optima Plan',
    proposerName: 'Rajesh Kumar Sharma',
    sumInsured: 1000000,
    policyStartDate: '2026-02-10',
    policyEndDate: '2027-02-09',
    uin: 'SHAHLIP21128V042021',
    cashlessCardNumber: 'STAR-CS-889101-IND',
  };

  const handleCopy = () => {
    const text = `IRDAI CERTIFICATE OF INSURANCE (COI) & COVERAGE PROOF
Certificate Number: COI-IND-2026-${Math.floor(Math.random() * 89999 + 10000)}
Issue Date: ${new Date().toISOString().split('T')[0]}
Insurer: ${activePolicy.insurerName} (IRDAI Compliant Insurer)
Policy Number: ${activePolicy.policyNumber}
Insured Proposer: ${activePolicy.proposerName}
Sum Insured Cover: ₹${(activePolicy.sumInsured / 100000).toFixed(0)} Lakhs
Validity: ${activePolicy.policyStartDate} to ${activePolicy.policyEndDate}
Certificate Holder: ${holderName}

SECTION 80D TAX EXEMPTION STATUS: VERIFIED ACTIVE
Cashless Hospital Network: 14,200+ Hospitals across India`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">IRDAI Certificate of Insurance (COI)</h3>
              <p className="text-xs text-slate-400 font-mono">Official Indian Policy Certificate & Section 80D Proof</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-850 text-xs">
          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">Certificate Holder Name</label>
            <input
              type="text"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-400 uppercase mb-1">Holder Address / Institution</label>
            <input
              type="text"
              value={holderAddress}
              onChange={(e) => setHolderAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Certificate Printable Preview Box */}
        <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 text-slate-200 font-mono text-xs space-y-4 printable-coi">
          <div className="flex justify-between items-start border-b border-slate-800 pb-3">
            <div>
              <span className="text-emerald-400 font-extrabold text-sm block">IRDAI OFFICIAL CERTIFICATE OF INSURANCE</span>
              <span className="text-[10px] text-slate-400 block">BROKER: PolicyDekho Insurance Broking Pvt Ltd (IRDAI Reg #882)</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">DATE: {new Date().toISOString().split('T')[0]}</span>
              <span className="text-[11px] text-cyan-400 font-bold block">CERT #: COI-IND-2026-9941</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">INSURED POLICYHOLDER:</span>
              <span className="font-bold text-white block">{activePolicy.proposerName}</span>
              <span className="text-slate-400 text-[11px]">Policy Number: {activePolicy.policyNumber}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">CERTIFICATE HOLDER:</span>
              <span className="font-bold text-cyan-300 block">{holderName}</span>
              <span className="text-slate-400 text-[11px]">{holderAddress}</span>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">COVERAGE DETAILS BOUND:</span>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
              <div className="flex justify-between font-bold text-white">
                <span>{activePolicy.planName} ({activePolicy.insurerName})</span>
                <span className="text-emerald-400">₹{(activePolicy.sumInsured / 100000).toFixed(0)} Lakhs Cover</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>UIN: {activePolicy.uin || 'SHAHLIP21128V042021'}</span>
                <span>Section 80D Tax Qualified: YES</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800">
            <span className="flex items-center text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 mr-1 text-emerald-400" /> Digitally Verified IRDAI Registry Node #IND-882
            </span>
            <span>100% Cashless Authorized</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied!' : 'Copy Text'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center space-x-1.5 shadow-lg transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official COI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
