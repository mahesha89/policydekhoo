import React, { useState } from 'react';
import type { User } from '../types';
import {
  Sparkles,
  X,
  Check,
  ShieldCheck,
  Zap,
  IndianRupee,
  Lock,
  QrCode,
  Smartphone,
  CreditCard,
  Building,
  ArrowRight,
  Loader2,
  Crown,
  FileCheck,
  Brain,
  Award
} from 'lucide-react';

interface AIProSubscriptionModalProps {
  user: User | null;
  onClose: () => void;
  onSuccess: (updatedUser: User) => void;
  onOpenAuthModal?: (mode?: 'login' | 'register', reason?: string) => void;
}

export const AIProSubscriptionModal: React.FC<AIProSubscriptionModalProps> = ({
  user,
  onClose,
  onSuccess,
  onOpenAuthModal,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiApp, setUpiApp] = useState<string>('GPay');
  const [upiIdInput, setUpiIdInput] = useState<string>(user?.email ? `${user.email.split('@')[0]}@okaxis` : 'user@upi');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activationSuccess, setActivationSuccess] = useState<any>(null);

  const handleSubscribe = async () => {
    if (!user) {
      if (onOpenAuthModal) {
        onOpenAuthModal('login', 'Please sign in to activate PolicyDekho AI Pro at ₹199/month');
      }
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/subscribe-ai-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          paymentMethod,
          paymentRef: paymentMethod === 'UPI' ? upiIdInput : `CARD-${Math.floor(1000 + Math.random() * 9000)}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setActivationSuccess(data.receipt);
        onSuccess(data.user);
      } else {
        setErrorMsg(data.message || 'Payment processing failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg('Network error while processing subscription. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl my-8 relative">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 border-b border-slate-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 text-slate-950 font-black">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                AI CSR Data & Intelligence Pass
              </span>
              <h2 className="text-xl font-extrabold mt-0.5 text-white">PolicyDekho AI Pro</h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-md mt-1">
            Unlock real-time IRDAI Claim Settlement Ratio (CSR) data, live Gemini 3.6 Flash policy matching, and forensic hospital bill audits.
          </p>

          {/* Pricing Highlight Box */}
          <div className="mt-4 bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Special Monthly Plan</p>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-emerald-400 font-mono">₹199</span>
                <span className="text-xs text-slate-300 font-medium">/ month</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Check className="w-3 h-3 mr-1" /> All Taxes Included
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Cancel anytime in 1-click</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-300">
          {activationSuccess ? (
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">AI Pro Pass Activated!</h3>
                <p className="text-slate-300 text-xs mt-1">
                  Receipt #{activationSuccess.receiptNumber} • Valid until {new Date(activationSuccess.expiresAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl text-left font-mono space-y-1 text-[11px] border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan:</span>
                  <span className="text-emerald-400 font-bold">PolicyDekho AI Pro (₹199/mo)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="text-white font-bold">₹199.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Ref:</span>
                  <span className="text-slate-300">{activationSuccess.paymentRef}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition"
              >
                Access AI CSR Data & Features Now
              </button>
            </div>
          ) : (
            <>
              {/* Features Included List */}
              <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  What's included in PolicyDekho AI Pro Pass (₹199/mo):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Real-Time AI CSR Data</p>
                      <p className="text-[10px] text-slate-400">IRDAI claim settlement trends & dispute metrics</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Gemini 3.6 Flash Advisor</p>
                      <p className="text-[10px] text-slate-400">Personalized AI policy matching in under 2 secs</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Brain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Actuarial Risk Engine</p>
                      <p className="text-[10px] text-slate-400">Exact age loading & Sec 80D tax savings calculation</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <FileCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">AI Hospital Bill Auditor</p>
                      <p className="text-[10px] text-slate-400">Scan hospital bills to catch overcharging & caps</p>
                    </div>
                  </div>
                </div>
              </div>

              {!user && (
                <div className="bg-amber-950/60 border border-amber-600/60 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Please sign in first to subscribe to AI Pro on your user account.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal('login', 'Sign in to subscribe to PolicyDekho AI Pro')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="font-extrabold text-slate-300 uppercase tracking-wider text-[10px]">
                  Select Payment Method (₹199 Instant Charge)
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'UPI'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px]">Instant UPI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'CARD'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span className="text-[11px]">Card / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NETBANKING')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'NETBANKING'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Building className="w-4 h-4 text-indigo-400" />
                    <span className="text-[11px]">NetBanking</span>
                  </button>
                </div>

                {/* Method specifics */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-300">Choose UPI App:</span>
                      <div className="flex space-x-1.5">
                        {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setUpiApp(app)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                              upiApp === app
                                ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            {app}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-medium">Virtual Payment Address (VPA / UPI ID)</label>
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="yourname@okicici or 9876543210@paytm"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2">
                    <input
                      type="text"
                      placeholder="Card Number (4532 •••• •••• 8821)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="MM / YY"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <input
                        type="password"
                        placeholder="CVV"
                        className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850">
                    <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                      <option value="HDFC">HDFC Bank NetBanking</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="KOTAK">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-200 rounded-xl text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Subscribe CTA Button */}
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing ₹199 Payment...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                    <span>Pay ₹199 & Activate PolicyDekho AI Pro Pass</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
