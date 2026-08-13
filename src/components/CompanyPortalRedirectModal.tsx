import React, { useState, useEffect } from 'react';
import { IndianPolicy } from '../types';
import { getCompanyPortalInfo } from '../utils/companyPortals';
import {
  ExternalLink,
  ShieldCheck,
  Building2,
  X,
  Phone,
  Globe,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  Zap,
} from 'lucide-react';

interface CompanyPortalRedirectModalProps {
  policy: IndianPolicy | null;
  onClose: () => void;
  onContinueInAppBuy?: (policy: IndianPolicy) => void;
}

export const CompanyPortalRedirectModal: React.FC<CompanyPortalRedirectModalProps> = ({
  policy,
  onClose,
  onContinueInAppBuy,
}) => {
  if (!policy) return null;

  const portalInfo = getCompanyPortalInfo(policy.insurerName);
  const [countdown, setCountdown] = useState<number>(3);
  const [autoRedirectPaused, setAutoRedirectPaused] = useState<boolean>(false);
  const [hasRedirected, setHasRedirected] = useState<boolean>(false);

  // Handle countdown & auto-redirect
  useEffect(() => {
    if (autoRedirectPaused || hasRedirected) return;

    if (countdown <= 0) {
      handleProceedToPortal();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, autoRedirectPaused, hasRedirected]);

  const handleProceedToPortal = () => {
    setHasRedirected(true);
    // Open company portal in a new browser tab/window
    window.open(portalInfo.portalUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src={policy.insurerLogo}
              alt={policy.insurerName}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-700 bg-slate-950 p-1 shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/60 text-emerald-300 text-[10px] font-mono font-bold">
                  OFFICIAL PORTAL ROUTING
                </span>
                <span className="text-xs text-slate-400 font-mono">UIN: {policy.uin}</span>
              </div>
              <h2 className="text-lg font-extrabold text-white mt-0.5 leading-tight">
                {policy.insurerName}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Selected Plan Summary Banner */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Selected Insurance Plan
              </span>
              <p className="text-base font-extrabold text-white">{policy.planName}</p>
              <p className="text-xs text-emerald-400 font-mono mt-0.5 font-bold">
                CSR {policy.claimSettlementRatio}% • {policy.networkCount.toLocaleString('en-IN')}+ Cashless Networks
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Base Premium
              </span>
              <p className="text-lg font-black text-amber-300 font-mono">
                ₹{policy.baseAnnualPremium.toLocaleString('en-IN')}<span className="text-xs text-slate-400">/yr</span>
              </p>
            </div>
          </div>

          {/* Redirection Countdown Box */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-950 border border-indigo-800/80 rounded-2xl p-5 text-center space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-center space-x-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
              <Globe className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Routing to Respective Insurer Portal</span>
            </div>

            {!hasRedirected ? (
              <div className="space-y-2">
                <div className="text-3xl font-black text-white font-mono flex items-center justify-center space-x-2">
                  <span>Redirecting in</span>
                  <span className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-extrabold shadow-lg">
                    {countdown}
                  </span>
                  <span>sec</span>
                </div>

                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  You are being redirected to{' '}
                  <span className="text-emerald-400 font-bold underline font-mono">
                    {portalInfo.portalUrl}
                  </span>{' '}
                  to complete your official policy application.
                </p>

                <div className="pt-2 flex items-center justify-center space-x-3">
                  <button
                    onClick={() => setAutoRedirectPaused(!autoRedirectPaused)}
                    className="text-xs text-indigo-300 hover:text-white underline font-medium flex items-center space-x-1"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>{autoRedirectPaused ? 'Resume Auto-Redirect' : 'Pause Auto-Redirect'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-emerald-300 font-bold py-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p>Company portal opened in a new browser window!</p>
                <p className="text-xs text-slate-400 font-normal">
                  If the tab was blocked by your browser popup blocker, click the button below.
                </p>
              </div>
            )}
          </div>

          {/* Security & Official Verification Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-2 text-slate-300">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold block text-white text-[11px]">256-Bit SSL Secured</span>
                <span className="text-slate-400 text-[10px]">Direct Encryption</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center space-x-2 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold block text-white text-[11px]">IRDAI Registered</span>
                <span className="text-slate-400 text-[10px]">Official Insurer Domain</span>
              </div>
            </div>
          </div>

          {/* Customer Helpline Note */}
          <div className="text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Insurer Customer Care:</span>
              <span className="text-slate-200 font-mono font-bold">{portalInfo.supportPhone}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={handleProceedToPortal}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center space-x-2 transition active:scale-98"
            >
              <span>Launch {policy.insurerName} Portal</span>
              <ExternalLink className="w-4 h-4 text-slate-950" />
            </button>

            {onContinueInAppBuy && (
              <button
                onClick={() => {
                  onClose();
                  onContinueInAppBuy(policy);
                }}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center justify-center space-x-1.5 transition"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant In-App Buy</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
