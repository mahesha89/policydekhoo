export type PolicyType =
  | 'CYBER_SECURITY'
  | 'COMMERCIAL_PROPERTY'
  | 'DIRECTORS_OFFICERS'
  | 'SUPPLY_CHAIN'
  | 'LUXURY_ASSET'
  | 'ENVIRONMENTAL_HAZARD'
  | 'EXECUTIVE_UMBRELLA';

export type InsuranceCategory =
  | 'HEALTH'
  | 'TERM_LIFE'
  | 'CAR_MOTOR'
  | 'BIKE_MOTOR'
  | 'SUPER_TOPUP';

export type PolicyStatus = 'ACTIVE' | 'PENDING_RENEWAL' | 'UNDER_REVIEW' | 'SUSPENDED';

export interface Endorsement {
  id: string;
  title: string;
  limit: string;
  effectiveDate: string;
  additionalPremium: number;
}

export interface PolicyItem {
  id: string;
  policyNumber: string;
  holderName: string;
  companyName: string;
  type: PolicyType;
  title: string;
  coverageLimit: number;
  deductible: number;
  annualPremium: number;
  monthlyPremium: number;
  effectiveDate: string;
  expirationDate: string;
  status: PolicyStatus;
  riskScore: number;
  complianceLevel: string;
  insuredAssetsCount: number;
  coiCount: number;
  endorsements: Endorsement[];
  keyPerilsCovered: string[];
}

export interface AddonOption {
  id: string;
  title: string;
  price: number;
  description: string;
}

export interface IndianPolicy {
  id: string;
  uin: string; // IRDAI Unique Identification Number
  insurerName: string;
  insurerLogo: string;
  planName: string;
  category: InsuranceCategory;
  claimSettlementRatio: number; // CSR e.g. 99.2%
  incurredClaimRatio: number; // ICR e.g. 84.5%
  networkCount: number; // Cashless hospitals or garages in India
  solvencyRatio: number; // e.g. 1.85
  sumInsuredOptions: number[]; // e.g. [500000, 1000000, 2500000, 5000000, 10000000]
  baseAnnualPremium: number; // in INR ₹
  baseMonthlyPremium: number; // in INR ₹
  gstRate: number; // 18%
  roomRentCap: string; // e.g. "No Room Rent Capping (Private AC Room)"
  prePostHospitalization: string; // e.g. "60 Days Pre / 180 Days Post"
  noClaimBonus: string; // e.g. "50% Bonus per claim-free year up to 100%"
  restoreBenefit: string; // e.g. "100% Unlimited Automatic Restoration"
  waitingPeriodPreExisting: string; // e.g. "2 Years"
  copay: string; // e.g. "0% Co-pay across India"
  keyHighlights: string[];
  addonsAvailable: AddonOption[];
  badge?: string;
  starRating: number; // e.g. 4.8
  userReviewsCount: number;
}

export interface HealthInsuranceCompany {
  id: string;
  name: string;
  shortName: string;
  type: 'STANDALONE_HEALTH' | 'GENERAL_PRIVATE' | 'GENERAL_PUBLIC';
  irdaiRegNo: string;
  logoUrl: string;
  claimSettlementRatio: number;
  incurredClaimRatio: number;
  cashlessHospitalsCount: number;
  solvencyRatio: number;
  headquarters: string;
  customerCare: string;
  website: string;
  flagshipPlans: string[];
  keyHighlights: string[];
  irdaBadge: string;
}

export interface BoughtPolicy {
  id: string;
  policyNumber: string; // e.g. POL-IND-2026-9941
  uin: string;
  insurerName: string;
  planName: string;
  category: InsuranceCategory;
  proposerName: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  pinCode: string;
  sumInsured: number;
  basePremium: number;
  gstAmount: number;
  totalPremiumPaid: number;
  purchaseDate: string;
  policyStartDate: string;
  policyEndDate: string;
  nomineeName: string;
  nomineeRelation: string;
  cashlessCardNumber: string;
  status: 'ACTIVE' | 'CLAIM_PENDING' | 'EXPIRED';
  addonsSelected: string[];
}

export type ClaimStatus =
  | 'SUBMITTED'
  | 'AI_AUDIT_PASSED'
  | 'ADJUSTER_ASSIGNED'
  | 'FORENSIC_REVIEW'
  | 'PAYOUT_APPROVED'
  | 'DISPATCHED'
  | 'PRE_AUTH_APPROVED'
  | 'SETTLED'
  | 'UNDER_QUERY';

export interface ClaimTimelineEvent {
  id: string;
  date: string;
  title: string;
  author: string;
  note: string;
  badge?: 'AI' | 'ADJUSTER' | 'FINANCE' | 'SYSTEM' | 'HOSPITAL';
}

export interface EvidenceFile {
  id: string;
  name: string;
  size: string;
  type: string;
  category: 'PHOTO' | 'SECURITY_LOG' | 'POLICE_REPORT' | 'INVOICE' | 'AUDIT_DOC';
  dateUploaded: string;
}

export interface ClaimItem {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  policyTitle: string;
  claimantName: string;
  companyName: string;
  lossDate: string;
  reportedDate: string;
  status: ClaimStatus;
  lossCategory: string;
  claimedAmount: number;
  approvedPayout: number;
  deductibleApplied: number;
  fraudScore: number;
  fraudRiskLevel: 'LOW_RISK_CLEAR' | 'MODERATE_AUDIT' | 'HIGH_RISK_FLAG';
  coverageMatchPercentage: number;
  evidenceFiles: EvidenceFile[];
  timeline: ClaimTimelineEvent[];
  adjusterContact?: {
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  aiSummary: string;
  hospitalName?: string;
  city?: string;
}

export interface QuoteRequest {
  companyName: string;
  industry: string;
  annualRevenue: number;
  employeeCount: number;
  existingSecurityStack: string;
  cloudProvider: string;
  physicalAssetValue: number;
  lossHistoryYears: number;
  desiredCoverageLimit: number;
  desiredDeductible: number;
}

export interface DiscountItem {
  title: string;
  discountPercent: number;
  status: 'APPLIED' | 'ELIGIBLE';
}

export interface UnderwritingAudit {
  overallRiskScore: number;
  tierClassification: 'TIER_1_PREFERRED' | 'TIER_2_STANDARD' | 'HIGH_HAZARD_SURPLUS';
  baseAnnualPremium: number;
  recommendedDeductible: number;
  discountTriggers: DiscountItem[];
  criticalVulnerabilities: string[];
  recommendedEndorsements: string[];
  actuarialVerdict: string;
}

export interface CertificateOfInsurance {
  certId: string;
  certificateNumber: string;
  issueDate: string;
  expirationDate: string;
  producerName: string;
  producerAddress: string;
  insuredName: string;
  insuredAddress: string;
  certificateHolderName: string;
  certificateHolderAddress: string;
  policyCoverages: {
    line: string;
    policyNumber: string;
    effectiveDate: string;
    expirationDate: string;
    eachOccurrenceLimit: string;
    aggregateLimit: string;
    deductible: string;
  }[];
  specialProvisions: string;
}

export interface ThreatAlert {
  id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  sector: string;
  region: string;
  mitigationSteps: string;
  date: string;
  affectedPoliciesCount: number;
}

export interface HospitalNetworkItem {
  id: string;
  name: string;
  city: string;
  state: string;
  pinCode: string;
  address: string;
  phone: string;
  specialties: string[];
  insurersAccepted: string[];
  cashlessDeskContact: string;
  googleRating: number;
}

export interface User {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  mobile?: string;
  city?: string;
  token: string;
  isPro: boolean;
  policies: any[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

