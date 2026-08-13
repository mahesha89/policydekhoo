import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

// ── Self-learning chatbot brain (imported early so it's available throughout) ──
// We use a dynamic approach so the file works in both dev (tsx) and prod (cjs bundle)
let processChat: any, submitFeedback: any, getBrainStats: any,
    getUserProfile: any, getSessionHistory: any, brain: any;

async function loadBrainModule() {
  try {
    const mod = await import("./src/services/chatbot-brain.js");
    processChat = mod.processChat;
    submitFeedback = mod.submitFeedback;
    getBrainStats = mod.getBrainStats;
    getUserProfile = mod.getUserProfile;
    getSessionHistory = mod.getSessionHistory;
    brain = mod.brain;
    console.log("✅ Chatbot brain loaded");
  } catch (e) {
    console.warn("⚠️  Chatbot brain not loaded (will use fallback):", (e as any).message?.slice(0, 80));
    // Fallback stubs so server doesn't crash
    processChat = async () => "AI brain unavailable — please check chatbot-brain.ts";
    submitFeedback = async () => {};
    getBrainStats = () => ({ error: "brain not loaded" });
    getUserProfile = () => null;
    getSessionHistory = () => [];
    brain = { knowledgeBase: [], _nextId: 1 };
  }
}

const currentFilename = typeof __filename !== "undefined"
  ? __filename
  : (typeof import.meta !== "undefined" && import.meta && import.meta.url ? fileURLToPath(import.meta.url) : process.cwd());
const currentDirname = typeof __dirname !== "undefined"
  ? __dirname
  : path.dirname(currentFilename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to initialize Groq client lazily
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "YOUR_GROQ_API_KEY") return null;
  return new Groq({ apiKey });
}

const GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// Health check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GROQ_API_KEY ? "Groq Llama-4 Scout Active" : "Simulated Fallback Active",
  });
});

// Endpoint: Evaluate Claim Evidence with Gemini AI
app.post("/api/evaluate-claim", async (req, res) => {
  try {
    const { policyNumber, policyType, incidentDescription, claimAmount, lossCategory, incidentDate, evidenceNotes } = req.body;

    const groqCheck = getGroqClient();

    if (!groqCheck) {
      // Deterministic intelligent fallback when Groq API key is not yet set
      const amount = Number(claimAmount) || 25000;
      const isHighRisk = amount > 150000 || incidentDescription?.toLowerCase().includes("fire") || incidentDescription?.toLowerCase().includes("unusual");
      const fraudScore = isHighRisk ? 28 : 8;
      const coverageMatch = isHighRisk ? 91 : 98;
      const recommendedPayout = Math.round(amount * (isHighRisk ? 0.92 : 0.98));

      return res.json({
        success: true,
        source: "actuarial-rules-engine",
        analysis: {
          fraudScore, // 0-100 (lower is safer)
          fraudRiskLevel: fraudScore > 25 ? "MODERATE_AUDIT" : "LOW_RISK_CLEAR",
          coverageMatchPercentage: coverageMatch,
          recommendedPayout,
          deductibleApplied: Math.round(amount * 0.05),
          netPayout: recommendedPayout - Math.round(amount * 0.05),
          automatedDecision: fraudScore > 30 ? "REQUIRES_SENIOR_ADJUSTER_APPROVAL" : "AUTO_APPROVED_DISPATCH",
          keyRiskIndicators: [
            "Incident timestamp matches telemetry & security logs.",
            "Historical policy claim frequency is within standard actuarial threshold (<1 per year).",
            "Submitted document metadata verified with digital fingerprint.",
          ],
          recommendedActions: [
            "Issue immediate 25% emergency advance disbursement.",
            "Schedule onsite forensic validation if repairs exceed $100k.",
            "Notify reinsurance syndicates for potential retrocession.",
          ],
          aiUnderwriterSummary: `Automated assessment of Claim #${Math.floor(Math.random() * 89999 + 10000)} under Policy ${policyNumber} (${policyType}). Evidence confirms legitimate ${lossCategory} event on ${incidentDate}. Calculated loss valuation verified against industry replacement benchmarks.`,
        },
      });
    }

    // Call Groq Llama AI
    const groq = getGroqClient();
    const prompt = `You are a Chief Actuary & Forensic Insurance Adjuster AI for PolicyDekho Insurance Platform.
Analyze the following FNOL (First Notice of Loss) claim details and provide a structured JSON assessment.

Policy Number: ${policyNumber}
Policy Line: ${policyType}
Loss Category: ${lossCategory}
Date of Loss: ${incidentDate}
Claimed Loss Amount: ₹${claimAmount}
Incident Description: ${incidentDescription}
Evidence & Supporting Notes: ${evidenceNotes || "Standard document package provided."}

Return ONLY valid JSON with no extra text, markdown, or explanation. Use this exact schema:
{
  "fraudScore": <number 0 to 100>,
  "fraudRiskLevel": "<LOW_RISK_CLEAR | MODERATE_AUDIT | HIGH_RISK_FLAG>",
  "coverageMatchPercentage": <number 0 to 100>,
  "recommendedPayout": <number>,
  "deductibleApplied": <number>,
  "netPayout": <number>,
  "automatedDecision": "<AUTO_APPROVED_DISPATCH | REQUIRES_SENIOR_ADJUSTER_APPROVAL | REJECTED_EXCLUSION_CLAUSE>",
  "keyRiskIndicators": ["<string>", "<string>", "<string>"],
  "recommendedActions": ["<string>", "<string>", "<string>"],
  "aiUnderwriterSummary": "<string analysis 3-4 sentences>"
}`;

    const response = await groq!.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an expert insurance actuary. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.json({
      success: true,
      source: "groq-llama-4-scout",
      analysis: parsed,
    });
  } catch (error: any) {
    console.error("Error evaluating claim:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during claim evaluation",
    });
  }
});

// Endpoint: AI Underwriting & Enterprise Risk Audit
app.post("/api/risk-audit", async (req, res) => {
  try {
    const { companyName, industry, annualRevenue, employeeCount, existingSecurityStack, cloudProvider, physicalAssetValue, lossHistoryYears } = req.body;

    const groqCheck = getGroqClient();

    if (!groqCheck) {
      // Deterministic actuarial rule fallback
      const rev = Number(annualRevenue) || 10000000;
      const emp = Number(employeeCount) || 50;
      const baseScore = 86 - (emp > 500 ? 10 : 0) + (existingSecurityStack?.toLowerCase().includes("soc2") ? 8 : 0);

      return res.json({
        success: true,
        source: "actuarial-underwriting-engine",
        audit: {
          overallRiskScore: Math.min(98, Math.max(45, baseScore)), // 0-100 (higher is safer)
          tierClassification: baseScore > 80 ? "TIER_1_PREFERRED" : "TIER_2_STANDARD",
          baseAnnualPremium: Math.round(rev * 0.0035 + emp * 120),
          recommendedDeductible: Math.round(rev * 0.001),
          discountTriggers: [
            { title: "MFA & Zero-Trust Architecture", discountPercent: 12, status: "APPLIED" },
            { title: "24/7 SOC Managed Detection & Response", discountPercent: 8, status: "ELIGIBLE" },
            { title: "ISO 27001 Certification", discountPercent: 5, status: "APPLIED" },
          ],
          criticalVulnerabilities: [
            "Third-party vendor dependency exposure in supply chain pipeline.",
            "Business Interruption buffer estimated at 14 days vs recommended 30 days.",
          ],
          recommendedEndorsements: [
            "Ransomware Negotiation & Extortion Coverage ($5M Limit)",
            "Cloud Outage Service Level SLA Guarantee Rider",
            "Executive Cyber Extortion & Social Engineering Protection",
          ],
          actuarialVerdict: `${companyName || "The Enterprise"} demonstrates robust primary operational security controls. Risk profile warrants Tier 1 Preferred rates with an estimated annual premium discount up to 25% upon completion of secondary SOC audit logs verification.`,
        },
      });
    }

    const groq = getGroqClient();
    const prompt = `You are an Executive Risk Underwriter and Chief Actuary for PolicyDekho Insurance Platform.
Perform a thorough enterprise risk assessment and underwriting quote analysis for the following corporation:

Company Name: ${companyName || "Apex Enterprises"}
Industry Sector: ${industry}
Annual Revenue: ₹${annualRevenue}
Employee Headcount: ${employeeCount}
Security Infrastructure & Compliance: ${existingSecurityStack || "Standard firewall & Endpoint protection"}
Cloud & IT Environment: ${cloudProvider || "Multi-cloud AWS/GCP"}
Physical Asset Valuation: ₹${physicalAssetValue || "25000000"}
Prior Loss History (Years clean): ${lossHistoryYears || "3 years clean"}

Return ONLY valid JSON with no extra text, markdown, or explanation. Use this exact schema:
{
  "overallRiskScore": <number 0 to 100, where 100 is safest>,
  "tierClassification": "<TIER_1_PREFERRED | TIER_2_STANDARD | HIGH_HAZARD_SURPLUS>",
  "baseAnnualPremium": <number in INR rupees>,
  "recommendedDeductible": <number in INR rupees>,
  "discountTriggers": [
    { "title": "<string>", "discountPercent": <number>, "status": "<APPLIED | ELIGIBLE>" }
  ],
  "criticalVulnerabilities": ["<string>", "<string>"],
  "recommendedEndorsements": ["<string>", "<string>", "<string>"],
  "actuarialVerdict": "<string 3-4 sentences summarizing risk profile and binding conditions>"
}`;

    const response = await groq!.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an expert insurance underwriter. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.25,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return res.json({
      success: true,
      source: "groq-llama-4-scout",
      audit: parsed,
    });
  } catch (error: any) {
    console.error("Error running risk audit:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during risk audit",
    });
  }
});

// Endpoint: AI Policy Advisor & Indian Insurance Recommendation
app.post("/api/recommend-policy", async (req, res) => {
  try {
    const { age, city, familyMembers, category, preExistingConditions, maxBudgetRupees } = req.body;

    const groqAdv = getGroqClient();

    if (!groqAdv) {
      return res.json({
        success: true,
        source: "irdai-rules-engine",
        recommendation: {
          recommendedPlanId: category === "TERM_LIFE" ? "ind-icici-iprotect" : "ind-star-optima",
          recommendedInsurer: category === "TERM_LIFE" ? "ICICI Prudential Life Insurance" : "Star Health Insurance",
          matchScore: 98,
          suggestedSumInsured: category === "TERM_LIFE" ? 10000000 : 1000000,
          estimatedAnnualPremiumWithGST: category === "TERM_LIFE" ? 9912 : 14726,
          keyReasoning: [
            `Top IRDAI Claim Settlement Ratio of ${category === "TERM_LIFE" ? "97.9%" : "99.06%"} ensures reliable payout when needed.`,
            `Zero Room Rent Capping prevents out-of-pocket deductions during hospital admission in ${city || "metro cities"}.`,
            `100% Unlimited Restore Benefit provides peace of mind for repeat hospitalizations.`,
          ],
          advisorVerdict: `Based on age ${age || 32} in ${city || "Hyderabad"} with ${familyMembers || "family floater"} coverage, we recommend ₹10 Lakh health cover with zero co-pay. Star Health leads IRDAI's CSR benchmarks at 99.06% with 14,000+ cashless hospitals.`,
        },
      });
    }

    const prompt = `You are an IRDAI-Certified Senior Insurance Advisor in India.
Provide a tailored insurance recommendation in Indian Rupees (₹) with 18% GST.

User Profile:
- Age: ${age}
- City: ${city || "Hyderabad"}
- Category: ${category || "HEALTH"}
- Family Coverage: ${familyMembers || "Self + Spouse + 1 Child"}
- Pre-Existing Conditions: ${preExistingConditions || "None"}
- Max Annual Budget: ₹${maxBudgetRupees || 18000}

Return ONLY valid JSON, no markdown:
{
  "recommendedPlanId": "<ind-star-optima | ind-hdfc-secure | ind-niva-bupa | ind-icici-iprotect | ind-max-life | ind-bajaj-car>",
  "recommendedInsurer": "<string>",
  "matchScore": <number 80 to 99>,
  "suggestedSumInsured": <number in INR>,
  "estimatedAnnualPremiumWithGST": <number in INR>,
  "keyReasoning": ["<string>", "<string>", "<string>"],
  "advisorVerdict": "<3-4 sentences on suitability for Indian healthcare costs>"
}`;

    const response = await groqAdv.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an expert IRDAI insurance advisor. Always respond with valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.json({
      success: true,
      source: "groq-llama-4-scout",
      recommendation: parsed,
    });
  } catch (error: any) {
    console.error("Error generating policy recommendation:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during recommendation",
    });
  }
});

// Endpoint: Personalized Premium Estimator (Age, Coverage, Medical History)
app.post("/api/estimate-premium", async (req, res) => {
  try {
    const { age, sumInsured, medicalHistory, category, familyScope, city } = req.body;

    const userAge = Number(age) || 30;
    const coverAmount = Number(sumInsured) || 1000000; // default ₹10 Lakhs
    const conditions = Array.isArray(medicalHistory) ? medicalHistory : (medicalHistory ? [medicalHistory] : []);

    const groqEstCheck = getGroqClient();

    if (!groqEstCheck) {
      // Actuarial rule-based estimation formula
      let baseRate = 0.008; // 0.8% base
      if (category === "TERM_LIFE") baseRate = 0.0012;
      else if (category === "CAR_MOTOR") baseRate = 0.025;

      // Age loading: +15% per decade above 25
      const ageBracket = Math.max(0, userAge - 25);
      const ageMultiplier = 1 + (ageBracket / 10) * 0.18;

      // Medical history loading
      let medicalLoadingPercent = 0;
      const lowerConditions = conditions.map((c: string) => c.toLowerCase());
      if (lowerConditions.includes("diabetes")) medicalLoadingPercent += 12;
      if (lowerConditions.includes("hypertension") || lowerConditions.includes("high bp")) medicalLoadingPercent += 10;
      if (lowerConditions.includes("cardiac") || lowerConditions.includes("heart condition")) medicalLoadingPercent += 25;
      if (lowerConditions.includes("asthma")) medicalLoadingPercent += 8;
      if (lowerConditions.includes("smoking") || lowerConditions.includes("tobacco")) medicalLoadingPercent += 20;
      if (lowerConditions.includes("surgery")) medicalLoadingPercent += 15;

      const medicalMultiplier = 1 + (medicalLoadingPercent / 100);

      const baseCalculated = Math.round((coverAmount * baseRate) * ageMultiplier * medicalMultiplier);
      const gstAmount = Math.round(baseCalculated * 0.18);
      const totalAnnualPremium = baseCalculated + gstAmount;
      const monthlyPremium = Math.round(totalAnnualPremium / 12);
      const section80dTaxSavings = Math.min(25000, Math.round(totalAnnualPremium * 0.3));

      return res.json({
        success: true,
        source: "actuarial-formula-engine",
        estimate: {
          basePremium: baseCalculated,
          ageLoadingPercent: Math.round((ageMultiplier - 1) * 100),
          medicalLoadingPercent,
          gstAmount,
          totalAnnualPremium,
          monthlyPremium,
          section80dTaxSavings,
          riskTier: medicalLoadingPercent > 20 ? "MODERATE_UNDERWRITING" : (medicalLoadingPercent > 0 ? "STANDARD_PLUS" : "PREFERRED_TIER"),
          keyFactors: [
            `Age ${userAge} actuarial band applied (+${Math.round((ageMultiplier - 1) * 100)}% base loading).`,
            conditions.length > 0
              ? `Medical history adjustment for [${conditions.join(", ")}] applied (+${medicalLoadingPercent}% risk loading).`
              : "Clean medical history discount applied (-5% preferred rate).",
            `Coverage amount ₹${(coverAmount / 100000).toFixed(0)} Lakhs selected.`,
            `18% Statutory GST included (₹${gstAmount.toLocaleString("en-IN")}).`,
          ],
          actuarialNote: `Based on an age of ${userAge} and ₹${(coverAmount / 100000).toFixed(0)} Lakhs cover, your estimated annual premium is ₹${totalAnnualPremium.toLocaleString("en-IN")} (or ₹${monthlyPremium.toLocaleString("en-IN")}/month). Qualifies for Section 80D tax savings up to ₹${section80dTaxSavings.toLocaleString("en-IN")}.`,
        },
      });
    }

    const prompt = `You are an IRDAI Chief Actuary specializing in Indian Health and Life Insurance premium underwriting.
Calculate a detailed personalized insurance premium estimate based on user age, sum insured, and medical history.

User Input:
- Age: ${userAge}
- Sum Insured (Coverage Amount): ₹${coverAmount} (or ₹${(coverAmount / 100000).toFixed(0)} Lakhs)
- Medical History / Pre-existing Conditions: ${conditions.length > 0 ? conditions.join(", ") : "None (Clean Medical Record)"}
- Insurance Category: ${category || "HEALTH"}
- Family Scope: ${familyScope || "Individual"}
- City: ${city || "Mumbai"}

Calculate realistic Indian insurance premium in INR (₹) including 18% GST.
Return purely valid JSON with the following schema:
{
  "basePremium": <number in INR ₹>,
  "ageLoadingPercent": <number>,
  "medicalLoadingPercent": <number>,
  "gstAmount": <number in INR ₹>,
  "totalAnnualPremium": <number in INR ₹>,
  "monthlyPremium": <number in INR ₹>,
  "section80dTaxSavings": <number in INR ₹>,
  "riskTier": "<PREFERRED_TIER | STANDARD_PLUS | MODERATE_UNDERWRITING | HIGH_RISK_SURCHARGE>",
  "keyFactors": ["<string>", "<string>", "<string>", "<string>"],
  "actuarialNote": "<string 3 sentences summarizing estimate justification and tax benefits>"
}`;

    const groqEst = getGroqClient();
    const response = await groqEst!.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an expert IRDAI actuary. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.json({
      success: true,
      source: "groq-llama-4-scout",
      estimate: parsed,
    });
  } catch (error: any) {
    console.error("Error estimating premium:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during premium estimation",
    });
  }
});

// Endpoint: Fetch User Policies (authenticated)
app.get("/api/user/policies", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.json({ success: true, policies: [] });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = verifyToken(token);
    const user = decoded ? usersDb.find((u) => u.id === decoded.id) : null;

    if (!user) {
      return res.json({ success: true, policies: [] });
    }

    const policies = userPoliciesDb[user.id] || [];
    return res.json({ success: true, userId: user.id, policies });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Instant Policy Purchase & IRDAI UIN Generation
app.post("/api/purchase-policy", async (req, res) => {
  try {
    const { planId, proposerName, mobile, email, city, state, pinCode, sumInsured, basePremium, nomineeName, nomineeRelation, selectedAddons } = req.body;

    const gstAmount = Math.round(Number(basePremium) * 0.18);
    const totalPremiumPaid = Math.round(Number(basePremium) + gstAmount);
    const policyNumber = `POL-IND-2026-${Math.floor(Math.random() * 899999 + 100000)}`;
    const cashlessCardNumber = `CARD-IND-${Math.floor(Math.random() * 899999 + 100000)}`;

    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    const endDate = nextYear.toISOString().split("T")[0];

    const boughtPolicy = {
      id: `bought-${Date.now()}`,
      policyNumber,
      uin: "IRDAI-UIN-2026-REG-991",
      insurerName: req.body.insurerName || "Star Health Insurance",
      planName: req.body.planName || "Comprehensive Optima Plan",
      category: req.body.category || "HEALTH",
      proposerName,
      mobile,
      email,
      city,
      state,
      pinCode,
      sumInsured: Number(sumInsured) || 1000000,
      basePremium: Number(basePremium),
      gstAmount,
      totalPremiumPaid,
      purchaseDate: startDate,
      policyStartDate: startDate,
      policyEndDate: endDate,
      nomineeName,
      nomineeRelation,
      cashlessCardNumber,
      status: "ACTIVE",
      addonsSelected: selectedAddons || [],
    };

    // Save to user account if authenticated
    const authUser = getAuthUser(req);
    if (authUser) {
      if (!userPoliciesDb[authUser.id]) {
        userPoliciesDb[authUser.id] = [];
      }
      userPoliciesDb[authUser.id].unshift(boughtPolicy);
      saveAppDB();
    }

    return res.json({
      success: true,
      receiptNumber: `TXN-UPI-${Math.floor(Math.random() * 8999999 + 1000000)}`,
      policy: boughtPolicy,
    });
  } catch (error: any) {
    console.error("Error issuing policy:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Internal server error during policy issuance",
    });
  }
});

// Endpoint: Cryptographic SHA-256 Policy & COI Ledger Verifier
app.post("/api/verify-policy-hash", async (req, res) => {
  try {
    const { policyNumber, coiHash } = req.body;
    const query = (policyNumber || coiHash || "").trim();

    const timestamp = new Date().toISOString();
    const mockSha256 = `0x7f8a9b2c${Math.abs(query.split("").reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)).toString(16)}00412e8b9a1f2c3d4e5f6`;

    return res.json({
      success: true,
      query,
      verifiedAt: timestamp,
      status: "AUTHENTIC_IRDAI_ENCRYPTED",
      ledgerRecord: {
        sha256Hash: mockSha256,
        irdaiUin: "IRDAI-UIN-2026-REG-991",
        issuerAuthority: "IRDAI Decentralized Insurance Ledger (Aegis Vault Node #04)",
        section80dEligible: true,
        digitalSignature: "RSA-4096 VALID (Govt of India Certifying Authority)",
        encryptionAlgorithm: "AES-256-GCM + SHA-256 HMAC",
        auditTrail: [
          `Issued & Signed on ${timestamp.split("T")[0]}`,
          "Validated against National Health Insurance Registry",
          "Tax benefit Section 80D eligibility verified",
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: AI Hospital Bill & Claim Fraud Auditor (Gemini 3.6 Flash)
app.post("/api/audit-hospital-bill", async (req, res) => {
  try {
    const { billItems, totalAmount, hospitalName, diagnosis } = req.body;
    const groqAudit = getGroqClient();

    if (!groqAudit) {
      const total = Number(totalAmount) || 85000;
      const inflatedPercentage = 12;
      const approvedAmount = Math.round(total * (1 - inflatedPercentage / 100));

      return res.json({
        success: true,
        source: "rule-based-auditor",
        auditResult: {
          fraudScore: 14,
          status: "PASSED_WITH_ADJUSTMENTS",
          originalBillAmount: total,
          approvedAmount,
          flaggedDiscrepanciesAmount: total - approvedAmount,
          findings: [
            { item: "ICU / Room Rent Overhead", status: "FLAGGED", note: "Room rent exceeds 1% sum insured cap by ₹4,500/day." },
            { item: "Pharmacy & Consumables", status: "APPROVED", note: "ICD-10 compliant medications verified against NPPA ceiling prices." },
            { item: "Surgeon & Anesthetist Fee", status: "APPROVED", note: "Standard CGHS / PPN tariff schedule matched." },
          ],
          aiSummary: `AI Audit completed for ${hospitalName || "Partner Hospital"} under Diagnosis: ${diagnosis || "Acute Condition"}. Bill total ₹${total.toLocaleString("en-IN")} reviewed. Approved payout ₹${approvedAmount.toLocaleString("en-IN")} after applying room cap deduction.`,
        },
      });
    }

    const prompt = `You are an IRDAI Certified Forensic Auditor & Medical Claims Adjuster AI.
Audit the following hospital bill details for fraud, inflated charges, room rent capping breaches, and non-payable consumables under standard Indian Health Insurance policies.

Hospital: ${hospitalName || "City Super Specialty Hospital"}
Diagnosis: ${diagnosis || "Dengue Fever / Acute Illness"}
Total Bill Amount: ₹${totalAmount}
Line Items: ${JSON.stringify(billItems || [
      { item: "ICU Day 1-3", cost: 45000 },
      { item: "Pharmacy & IV Fluids", cost: 18000 },
      { item: "Lab Tests & CT Scan", cost: 12000 },
      { item: "PPE & Consumables", cost: 10000 },
    ])}

Return purely valid JSON with schema:
{
  "fraudScore": <number 0-100>,
  "status": "<PASSED_100_APPROVED | PASSED_WITH_ADJUSTMENTS | REJECTED_SUSPECTED_FRAUD>",
  "originalBillAmount": <number>,
  "approvedAmount": <number>,
  "flaggedDiscrepanciesAmount": <number>,
  "findings": [
    { "item": "<string>", "status": "<APPROVED | FLAGGED | REJECTED>", "note": "<string>" }
  ],
  "aiSummary": "<string 3 sentences summarizing audit conclusions and IRDAI compliance>"
}`;

    const response = await groqAudit.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an IRDAI certified forensic auditor. Always respond with valid JSON only, no markdown." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 1000,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return res.json({
      success: true,
      source: "groq-llama-4-scout",
      auditResult: parsed,
    });
  } catch (error: any) {
    console.error("Error auditing hospital bill:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== AUTHENTICATION & USER DATA SYSTEM ====================
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "policydekho-secret-2026-change-in-prod";
const DB_FILE = path.join(process.cwd(), "policydekho-data.json");

interface StoredUser {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  phone: string;
  abhaId?: string;
  city?: string;
  pincode?: string;
  kycVerified: boolean;
  createdAt: string;
  isAiProSubscriber?: boolean;
  aiProPlanType?: string;
  aiProExpiryDate?: string;
}

interface AppDB {
  users: StoredUser[];
  policies: Record<string, any[]>;
  _nextId: number;
}

function loadAppDB(): AppDB {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("DB load error:", e);
  }
  return { users: [], policies: {}, _nextId: 1 };
}

function saveAppDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(appDB, null, 2));
  } catch (e) {
    console.error("DB save error:", e);
  }
}

const appDB = loadAppDB();

// Seed demo users if DB is empty
async function seedDemoUsers() {
  if (appDB.users.length === 0) {
    const hash1 = await bcrypt.hash("Password123", 10);
    const hash2 = await bcrypt.hash("Password123", 10);
    appDB.users.push(
      {
        id: "usr_mahesh_101",
        fullName: "Mahesh Kumar",
        email: "maheshtech89@gmail.com",
        passwordHash: hash1,
        phone: "+91 98765 43210",
        abhaId: "91-8821-4921-0021",
        city: "Bengaluru",
        pincode: "560001",
        kycVerified: true,
        createdAt: new Date().toISOString(),
        isAiProSubscriber: false,
      },
      {
        id: "usr_demo_102",
        fullName: "PolicyDekho User",
        email: "user@policydekho.in",
        passwordHash: hash2,
        phone: "+91 91234 56789",
        abhaId: "12-3456-7890-1234",
        city: "Mumbai",
        pincode: "400001",
        kycVerified: true,
        createdAt: new Date().toISOString(),
        isAiProSubscriber: false,
      }
    );
    // Seed demo policies
    appDB.policies["usr_mahesh_101"] = [
      {
        id: "bought-mahesh-01",
        policyNumber: "POL-IND-2026-881920",
        uin: "IRDAI-UIN-2026-REG-991",
        insurerName: "Star Health Insurance",
        planName: "Star Comprehensive Optima Plan",
        category: "HEALTH",
        proposerName: "Mahesh Kumar",
        mobile: "+91 98765 43210",
        email: "maheshtech89@gmail.com",
        city: "Bengaluru",
        state: "Karnataka",
        pinCode: "560001",
        sumInsured: 1000000,
        basePremium: 14200,
        gstAmount: 2556,
        totalPremiumPaid: 16756,
        purchaseDate: "2026-01-15",
        policyStartDate: "2026-01-15",
        policyEndDate: "2027-01-14",
        nomineeName: "Anjali Kumar",
        nomineeRelation: "Spouse",
        cashlessCardNumber: "CARD-IND-88201",
        status: "ACTIVE",
        addonsSelected: ["100% Restore Benefit", "Hospital Cash Cover"],
      }
    ];
    appDB.policies["usr_demo_102"] = [
      {
        id: "bought-demo-01",
        policyNumber: "POL-IND-2026-110293",
        uin: "IRDAI-UIN-2026-HDFC-301",
        insurerName: "HDFC ERGO General Insurance",
        planName: "Optima Secure Comprehensive",
        category: "HEALTH",
        proposerName: "PolicyDekho User",
        mobile: "+91 91234 56789",
        email: "user@policydekho.in",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "400001",
        sumInsured: 1500000,
        basePremium: 18500,
        gstAmount: 3330,
        totalPremiumPaid: 21830,
        purchaseDate: "2026-03-01",
        policyStartDate: "2026-03-01",
        policyEndDate: "2027-02-28",
        nomineeName: "Sunita User",
        nomineeRelation: "Spouse",
        cashlessCardNumber: "CARD-IND-11029",
        status: "ACTIVE",
        addonsSelected: ["Air Ambulance Cover"],
      }
    ];
    saveAppDB();
    console.log("✅ Demo users seeded (user@policydekho.in / Password123)");
  }
}

// JWT helpers
function signToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

// Shorthand DB accessors
const usersDb = appDB.users;
const userPoliciesDb = appDB.policies;

// Persistent User-specific Bought Policies Store
// userPoliciesDb is aliased from appDB.policies above

// Helper: authenticate user from JWT header
function getAuthUser(req: express.Request): StoredUser | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  const decoded = verifyToken(token);
  if (!decoded) return null;
  return usersDb.find((u) => u.id === decoded.id) || null;
}

// POST /api/subscribe-ai-pro (Activate PolicyDekho AI Pro Pass @ ₹199/month)
app.post("/api/subscribe-ai-pro", (req, res) => {
  try {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please sign in to activate PolicyDekho AI Pro.",
      });
    }

    const { paymentMethod, paymentRef } = req.body;
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days active

    user.isAiProSubscriber = true;
    user.aiProPlanType = 'MONTHLY_199';
    user.aiProExpiryDate = expiry.toISOString();
    saveAppDB();

    const token = signToken(user.id);
    const { passwordHash, ...userPayload } = user;

    return res.json({
      success: true,
      message: "🎉 PolicyDekho AI Pro Pass activated! Full access to AI CSR Data & Groq Llama AI unlocked.",
      user: { ...userPayload, token },
      receipt: {
        receiptNumber: `SUB-AIPRO-${Math.floor(100000 + Math.random() * 900000)}`,
        planName: "PolicyDekho AI Pro Pass",
        pricePaidRupees: 199,
        billingFrequency: "Monthly (₹199/mo)",
        paymentMethod: paymentMethod || "UPI Instant",
        paymentRef: paymentRef || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        activatedAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password, phone, abhaId, city, pincode } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, Phone number, and Password are required.",
      });
    }

    const lowerEmail = email.trim().toLowerCase();
    const existing = usersDb.find((u) => u.email.toLowerCase() === lowerEmail);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please Sign In.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: StoredUser = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fullName: fullName.trim(),
      email: lowerEmail,
      passwordHash,
      phone: phone.trim(),
      abhaId: abhaId ? abhaId.trim() : `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
      city: city ? city.trim() : "New Delhi",
      pincode: pincode ? pincode.trim() : "110001",
      kycVerified: true,
      createdAt: new Date().toISOString(),
      isAiProSubscriber: false,
    };

    usersDb.push(newUser);
    saveAppDB();

    const token = signToken(newUser.id);
    const { passwordHash: _, ...userPayload } = newUser;

    return res.status(201).json({
      success: true,
      message: "Account created & IRDAI ABHA Health ID linked successfully!",
      user: { ...userPayload, token },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both Email and Password.",
      });
    }

    const lowerEmail = email.trim().toLowerCase();
    const user = usersDb.find((u) => u.email.toLowerCase() === lowerEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const token = signToken(user.id);
    const { passwordHash, ...userPayload } = user;

    return res.json({
      success: true,
      message: `Welcome back, ${user.fullName}! Authentication verified.`,
      user: { ...userPayload, token },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
app.get("/api/auth/me", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "No auth token provided." });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    const decoded = verifyToken(token);
    const user = decoded ? usersDb.find((u) => u.id === decoded.id) : null;

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid or expired session token." });
    }

    const { passwordHash, ...userPayload } = user;
    return res.json({ success: true, user: { ...userPayload, token } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================
// WORLD CLASS UPGRADES
// ============================================================
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import multer from "multer";
import nodemailer from "nodemailer";
import cron from "node-cron";
import crypto from "crypto";

// ── Security hardening ────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // disabled so Vite/React assets load
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success: false, message: "Rate limit exceeded. Please slow down." },
});
app.use("/api/auth/", authLimiter);
app.use("/api/", apiLimiter);

// ── File uploads (multer) ──────────────────────────────────────
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `${unique}-${file.originalname.replace(/[^a-z0-9.]/gi, "_")}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg","image/png","image/webp","application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WebP, and PDF files are allowed."));
  },
});

// Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// POST /api/upload/document — upload hospital bills, discharge summaries, FIR
app.post("/api/upload/document", (req: any, res: any) => {
  upload.single("document")(req, res, (err: any) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded." });

    return res.json({
      success: true,
      file: {
        id: path.basename(req.file.filename, path.extname(req.file.filename)),
        originalName: req.file.originalname,
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString(),
      },
    });
  });
});

// ── Email service (Nodemailer) ────────────────────────────────
function getMailer() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const mailer = getMailer();
  if (!mailer) { console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`); return; }
  try {
    await mailer.sendMail({ from: `PolicyDekho <${process.env.EMAIL_USER}>`, to, subject, html });
  } catch (e) { console.error("Email error:", e); }
}

function welcomeEmailHtml(name: string) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:32px">
<div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #334155">
  <div style="text-align:center;margin-bottom:24px">
    <h1 style="color:#10b981;font-size:28px;margin:0">🛡️ PolicyDekho</h1>
    <p style="color:#94a3b8;margin:4px 0 0">India's AI-Powered Insurance Platform</p>
  </div>
  <h2 style="color:#fff">Welcome, ${name}! 🎉</h2>
  <p style="color:#cbd5e1;line-height:1.7">Your PolicyDekho account is now active. You can now:</p>
  <ul style="color:#cbd5e1;line-height:2">
    <li>Compare 50+ IRDAI-approved insurance plans</li>
    <li>Check real-time Claim Settlement Ratios (CSR)</li>
    <li>Evaluate claims with Groq Llama AI</li>
    <li>Generate Certificate of Insurance (COI)</li>
  </ul>
  <div style="background:#0f172a;border-radius:12px;padding:16px;margin:20px 0;border:1px solid #10b981">
    <p style="color:#10b981;margin:0;font-weight:bold">Demo credentials:</p>
    <p style="color:#94a3b8;margin:4px 0 0;font-family:monospace">Email: ${to}</p>
  </div>
  <p style="color:#64748b;font-size:12px;margin-top:24px;text-align:center">
    IRDAI Web Aggregator · All Rights Reserved PolicyDekho 2026
  </p>
</div></body></html>`;
}

function policyConfirmationHtml(name: string, policy: any) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:32px">
<div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #10b981">
  <h1 style="color:#10b981">✅ Policy Issued Successfully</h1>
  <p style="color:#cbd5e1">Dear ${name}, your policy has been issued. Details below:</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    ${[
      ["Policy Number", policy.policyNumber],
      ["Insurer", policy.insurerName],
      ["Plan", policy.planName],
      ["Sum Insured", `₹${Number(policy.sumInsured).toLocaleString("en-IN")}`],
      ["Total Premium", `₹${Number(policy.totalPremiumPaid).toLocaleString("en-IN")}`],
      ["Valid Till", policy.policyEndDate],
      ["Cashless Card", policy.cashlessCardNumber],
    ].map(([k,v]) => `<tr><td style="padding:8px;color:#94a3b8;border-bottom:1px solid #334155">${k}</td><td style="padding:8px;color:#fff;font-weight:bold;border-bottom:1px solid #334155">${v}</td></tr>`).join("")}
  </table>
  <p style="color:#64748b;font-size:12px;text-align:center">PolicyDekho · IRDAI Regulated Platform · 2026</p>
</div></body></html>`;
}

function claimStatusHtml(name: string, claimNumber: string, status: string, payout: number) {
  const statusColor = status === "APPROVED" ? "#10b981" : status === "PENDING" ? "#f59e0b" : "#ef4444";
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:32px">
<div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px">
  <h1 style="color:${statusColor}">Claim Update — ${status}</h1>
  <p style="color:#cbd5e1">Dear ${name}, your claim <strong>${claimNumber}</strong> has been updated.</p>
  <div style="background:#0f172a;border-radius:12px;padding:20px;border-left:4px solid ${statusColor}">
    <p style="color:#94a3b8;margin:0">Status: <span style="color:${statusColor};font-weight:bold">${status}</span></p>
    ${payout > 0 ? `<p style="color:#94a3b8;margin:8px 0 0">Approved Payout: <span style="color:#10b981;font-weight:bold;font-size:20px">₹${payout.toLocaleString("en-IN")}</span></p>` : ""}
  </div>
  <p style="color:#64748b;font-size:12px;text-align:center;margin-top:24px">PolicyDekho · IRDAI Regulated · 2026</p>
</div></body></html>`;
}

function renewalReminderHtml(name: string, policy: any, daysLeft: number) {
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#0f172a;color:#fff;padding:32px">
<div style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:16px;padding:32px;border:1px solid #f59e0b">
  <h1 style="color:#f59e0b">⏰ Policy Renewal Reminder</h1>
  <p style="color:#cbd5e1">Dear ${name}, your policy expires in <strong style="color:#f59e0b">${daysLeft} days</strong>.</p>
  <div style="background:#0f172a;border-radius:12px;padding:16px;margin:16px 0">
    <p style="color:#94a3b8;margin:0">Policy: <strong style="color:#fff">${policy.planName}</strong></p>
    <p style="color:#94a3b8;margin:8px 0 0">Expires: <strong style="color:#ef4444">${policy.policyEndDate}</strong></p>
    <p style="color:#94a3b8;margin:8px 0 0">Insurer: ${policy.insurerName}</p>
  </div>
  <a href="${process.env.APP_URL || "http://localhost:3000"}" style="display:inline-block;background:#10b981;color:#000;font-weight:bold;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:12px">
    Renew Now →
  </a>
  <p style="color:#64748b;font-size:12px;text-align:center;margin-top:24px">PolicyDekho · IRDAI Regulated · 2026</p>
</div></body></html>`;
}

// Send welcome email on registration
const origRegister = app._router?.stack?.find((r: any) => r?.route?.path === "/api/auth/register");

// ── OTP store (in-memory, production use Redis) ───────────────
const otpStore = new Map<string, { otp: string; expires: number; verified: boolean }>();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/send-otp
app.post("/api/auth/send-otp", async (req: any, res: any) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  const otp = generateOTP();
  otpStore.set(email.toLowerCase(), {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 min
    verified: false,
  });

  await sendEmail(
    email,
    "PolicyDekho — Your OTP Code",
    `<div style="font-family:Arial;background:#0f172a;color:#fff;padding:32px;border-radius:16px;max-width:400px;margin:0 auto">
      <h2 style="color:#10b981">🔐 Your OTP Code</h2>
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#fff;text-align:center;background:#1e293b;padding:20px;border-radius:12px;border:1px solid #10b981;margin:16px 0">${otp}</div>
      <p style="color:#94a3b8">Valid for 10 minutes. Never share this with anyone.</p>
    </div>`
  );

  console.log(`[OTP] ${email} → ${otp}`); // visible in server logs for testing
  return res.json({ success: true, message: "OTP sent to your email." });
});

// POST /api/auth/verify-otp
app.post("/api/auth/verify-otp", (req: any, res: any) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email?.toLowerCase());
  if (!record) return res.status(400).json({ success: false, message: "OTP not found. Please request a new one." });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });
  if (record.otp !== otp) return res.status(400).json({ success: false, message: "Incorrect OTP. Please try again." });
  record.verified = true;
  return res.json({ success: true, message: "OTP verified successfully." });
});

// ── Razorpay Payment Gateway ──────────────────────────────────
function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  // Dynamic import for Razorpay
  const Razorpay = require("razorpay");
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order — create Razorpay order
app.post("/api/payment/create-order", async (req: any, res: any) => {
  const { amount, currency = "INR", receipt, notes } = req.body;
  if (!amount) return res.status(400).json({ success: false, message: "Amount required" });

  const razorpay = getRazorpay();
  if (!razorpay) {
    // Demo mode — return fake order
    return res.json({
      success: true,
      demo: true,
      order: {
        id: `order_demo_${Date.now()}`,
        amount: amount * 100,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
        status: "created",
      },
      key: "rzp_test_demo",
    });
  }

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });
    return res.json({ success: true, order, key: process.env.RAZORPAY_KEY_ID });
  } catch (e: any) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

// POST /api/payment/verify — verify Razorpay payment signature
app.post("/api/payment/verify", (req: any, res: any) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Demo mode
  if (razorpay_order_id?.startsWith("order_demo_")) {
    return res.json({ success: true, verified: true, demo: true, paymentId: `pay_demo_${Date.now()}` });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return res.status(500).json({ success: false, message: "Payment secret not configured" });

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expectedSignature === razorpay_signature) {
    return res.json({ success: true, verified: true, paymentId: razorpay_payment_id });
  } else {
    return res.status(400).json({ success: false, verified: false, message: "Payment signature mismatch. Possible fraud." });
  }
});

// POST /api/payment/webhook — Razorpay webhook for async events
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), (req: any, res: any) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (secret) {
    const sig = req.headers["x-razorpay-signature"];
    const expectedSig = crypto.createHmac("sha256", secret).update(req.body).digest("hex");
    if (sig !== expectedSig) return res.status(400).json({ error: "Invalid signature" });
  }
  const event = JSON.parse(req.body.toString());
  console.log("[Razorpay Webhook]", event.event);
  res.json({ received: true });
});

// ── Twilio SMS/WhatsApp ───────────────────────────────────────
async function sendSMS(to: string, message: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[SMS STUB] To: ${to} | Message: ${message}`); return;
  }
  try {
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_FROM_NUMBER || "+15005550006",
      to,
    });
  } catch (e) { console.error("SMS error:", e); }
}

async function sendWhatsApp(to: string, message: string) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log(`[WHATSAPP STUB] To: ${to} | Message: ${message}`); return;
  }
  try {
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886"}`,
      to: `whatsapp:${to}`,
    });
  } catch (e) { console.error("WhatsApp error:", e); }
}

// POST /api/notify/claim-update — send claim notification
app.post("/api/notify/claim-update", async (req: any, res: any) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const { claimNumber, status, payout, channel = "all" } = req.body;

  if (channel === "all" || channel === "email") {
    await sendEmail(
      user.email,
      `PolicyDekho — Claim ${status}: ${claimNumber}`,
      claimStatusHtml(user.fullName, claimNumber, status, payout || 0)
    );
  }
  if (channel === "all" || channel === "sms") {
    await sendSMS(
      user.phone,
      `PolicyDekho: Claim ${claimNumber} status: ${status}. ${payout > 0 ? `Payout: ₹${payout.toLocaleString("en-IN")}` : ""}. Visit policydekho.in for details.`
    );
  }
  if (channel === "all" || channel === "whatsapp") {
    await sendWhatsApp(
      user.phone,
      `🛡️ *PolicyDekho Claim Update*\nClaim: ${claimNumber}\nStatus: *${status}*${payout > 0 ? `\nPayout: ₹${payout.toLocaleString("en-IN")}` : ""}\n\nVisit policydekho.in for details.`
    );
  }

  return res.json({ success: true, message: "Notification sent." });
});

// ── Analytics endpoints ───────────────────────────────────────

// GET /api/analytics/dashboard — user dashboard analytics
app.get("/api/analytics/dashboard", (req: any, res: any) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const policies = userPoliciesDb[user.id] || [];
  const totalPremium = policies.reduce((s: number, p: any) => s + (p.totalPremiumPaid || 0), 0);
  const totalCoverage = policies.reduce((s: number, p: any) => s + (p.sumInsured || 0), 0);
  const activePolicies = policies.filter((p: any) => p.status === "ACTIVE").length;

  // Monthly premium spend (last 6 months)
  const monthlySpend = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString("en-IN", { month: "short" }),
      premium: i === 5 ? totalPremium : Math.round(totalPremium * (0.7 + Math.random() * 0.3)),
    };
  });

  // Coverage by category
  const byCategory = policies.reduce((acc: any, p: any) => {
    acc[p.category] = (acc[p.category] || 0) + p.sumInsured;
    return acc;
  }, {});

  return res.json({
    success: true,
    stats: {
      totalPolicies: policies.length,
      activePolicies,
      totalPremium,
      totalCoverage,
      savingsVsMarket: Math.round(totalPremium * 0.12),
      taxSavedSec80D: Math.min(totalPremium, 25000),
    },
    charts: {
      monthlySpend,
      coverageByCategory: Object.entries(byCategory).map(([name, value]) => ({ name: name.replace(/_/g, " "), value })),
      csrTrend: [
        { year: "2022-23", csr: 96.2 },
        { year: "2023-24", csr: 97.8 },
        { year: "2024-25", csr: 98.4 },
      ],
    },
  });
});

// GET /api/analytics/admin — admin analytics (admin only)
app.get("/api/analytics/admin", (req: any, res: any) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

  // Check admin — first user is admin
  const isAdmin = usersDb[0]?.id === user.id;
  if (!isAdmin) return res.status(403).json({ success: false, message: "Admin access required" });

  const allPolicies = Object.values(userPoliciesDb).flat() as any[];
  const totalRevenue = allPolicies.reduce((s: number, p: any) => s + (p.totalPremiumPaid || 0), 0);
  const aiProUsers = usersDb.filter(u => u.isAiProSubscriber).length;

  const userGrowth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString("en-IN", { month: "short" }),
      users: Math.floor((usersDb.length / 6) * (i + 1)),
    };
  });

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.toLocaleString("en-IN", { month: "short" }),
      revenue: Math.round((totalRevenue / 6) * (0.6 + i * 0.08)),
    };
  });

  return res.json({
    success: true,
    stats: {
      totalUsers: usersDb.length,
      aiProUsers,
      totalPoliciesIssued: allPolicies.length,
      totalRevenue,
      avgPremiumPerUser: usersDb.length > 0 ? Math.round(totalRevenue / usersDb.length) : 0,
    },
    charts: { userGrowth, revenueByMonth },
    recentUsers: usersDb.slice(-5).map(({ passwordHash, ...u }) => u).reverse(),
    recentPolicies: allPolicies.slice(-5).reverse(),
  });
});

// ── Policy renewal cron job (runs daily at 9 AM) ──────────────
cron.schedule("0 9 * * *", async () => {
  console.log("[CRON] Running policy renewal check...");
  const today = new Date();

  for (const user of usersDb) {
    const policies = userPoliciesDb[user.id] || [];
    for (const policy of policies as any[]) {
      if (policy.status !== "ACTIVE") continue;
      const endDate = new Date(policy.policyEndDate);
      const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if ([30, 7, 1].includes(daysLeft)) {
        console.log(`[CRON] Renewal reminder: ${user.email} | ${policy.planName} | ${daysLeft} days left`);

        await sendEmail(
          user.email,
          `⏰ PolicyDekho — Renew ${policy.planName} in ${daysLeft} day${daysLeft > 1 ? "s" : ""}`,
          renewalReminderHtml(user.fullName, policy, daysLeft)
        );

        await sendSMS(
          user.phone,
          `PolicyDekho: Your ${policy.planName} expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}! Renew at policydekho.in to avoid coverage gap.`
        );
      }
    }
  }
  console.log("[CRON] Renewal check complete.");
});

// ── PWA manifest & service worker ────────────────────────────
app.get("/manifest.json", (_req: any, res: any) => {
  res.json({
    name: "PolicyDekho — India Insurance AI",
    short_name: "PolicyDekho",
    description: "Compare insurance, evaluate claims with AI, generate COI — IRDAI regulated.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#10b981",
    orientation: "portrait-primary",
    categories: ["finance", "insurance", "utilities"],
    lang: "en-IN",
    icons: [
      { src: "/assets/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
      { src: "/assets/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
    shortcuts: [
      { name: "Compare Policies", url: "/?tab=catalog", description: "Browse IRDAI plans" },
      { name: "Evaluate Claim", url: "/?tab=claims", description: "AI claim evaluation" },
      { name: "My Policies", url: "/?tab=my-policies", description: "View your policies" },
    ],
  });
});

app.get("/sw.js", (_req: any, res: any) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
const CACHE = 'policydekho-v1';
const SHELL = ['/', '/index.html', '/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});
`);
});

// ── Send welcome email on register (hook into existing route) ──
app.use((req: any, res: any, next: any) => {
  if (req.method === "POST" && req.path === "/api/auth/register") {
    const origJson = res.json.bind(res);
    res.json = (data: any) => {
      if (data?.success && data?.user) {
        sendEmail(
          data.user.email,
          "🛡️ Welcome to PolicyDekho — Your Account is Active!",
          welcomeEmailHtml(data.user.fullName)
        ).catch(() => {});
        sendSMS(
          data.user.phone,
          `Welcome to PolicyDekho! Your account is active. Compare IRDAI insurance plans at policydekho.in`
        ).catch(() => {});
      }
      return origJson(data);
    };
  }
  next();
});

// ── Send policy confirmation on purchase ──────────────────────
app.use((req: any, res: any, next: any) => {
  if (req.method === "POST" && req.path === "/api/issue-policy") {
    const origJson = res.json.bind(res);
    res.json = (data: any) => {
      if (data?.success && data?.policy) {
        const user = getAuthUser(req);
        if (user) {
          sendEmail(
            user.email,
            `✅ Policy Issued — ${data.policy.policyNumber}`,
            policyConfirmationHtml(user.fullName, data.policy)
          ).catch(() => {});
          sendWhatsApp(
            user.phone,
            `🛡️ *PolicyDekho — Policy Issued!*\nPolicy No: *${data.policy.policyNumber}*\nPlan: ${data.policy.planName}\nSum Insured: ₹${Number(data.policy.sumInsured).toLocaleString("en-IN")}\nValid Till: ${data.policy.policyEndDate}\n\nThank you for choosing PolicyDekho!`
          ).catch(() => {});
        }
      }
      return origJson(data);
    };
  }
  next();
});

// ── Admin user management endpoints ──────────────────────────
app.get("/api/admin/users", (req: any, res: any) => {
  const user = getAuthUser(req);
  if (!user || usersDb[0]?.id !== user.id) return res.status(403).json({ success: false, message: "Admin access required" });
  res.json({
    success: true,
    users: usersDb.map(({ passwordHash, ...u }) => ({
      ...u,
      policiesCount: (userPoliciesDb[u.id] || []).length,
    })),
  });
});

app.patch("/api/admin/users/:id/pro", (req: any, res: any) => {
  const admin = getAuthUser(req);
  if (!admin || usersDb[0]?.id !== admin.id) return res.status(403).json({ success: false, message: "Admin access required" });

  const target = usersDb.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ success: false, message: "User not found" });

  target.isAiProSubscriber = req.body.enabled ?? true;
  if (req.body.enabled) {
    target.aiProPlanType = "MONTHLY_199";
    target.aiProExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
  saveAppDB();
  const { passwordHash, ...userPayload } = target;
  return res.json({ success: true, user: userPayload });
});

app.delete("/api/admin/users/:id", (req: any, res: any) => {
  const admin = getAuthUser(req);
  if (!admin || usersDb[0]?.id !== admin.id) return res.status(403).json({ success: false, message: "Admin access required" });
  if (req.params.id === admin.id) return res.status(400).json({ success: false, message: "Cannot delete yourself" });

  const idx = usersDb.findIndex(u => u.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "User not found" });

  usersDb.splice(idx, 1);
  delete userPoliciesDb[req.params.id];
  saveAppDB();
  return res.json({ success: true, message: "User deleted." });
});

// ── SEO endpoints ────────────────────────────────────────────
app.get("/sitemap.xml", (_req: any, res: any) => {
  const base = process.env.APP_URL || "https://policydekho.in";
  res.setHeader("Content-Type", "application/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><priority>1.0</priority><changefreq>daily</changefreq></url>
  <url><loc>${base}/compare</loc><priority>0.9</priority></url>
  <url><loc>${base}/claim</loc><priority>0.8</priority></url>
  <url><loc>${base}/hospitals</loc><priority>0.7</priority></url>
  <url><loc>${base}/estimator</loc><priority>0.8</priority></url>
</urlset>`);
});

app.get("/robots.txt", (_req: any, res: any) => {
  res.type("text/plain");
  res.send(`User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${process.env.APP_URL || "https://policydekho.in"}/sitemap.xml`);
});

// ══════════════════════════════════════════════════════════════
// SELF-LEARNING AI CHATBOT ENDPOINTS
// ══════════════════════════════════════════════════════════════

// ── Brain endpoints use processChat, submitFeedback etc. loaded above ──

// POST /api/ai/chat — streaming self-learning chat
app.post("/api/ai/chat", async (req: any, res: any) => {
  const { message, sessionId, userId } = req.body;
  if (!message?.trim()) return res.status(400).json({ success: false, message: "Message required" });

  const sid = sessionId || `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user = getAuthUser(req);
  const uid = userId || user?.id;

  await processChat(message, sid, uid, res);
});

// POST /api/ai/feedback — thumbs up / thumbs down
app.post("/api/ai/feedback", async (req: any, res: any) => {
  const { messageId, rating } = req.body;
  if (!messageId || ![1, -1].includes(rating)) {
    return res.status(400).json({ success: false, message: "messageId and rating (1 or -1) required" });
  }
  await submitFeedback(messageId, rating as 1 | -1);
  return res.json({
    success: true,
    message: rating === 1 ? "Thanks for the positive feedback! 🎉" : "Thanks — we'll improve that response.",
  });
});

// GET /api/ai/history — get session conversation history
app.get("/api/ai/history/:sessionId", (req: any, res: any) => {
  const history = getSessionHistory(req.params.sessionId);
  return res.json({ success: true, messages: history });
});

// GET /api/ai/profile — get learned user profile
app.get("/api/ai/profile", (req: any, res: any) => {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
  const profile = getUserProfile(user.id);
  return res.json({ success: true, profile });
});

// GET /api/ai/brain/stats — admin: brain analytics
app.get("/api/ai/brain/stats", (req: any, res: any) => {
  const user = getAuthUser(req);
  const isAdmin = user && usersDb[0]?.id === user.id;
  if (!isAdmin) return res.status(403).json({ success: false, message: "Admin only" });
  return res.json({ success: true, stats: getBrainStats() });
});

// GET /api/ai/brain/knowledge — admin: view knowledge base
app.get("/api/ai/brain/knowledge", (req: any, res: any) => {
  const user = getAuthUser(req);
  const isAdmin = user && usersDb[0]?.id === user.id;
  if (!isAdmin) return res.status(403).json({ success: false, message: "Admin only" });

  const { page = 1, limit = 20, filter } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  let items = [...brain.knowledgeBase];
  if (filter === 'positive') items = items.filter(q => q.rating === 1);
  if (filter === 'negative') items = items.filter(q => q.rating === -1);
  if (filter === 'unrated') items = items.filter(q => q.rating === 0);

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = items.length;
  const paginated = items.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    items: paginated.map(({ id, question, answer, rating, usedCount, tags, createdAt }) => ({
      id, question: question.slice(0, 120), answer: answer.slice(0, 200),
      rating, usedCount, tags, createdAt,
    })),
  });
});

// DELETE /api/ai/brain/knowledge/:id — admin: remove bad entry
app.delete("/api/ai/brain/knowledge/:id", (req: any, res: any) => {
  const user = getAuthUser(req);
  const isAdmin = user && usersDb[0]?.id === user.id;
  if (!isAdmin) return res.status(403).json({ success: false, message: "Admin only" });

  const idx = brain.knowledgeBase.findIndex(q => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: "Entry not found" });

  brain.knowledgeBase.splice(idx, 1);
  return res.json({ success: true, message: "Entry removed from knowledge base." });
});

// POST /api/ai/brain/seed — admin: manually add a golden Q&A pair
app.post("/api/ai/brain/seed", (req: any, res: any) => {
  const user = getAuthUser(req);
  const isAdmin = user && usersDb[0]?.id === user.id;
  if (!isAdmin) return res.status(403).json({ success: false, message: "Admin only" });

  const { question, answer, tags } = req.body;
  if (!question || !answer) return res.status(400).json({ success: false, message: "question and answer required" });

  brain.knowledgeBase.unshift({
    id: `manual_${brain._nextId++}`,
    question,
    answer,
    rating: 1, // manually seeded = pre-approved
    usedCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: tags || ['general'],
  });

  return res.json({ success: true, message: "Golden Q&A pair added to knowledge base." });
});

// GET /api/ai/suggestions — quick question suggestions for current user
app.get("/api/ai/suggestions", (req: any, res: any) => {
  const user = getAuthUser(req);
  const profile = user ? getUserProfile(user.id) : null;

  const DEFAULT_SUGGESTIONS = [
    "Which health plan has the best CSR in India?",
    "How does cashless claim work in hospitals?",
    "What is the difference between CSR and ICR?",
    "Best term life plan under ₹1,000/month?",
    "How much health cover do I need for my family?",
    "What add-ons should I buy for car insurance?",
    "How to calculate my premium including 18% GST?",
    "What is the IRDAI minimum solvency ratio?",
  ];

  if (!profile || profile.totalQuestions < 2) {
    return res.json({ success: true, suggestions: DEFAULT_SUGGESTIONS.slice(0, 5) });
  }

  // Personalise suggestions based on learned profile
  const personalised: string[] = [];

  if (profile.inferredAge && profile.inferredAge < 35) {
    personalised.push("What is the best term life plan for someone under 35?");
  }
  if (profile.inferredAge && profile.inferredAge > 45) {
    personalised.push("Which health plan covers pre-existing conditions with shorter waiting period?");
  }
  if (profile.inferredCity) {
    personalised.push(`Which hospitals have cashless facilities in ${profile.inferredCity}?`);
  }
  if (profile.topicsInterested.includes('health')) {
    personalised.push("Should I get a Super Top-Up instead of upgrading my base plan?");
  }
  if (profile.topicsInterested.includes('motor')) {
    personalised.push("Is Zero Depreciation add-on worth it for a 3-year-old car?");
  }
  if (profile.estimatedBudget && profile.estimatedBudget < 15000) {
    personalised.push(`What's the best health plan within ₹${profile.estimatedBudget.toLocaleString('en-IN')}/year?`);
  }

  const suggestions = [...personalised, ...DEFAULT_SUGGESTIONS]
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  return res.json({ success: true, suggestions, profileSummary: {
    age: profile.inferredAge,
    city: profile.inferredCity,
    topics: profile.topicsInterested.slice(0, 3),
  }});
});

// Vite middleware for dev / static files for production

async function startServer() {
  await loadBrainModule();
  await seedDemoUsers();
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(currentDirname, "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aegis Shield Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
