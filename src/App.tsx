import React, { useState, useEffect } from 'react';
import { IndianPolicy, BoughtPolicy, InsuranceCategory } from './types';
import type { User } from './types';
import { INDIAN_POLICIES, INITIAL_BOUGHT_POLICIES, INDIAN_HOSPITAL_NETWORK } from './data/mockData';
import { Navbar, MainTabType } from './components/Navbar';
import { PolicyCatalog } from './components/PolicyCatalog';
import { PolicyComparisonView } from './components/PolicyComparisonView';
import { ClaimSettlementPortal } from './components/ClaimSettlementPortal';
import { CashlessHospitalsView } from './components/CashlessHospitalsView';
import { MyPoliciesView } from './components/MyPoliciesView';
import { PremiumEstimator } from './components/PremiumEstimator';
import { SecurityAuditVault } from './components/SecurityAuditVault';
import { OmniClaimSimulator } from './components/OmniClaimSimulator';
import { BuyPolicyModal } from './components/BuyPolicyModal';
import { AIPolicyAdvisorModal } from './components/AIPolicyAdvisorModal';
import { COIGeneratorModal } from './components/COIGeneratorModal';
import { CompanyPortalRedirectModal } from './components/CompanyPortalRedirectModal';
import { AuthModal } from './components/AuthModal';
import { AIProSubscriptionModal } from './components/AIProSubscriptionModal';
import { ShieldCheck, IndianRupee } from 'lucide-react';
import { auth, getUserData, onAuthStateChange, logoutUser } from './firebase';

export default function App() {
  const [policies] = useState<IndianPolicy[]>(INDIAN_POLICIES);
  const [boughtPolicies, setBoughtPolicies] = useState<BoughtPolicy[]>(INITIAL_BOUGHT_POLICIES);
  const [hospitals] = useState(INDIAN_HOSPITAL_NETWORK);

  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authRedirectReason, setAuthRedirectReason] = useState<string | undefined>(undefined);

  // Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          const userData = await getUserData(firebaseUser.uid);
          
          setUser({
            id: firebaseUser.uid,
            name: userData?.name || firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            mobile: userData?.mobile || '',
            city: userData?.city || '',
            token: token,
            isPro: userData?.isPro || false,
            policies: userData?.policies || [],
          });
          
          localStorage.setItem('policydekho_auth_token', token);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('policydekho_auth_token');
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user policies whenever user state changes
  useEffect(() => {
    if (user && user.id) {
      // In Firebase, policies are stored in Firestore
      // We're already loading them in the auth state change
      // But we can also fetch them separately if needed
    } else if (!user) {
      setBoughtPolicies(INITIAL_BOUGHT_POLICIES);
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'register' = 'login', reason?: string) => {
    setAuthModalMode(mode);
    setAuthRedirectReason(reason);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    if (loggedInUser.token) {
      localStorage.setItem('policydekho_auth_token', loggedInUser.token);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      localStorage.removeItem('policydekho_auth_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation state
  const [activeTab, setActiveTab] = useState<MainTabType>('estimator');
  const [selectedCategory, setSelectedCategory] = useState<InsuranceCategory>('HEALTH');

  // Policy Comparison State (selected policy IDs)
  const [comparedPolicyIds, setComparedPolicyIds] = useState<string[]>(['ind-star-optima', 'ind-hdfc-secure']);

  // Modals
  const [portalRoutingPolicy, setPortalRoutingPolicy] = useState<IndianPolicy | null>(null);
  const [buyingPolicy, setBuyingPolicy] = useState<IndianPolicy | null>(null);
  const [isAIAdvisorOpen, setIsAIAdvisorOpen] = useState(false);
  const [isCOIModalOpen, setIsCOIModalOpen] = useState(false);
  const [isAIProModalOpen, setIsAIProModalOpen] = useState(false);

  // Toggle Policy in Comparison Drawer
  const toggleComparePolicy = (id: string) => {
    setComparedPolicyIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare up to 3 policies at a time.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Add a newly bought policy to state
  const handleSuccessBuyPolicy = (newPolicy: BoughtPolicy) => {
    setBoughtPolicies((prev) => [newPolicy, ...prev]);
  };

  const comparedPolicies = policies.filter((p) => comparedPolicyIds.includes(p.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white flex flex-col">
      {/* Navigation Topbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        comparedCount={comparedPolicyIds.length}
        boughtCount={boughtPolicies.length}
        openAIAdvisor={() => setIsAIAdvisorOpen(true)}
        openCOIModal={() => setIsCOIModalOpen(true)}
        openAIProModal={() => setIsAIProModalOpen(true)}
        user={user}
        onOpenAuthModal={openAuthModal}
        onLogout={handleLogout}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* TAB: Omni-Claim Hospitalization Simulator */}
        {activeTab === 'omni-simulator' && (
          <OmniClaimSimulator
            onBuyPolicy={(policy) => setPortalRoutingPolicy(policy)}
            openAIAdvisor={() => setIsAIAdvisorOpen(true)}
            onOpenAIProModal={() => setIsAIProModalOpen(true)}
            user={user}
            onOpenAuthModal={openAuthModal}
          />
        )}

        {/* TAB 0: Premium Estimator Tool */}
        {activeTab === 'estimator' && (
          <PremiumEstimator
            policies={policies}
            onApplyEstimateToCatalog={(filters) => {
              if (filters.category) setSelectedCategory(filters.category);
              setActiveTab('catalog');
            }}
            onBuyPolicy={(policy) => setPortalRoutingPolicy(policy)}
            openAIAdvisorWithDetails={() => setIsAIAdvisorOpen(true)}
            onOpenAIProModal={() => setIsAIProModalOpen(true)}
            user={user}
            onOpenAuthModal={openAuthModal}
          />
        )}

        {/* TAB 1: Insurance Catalog & Filters */}
        {activeTab === 'catalog' && (
          <PolicyCatalog
            policies={policies}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            comparedPolicyIds={comparedPolicyIds}
            toggleComparePolicy={toggleComparePolicy}
            onBuyPolicy={(policy) => setPortalRoutingPolicy(policy)}
            openAIAdvisor={() => setIsAIAdvisorOpen(true)}
            onOpenEstimator={() => setActiveTab('estimator')}
            onOpenAIProModal={() => setIsAIProModalOpen(true)}
            user={user}
            onOpenAuthModal={openAuthModal}
          />
        )}

        {/* TAB 2: Side-by-Side Comparison Matrix */}
        {activeTab === 'compare' && (
          <PolicyComparisonView
            comparedPolicies={comparedPolicies}
            onRemoveFromCompare={(id) => toggleComparePolicy(id)}
            onBuyPolicy={(policy) => setPortalRoutingPolicy(policy)}
            onBackToCatalog={() => setActiveTab('catalog')}
            openAIAdvisor={() => setIsAIAdvisorOpen(true)}
          />
        )}

        {/* TAB 3: IRDAI Claim Settlement Ratio (CSR) Leaderboard */}
        {activeTab === 'claim-settlement' && (
          <ClaimSettlementPortal
            policies={policies}
            onOpenCashlessAssistance={() => setActiveTab('hospitals')}
          />
        )}

        {/* TAB 4: Cashless Hospitals & Garages Locator */}
        {activeTab === 'hospitals' && (
          <CashlessHospitalsView
            hospitals={hospitals}
            onSelectHospitalForClaim={(hosp) => {
              alert(`Pre-Authorization helpdesk request sent to ${hosp.name}. Executive helpline: ${hosp.phone}`);
            }}
          />
        )}

        {/* TAB 5: Security, Cryptography & AI Fraud Vault */}
        {activeTab === 'security-vault' && (
          <SecurityAuditVault user={user} onOpenAuthModal={openAuthModal} />
        )}

        {/* TAB 6: My Active Policies Dashboard */}
        {activeTab === 'my-policies' && (
          <MyPoliciesView
            boughtPolicies={boughtPolicies}
            onFileClaim={(policy) => {
              setActiveTab('hospitals');
            }}
            openCOIModal={() => setIsCOIModalOpen(true)}
            onBrowseCatalog={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-slate-400 text-xs text-center font-sans">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-300">
            All Rights Reserved PolicyDekho
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        redirectReason={authRedirectReason}
      />

      {/* Company Portal Routing Modal */}
      {portalRoutingPolicy && (
        <CompanyPortalRedirectModal
          policy={portalRoutingPolicy}
          onClose={() => setPortalRoutingPolicy(null)}
          onContinueInAppBuy={(p) => {
            setPortalRoutingPolicy(null);
            setBuyingPolicy(p);
          }}
        />
      )}

      {/* Buy Policy Modal Checkout */}
      {buyingPolicy && (
        <BuyPolicyModal
          policy={buyingPolicy}
          onClose={() => setBuyingPolicy(null)}
          onSuccess={handleSuccessBuyPolicy}
          user={user}
        />
      )}

      {/* AI Policy Advisor Modal */}
      {isAIAdvisorOpen && (
        <AIPolicyAdvisorModal
          onClose={() => setIsAIAdvisorOpen(false)}
          policies={policies}
          onSelectRecommendedPolicy={(p) => setPortalRoutingPolicy(p)}
          user={user}
          onOpenAuthModal={openAuthModal}
          onOpenAIProModal={() => setIsAIProModalOpen(true)}
        />
      )}

      {/* PolicyDekho AI Pro Subscription Modal (₹199/month) */}
      {isAIProModalOpen && (
        <AIProSubscriptionModal
          user={user}
          onClose={() => setIsAIProModalOpen(false)}
          onSuccess={(updatedUser) => {
            setUser(updatedUser);
          }}
          onOpenAuthModal={openAuthModal}
        />
      )}

      {/* COI Certificate Modal */}
      <COIGeneratorModal
        isOpen={isCOIModalOpen}
        onClose={() => setIsCOIModalOpen(false)}
        boughtPolicies={boughtPolicies}
      />
    </div>
  );
}