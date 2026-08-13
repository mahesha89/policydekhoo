import React, { useState, useEffect } from 'react';
import { IndianPolicy, BoughtPolicy } from '../types';
import type { User } from '../types';
import { getCompanyPortalInfo } from '../utils/companyPortals';
import { X, Check, Zap, IndianRupee, ShieldCheck, FileText, Smartphone, CreditCard, Building, ArrowRight, Download, QrCode, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';

interface BuyPolicyModalProps {
  policy: IndianPolicy | null;
  onClose: () => void;
  onSuccess: (boughtPolicy: BoughtPolicy) => void;
  user?: User | null;
}

export const BuyPolicyModal: React.FC<BuyPolicyModalProps> = ({
  policy,
  onClose,
  onSuccess,
  user,
}) => {
  if (!policy) return null;

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State initialized from authenticated user
  const [proposerName, setProposerName] = useState(user?.fullName || 'Rajesh Kumar Sharma');
  const [mobile, setMobile] = useState(user?.phone ? user.phone.replace('+91', '').trim() : '9876543210');
  const [email, setEmail] = useState(user?.email || 'rajesh.sharma@gmail.com');
  const [age, setAge] = useState(32);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pinCode, setPinCode] = useState(user?.pincode || '400001');
  const [panNumber, setPanNumber] = useState('ABCDE1234F');

  useEffect(() => {
    if (user) {
      if (user.fullName) setProposerName(user.fullName);
      if (user.email) setEmail(user.email);
      if (user.phone) setMobile(user.phone.replace('+91', '').trim());
      if (user.city) setCity(user.city);
      if (user.pincode) setPinCode(user.pincode);
    }
  }, [user]);

  // Sum Insured & Addons
  const [selectedSumInsured, setSelectedSumInsured] = useState<number>(policy.sumInsuredOptions[1] || policy.sumInsuredOptions[0]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);

  // Nominee
  const [nomineeName, setNomineeName] = useState('Priya Sharma');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'CARD'>('UPI');
  const [upiApp, setUpiApp] = useState<'PHONEPE' | 'GPAY' | 'PAYTM'>('PHONEPE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedPolicy, setIssuedPolicy] = useState<BoughtPolicy | null>(null);

  // Calculate Premiums
  const selectedAddonsObj = policy.addonsAvailable.filter((a) => selectedAddonIds.includes(a.id));
  const addonsTotalCost = selectedAddonsObj.reduce((acc, curr) => acc + curr.price, 0);

  // Scaling factor based on sum insured selected vs base
  const sumInsuredMultiplier = selectedSumInsured / (policy.sumInsuredOptions[0] || 500000);
  const basePremiumCalculated = Math.round(policy.baseAnnualPremium * (1 + (sumInsuredMultiplier - 1) * 0.35)) + addonsTotalCost;

  const gstAmount = Math.round(basePremiumCalculated * 0.18);
  const totalAmountToPay = basePremiumCalculated + gstAmount;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleProcessPayment = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/purchase-policy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          planId: policy.id,
          insurerName: policy.insurerName,
          planName: policy.planName,
          category: policy.category,
          proposerName,
          mobile: `+91 ${mobile}`,
          email,
          city,
          state,
          pinCode,
          sumInsured: selectedSumInsured,
          basePremium: basePremiumCalculated,
          nomineeName,
          nomineeRelation,
          selectedAddons: selectedAddonsObj.map((a) => a.title),
        }),
      });

      const data = await response.json();
      if (data.success && data.policy) {
        setIssuedPolicy(data.policy);
        onSuccess(data.policy);
        setStep(5); // Show Success Confirmation
      } else {
        alert('Could not complete purchase. Please check details.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while processing purchase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={policy.insurerLogo}
              alt={policy.insurerName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-950"
            />
            <div>
              <h3 className="font-extrabold text-white text-base leading-tight">
                Buy {policy.planName}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {policy.insurerName} • IRDAI Reg UIN: {policy.uin}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.open(getCompanyPortalInfo(policy.insurerName).portalUrl, '_blank', 'noopener,noreferrer')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-extrabold text-xs border border-slate-700 flex items-center space-x-1.5 transition"
              title={`Open ${policy.insurerName} Official Portal`}
            >
              <span>{policy.insurerName} Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress Step Indicator */}
        {step < 5 && (
          <div className="bg-slate-950/80 px-6 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>1</span>
              <span className={step === 1 ? 'font-bold text-white' : 'text-slate-400'}>Insured Details</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-800" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>2</span>
              <span className={step === 2 ? 'font-bold text-white' : 'text-slate-400'}>Cover & Add-ons</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-800" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>3</span>
              <span className={step === 3 ? 'font-bold text-white' : 'text-slate-400'}>Nominee KYC</span>
            </div>
            <div className="h-0.5 w-8 bg-slate-800" />
            <div className="flex items-center space-x-2">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>4</span>
              <span className={step === 4 ? 'font-bold text-white' : 'text-slate-400'}>Payment</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* STEP 1: Insured Member Details */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-white text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Step 1: Primary Proposer & Member Details</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Legal Name (as per Aadhaar)</label>
                  <input
                    type="text"
                    value={proposerName}
                    onChange={(e) => setProposerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mobile Number (+91)</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Age of Oldest Member</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">City of Residence</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">State & PIN Code</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="PIN Code"
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Cover Limit & Add-ons Selection */}
          {step === 2 && (
            <div className="space-y-5">
              <h4 className="font-extrabold text-white text-base">
                Step 2: Choose Sum Insured & Optional Riders
              </h4>

              {/* Sum Insured Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase">Select Sum Insured (Base Coverage)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {policy.sumInsuredOptions.map((option) => {
                    const isSelected = selectedSumInsured === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setSelectedSumInsured(option)}
                        className={`p-3 rounded-2xl border font-bold text-center transition ${
                          isSelected
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="block text-lg font-black font-mono">
                          ₹{(option / 100000).toFixed(0)} Lakhs
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">Sum Insured</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available Add-ons / Riders */}
              {policy.addonsAvailable.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-400 uppercase">Recommended Add-on Riders</label>
                  <div className="space-y-2">
                    {policy.addonsAvailable.map((addon) => {
                      const isChecked = selectedAddonIds.includes(addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                            isChecked
                              ? 'bg-indigo-950/60 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 ${
                                isChecked ? 'bg-indigo-500 border-indigo-400 text-slate-950' : 'border-slate-700'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <div>
                              <h5 className="font-bold text-white text-xs">{addon.title}</h5>
                              <p className="text-[11px] text-slate-400">{addon.description}</p>
                            </div>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-400 font-mono shrink-0">
                            +₹{addon.price}/yr
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Nominee & KYC */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-white text-base">
                Step 3: Nominee Assignment & IRDAI KYC
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nominee Full Name</label>
                  <input
                    type="text"
                    value={nomineeName}
                    onChange={(e) => setNomineeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Relationship with Insured</label>
                  <select
                    value={nomineeRelation}
                    onChange={(e) => setNomineeRelation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-medium focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">PAN Card Number (for IRDAI Tax Exemption Sec 80D)</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono uppercase focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Section 80D Income Tax Tax Benefit Verified</span>
                </div>
                <p className="text-slate-400">
                  This health insurance premium payment qualifies for tax deduction up to ₹25,000 under Section 80D of the Income Tax Act, 1961. Tax certificate will be emailed instantly upon payment.
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Premium Summary & Payment Method */}
          {step === 4 && (
            <div className="space-y-5">
              <h4 className="font-extrabold text-white text-base">
                Step 4: Premium Breakdown & Payment Gateway
              </h4>

              {/* Itemized Premium Invoice */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Premium ({policy.planName}):</span>
                  <span className="font-mono font-bold">₹{basePremiumCalculated.toLocaleString('en-IN')}</span>
                </div>
                {selectedAddonsObj.map((a) => (
                  <div key={a.id} className="flex justify-between text-slate-400 text-[11px]">
                    <span>+ Rider: {a.title}</span>
                    <span className="font-mono">₹{a.price}</span>
                  </div>
                ))}
                <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                  <span>GST Rate (18% Statutory Goods & Services Tax):</span>
                  <span className="font-mono font-bold text-amber-300">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-white font-black text-base border-t border-slate-800 pt-2">
                  <span>Total Amount Payable:</span>
                  <span className="font-mono text-emerald-400">₹{totalAmountToPay.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase">Select Indian Payment Option</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">UPI Instant</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'NET_BANKING'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <Building className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs">NetBanking</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border font-bold flex flex-col items-center justify-center space-y-1 transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Debit / Credit</span>
                  </button>
                </div>
              </div>

              {/* UPI Sub-option */}
              {paymentMethod === 'UPI' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-300">Choose UPI App for Auto-Approval:</p>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setUpiApp('PHONEPE')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border ${upiApp === 'PHONEPE' ? 'bg-indigo-900 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      PhonePe UPI
                    </button>
                    <button
                      onClick={() => setUpiApp('GPAY')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border ${upiApp === 'GPAY' ? 'bg-indigo-900 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      Google Pay
                    </button>
                    <button
                      onClick={() => setUpiApp('PAYTM')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border ${upiApp === 'PAYTM' ? 'bg-indigo-900 border-indigo-500 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      Paytm UPI
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Success & Policy Issuance Confirmation */}
          {step === 5 && issuedPolicy && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-950 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Policy Issued Successfully!</h3>
                <p className="text-emerald-400 text-xs font-mono font-bold mt-1">
                  Policy Number: {issuedPolicy.policyNumber}
                </p>
              </div>

              {/* Cashless Digital Card Preview */}
              <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border border-indigo-700/80 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                  <div>
                    <span className="font-black text-white text-base tracking-tight">{issuedPolicy.insurerName}</span>
                    <p className="text-[10px] text-slate-400">IRDAI Cashless Health Card</p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Policyholder</span>
                    <span className="font-bold text-white">{issuedPolicy.proposerName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Sum Insured</span>
                    <span className="font-bold text-emerald-400 font-mono">₹{(issuedPolicy.sumInsured / 100000).toFixed(0)} Lakhs</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Cashless Card ID</span>
                    <span className="font-bold text-cyan-300 font-mono">{issuedPolicy.cashlessCardNumber}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-bold">Validity</span>
                    <span className="font-semibold text-slate-300">{issuedPolicy.policyStartDate} to {issuedPolicy.policyEndDate}</span>
                  </div>
                </div>
              </div>

              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Your official IRDAI policy document and tax certificate under Section 80D have been sent to <strong>{issuedPolicy.email}</strong> and SMS sent to <strong>{issuedPolicy.mobile}</strong>.
              </p>

              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-extrabold text-sm hover:bg-emerald-400"
                >
                  Go to My Active Policies
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {step < 5 && (
          <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => step > 1 && setStep((prev) => (prev - 1) as any)}
              disabled={step === 1}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                step === 1 ? 'opacity-30 border-slate-800 text-slate-500' : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((prev) => (prev + 1) as any)}
                className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleProcessPayment}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center space-x-2 shadow-lg disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{isSubmitting ? 'Issuing Policy...' : `Pay ₹${totalAmountToPay.toLocaleString('en-IN')} & Issue Policy`}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
