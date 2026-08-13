/**
 * PolicyDekho — Self-Learning AI Chatbot Engine
 * ================================================
 * How it learns:
 *
 * 1. CONVERSATION MEMORY
 *    Every user conversation is stored. The AI reads past
 *    interactions to personalise responses.
 *
 * 2. FEEDBACK LOOP (thumbs up/down)
 *    Positive responses are stored as "golden answers" in a
 *    knowledge base. Next time a similar question arrives,
 *    the golden answer is injected into the system prompt.
 *
 * 3. RAG (Retrieval Augmented Generation)
 *    TF-IDF keyword matching finds relevant past Q&A pairs.
 *    The top 3 matches are given to Groq as context.
 *
 * 4. ANALYTICS-DRIVEN PROMPT TUNING
 *    Questions that repeatedly get thumbs-down trigger an
 *    automatic prompt improvement cycle using Groq itself.
 *
 * 5. USER PROFILE LEARNING
 *    Age, city, category interest, budget — all inferred
 *    from conversation and stored per user.
 */

import path from 'path';
import fs from 'fs';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

// ── Persistent storage ────────────────────────────────────────
const BRAIN_FILE = path.join(process.cwd(), 'chatbot-brain.json');

interface QAPair {
  id: string;
  question: string;
  answer: string;
  rating: number;         // 1 = thumbs up, -1 = thumbs down, 0 = no rating
  usedCount: number;      // how many times this was retrieved
  createdAt: string;
  updatedAt: string;
  tags: string[];         // inferred topics: health, term, csr, claim, etc.
}

interface UserProfile {
  userId: string;
  inferredAge?: number;
  inferredCity?: string;
  preferredCategory?: string;
  estimatedBudget?: number;
  topicsInterested: string[];
  totalQuestions: number;
  lastSeen: string;
}

interface ChatSession {
  sessionId: string;
  userId?: string;
  messages: { role: string; content: string; rating?: number; ts: string }[];
  startedAt: string;
  lastActivity: string;
}

interface FailedTopic {
  topic: string;
  count: number;
  examples: string[];
  lastSeen: string;
  improved: boolean;
}

interface ChatBrain {
  knowledgeBase: QAPair[];
  userProfiles: Record<string, UserProfile>;
  sessions: Record<string, ChatSession>;
  failedTopics: FailedTopic[];
  systemPromptOverrides: Record<string, string>; // topic -> improved prompt chunk
  stats: {
    totalQuestions: number;
    thumbsUp: number;
    thumbsDown: number;
    avgRating: number;
    lastImprovedAt?: string;
  };
  _nextId: number;
}

function loadBrain(): ChatBrain {
  try {
    if (fs.existsSync(BRAIN_FILE)) {
      return JSON.parse(fs.readFileSync(BRAIN_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('[Brain] Load error:', e);
  }
  return {
    knowledgeBase: [],
    userProfiles: {},
    sessions: {},
    failedTopics: [],
    systemPromptOverrides: {},
    stats: { totalQuestions: 0, thumbsUp: 0, thumbsDown: 0, avgRating: 0 },
    _nextId: 1,
  };
}

function saveBrain() {
  try {
    // Keep only last 500 sessions to avoid file bloat
    const sessionKeys = Object.keys(brain.sessions);
    if (sessionKeys.length > 500) {
      const sorted = sessionKeys.sort((a, b) =>
        brain.sessions[a].lastActivity.localeCompare(brain.sessions[b].lastActivity)
      );
      sorted.slice(0, sorted.length - 500).forEach(k => delete brain.sessions[k]);
    }
    fs.writeFileSync(BRAIN_FILE, JSON.stringify(brain, null, 2));
  } catch (e) {
    console.error('[Brain] Save error:', e);
  }
}

export const brain = loadBrain();

// ── TF-IDF keyword matcher ────────────────────────────────────
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOPWORDS.has(t));
}

const STOPWORDS = new Set([
  'the','is','at','which','on','and','or','a','an','to','in','for',
  'of','with','as','by','from','this','that','are','was','have','has',
  'can','will','my','me','i','you','your','do','does','how','what',
  'when','where','why','who','about','get','please','tell','help',
]);

function tfidfScore(query: string, document: string): number {
  const qTokens = new Set(tokenize(query));
  const dTokens = tokenize(document);
  if (qTokens.size === 0 || dTokens.length === 0) return 0;

  let score = 0;
  qTokens.forEach(token => {
    const tf = dTokens.filter(t => t === token).length / dTokens.length;
    const docsWithTerm = brain.knowledgeBase.filter(qa =>
      tokenize(qa.question + ' ' + qa.answer).includes(token)
    ).length;
    const idf = Math.log((brain.knowledgeBase.length + 1) / (docsWithTerm + 1));
    score += tf * idf;
  });
  return score;
}

function retrieveRelevant(query: string, topK = 3): QAPair[] {
  if (brain.knowledgeBase.length === 0) return [];

  // Only consider highly-rated or neutral pairs
  const candidates = brain.knowledgeBase.filter(qa => qa.rating >= 0);

  const scored = candidates.map(qa => ({
    qa,
    score: tfidfScore(query, qa.question + ' ' + qa.answer),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .filter(s => s.score > 0)
    .map(s => { s.qa.usedCount++; return s.qa; });
}

// ── Topic tagging ─────────────────────────────────────────────
function inferTags(text: string): string[] {
  const t = text.toLowerCase();
  const tags: string[] = [];
  if (t.match(/health|medical|hospital|cashless|hospitali/)) tags.push('health');
  if (t.match(/term|life|death|nominee|payout/)) tags.push('term_life');
  if (t.match(/car|motor|vehicle|accident|garage/)) tags.push('motor');
  if (t.match(/csr|claim settlement|settle|ratio/)) tags.push('csr');
  if (t.match(/premium|price|cost|₹|rupee|gst/)) tags.push('premium');
  if (t.match(/claim|file claim|cashless|reimburse/)) tags.push('claim');
  if (t.match(/compare|comparison|better|best|vs/)) tags.push('comparison');
  if (t.match(/irdai|regulation|license|complian/)) tags.push('irdai');
  if (t.match(/copay|deductible|room rent|waiting/)) tags.push('policy_terms');
  return tags.length > 0 ? tags : ['general'];
}

// ── User profile inference ────────────────────────────────────
function updateUserProfile(userId: string, message: string) {
  if (!brain.userProfiles[userId]) {
    brain.userProfiles[userId] = {
      userId,
      topicsInterested: [],
      totalQuestions: 0,
      lastSeen: new Date().toISOString(),
    };
  }

  const profile = brain.userProfiles[userId];
  profile.totalQuestions++;
  profile.lastSeen = new Date().toISOString();

  // Infer age
  const ageMatch = message.match(/(\d{2})\s*(year|yr|years)\s*old|age\s*(\d{2})/i);
  if (ageMatch) profile.inferredAge = parseInt(ageMatch[1] || ageMatch[3]);

  // Infer city
  const cities = ['mumbai','delhi','bangalore','bengaluru','hyderabad','chennai','pune','kolkata','ahmedabad','jaipur'];
  cities.forEach(city => {
    if (message.toLowerCase().includes(city)) profile.inferredCity = city;
  });

  // Infer category interest
  const tags = inferTags(message);
  tags.forEach(tag => {
    if (!profile.topicsInterested.includes(tag)) {
      profile.topicsInterested.push(tag);
    }
  });

  // Infer budget
  const budgetMatch = message.match(/₹\s*(\d+(?:,\d+)*(?:k)?)|(\d+)\s*(?:k|thousand|lakh)/i);
  if (budgetMatch) {
    const raw = (budgetMatch[1] || budgetMatch[2]).replace(/,/g, '');
    const val = parseInt(raw);
    profile.estimatedBudget = raw.includes('k') || message.includes('thousand') ? val * 1000 : val;
  }
}

// ── Build system prompt (with learning) ───────────────────────
function buildSystemPrompt(userId?: string, relevantQA?: QAPair[]): string {
  const profile = userId ? brain.userProfiles[userId] : null;

  let base = `You are PolicyDekho AI — India's most advanced insurance advisor, powered by real IRDAI FY 2024-25 data.

REAL DATA YOU MUST USE (IRDAI Annual Report FY 2024-25):
- HDFC Life: 99.96% CSR (HIGHEST in India), Solvency 2.22x
- Axis Max Life: 99.70% CSR, Solvency 2.15x
- Tata AIA: 99.41% CSR, Solvency 2.31x (highest)
- Niva Bupa: 100% CSR (standalone health, 3-month settlement), ICR 70.2%
- Aditya Birla Health: 100% CSR (standalone health), ICR 68.4%
- HDFC ERGO: 98% CSR, ICR 81.4%, 13,000+ hospitals
- Star Health: 94.44% CSR, ICR 72.8%, 14,000+ hospitals (largest network)
- Care Health: 95.2% CSR, ICR 71.3%, 10,600 hospitals
- Bajaj Allianz (Car): 98.5% CSR, 4,500 garages
- ICICI Lombard (Car): 98.45% CSR, 5,800 garages
- 18% GST mandatory on all insurance premiums (IRDAI)

IRDAI RULES:
- Minimum solvency ratio: 1.5x (mandatory for all insurers)
- CSR must be published annually
- Section 80D: Health premium deduction up to ₹25,000 (self+family) + ₹50,000 (senior citizen parents)

YOUR PERSONALITY:
- Speak like a trusted friend who happens to be an expert — warm but precise
- Give specific numbers, not vague advice
- When comparing, always reference real CSR/ICR/solvency from IRDAI data
- Never recommend a product without a data-backed reason
- For India-specific: always mention GST impact, 80D benefit, ABHA integration
- Keep responses under 200 words unless asked for detailed breakdown
- Use ₹ symbol, not Rs. or INR`;

  // Add user profile context
  if (profile && profile.totalQuestions > 1) {
    base += `\n\nUSER PROFILE (learned from conversation):`;
    if (profile.inferredAge) base += `\n- Age: ~${profile.inferredAge} years`;
    if (profile.inferredCity) base += `\n- City: ${profile.inferredCity}`;
    if (profile.estimatedBudget) base += `\n- Budget: ~₹${profile.estimatedBudget.toLocaleString('en-IN')}/year`;
    if (profile.topicsInterested.length > 0) base += `\n- Interested in: ${profile.topicsInterested.join(', ')}`;
    base += `\nPersonalise your responses to this profile.`;
  }

  // Inject prompt overrides for topics that had poor ratings
  if (Object.keys(brain.systemPromptOverrides).length > 0) {
    base += `\n\nIMPROVED GUIDANCE (auto-tuned from user feedback):`;
    Object.entries(brain.systemPromptOverrides).forEach(([topic, override]) => {
      base += `\n[${topic.toUpperCase()}]: ${override}`;
    });
  }

  // Inject relevant past Q&A as examples
  if (relevantQA && relevantQA.length > 0) {
    base += `\n\nRELEVANT PAST ANSWERS THAT USERS FOUND HELPFUL:`;
    relevantQA.forEach((qa, i) => {
      base += `\n\nExample ${i + 1}:\nQ: ${qa.question}\nA: ${qa.answer}`;
    });
    base += `\n\nUse these as reference but give a fresh, personalised answer.`;
  }

  return base;
}

// ── Main chat function ────────────────────────────────────────
export async function processChat(
  message: string,
  sessionId: string,
  userId?: string,
  res?: any  // Express response for streaming
): Promise<string> {

  // Update user profile
  if (userId) updateUserProfile(userId, message);

  // Retrieve relevant past Q&A
  const relevantQA = retrieveRelevant(message);

  // Get or create session
  if (!brain.sessions[sessionId]) {
    brain.sessions[sessionId] = {
      sessionId,
      userId,
      messages: [],
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
  }
  const session = brain.sessions[sessionId];
  session.lastActivity = new Date().toISOString();

  // Build messages array (system + history + new message)
  const systemPrompt = buildSystemPrompt(userId, relevantQA);
  const historyMessages = session.messages.slice(-8).map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...historyMessages,
    { role: 'user' as const, content: message },
  ];

  // Add user message to session
  session.messages.push({
    role: 'user',
    content: message,
    ts: new Date().toISOString(),
  });

  brain.stats.totalQuestions++;

  let fullResponse = '';

  if (res) {
    // Streaming mode
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (e: object) => res.write(`data: ${JSON.stringify(e)}\n\n`);
    send({ type: 'session_id', session_id: sessionId });

    try {
      const stream = await groq.chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: 800,
        temperature: 0.45,
        stream: true,
      });

      for await (const part of stream) {
        const delta = part.choices[0]?.delta?.content || '';
        if (delta) {
          fullResponse += delta;
          send({ type: 'chunk', text: delta });
        }
      }

      send({ type: 'done', messageId: `msg_${brain._nextId}` });
      res.end();
    } catch (e: any) {
      const msg = /rate limit/i.test(e.message) ? 'Rate limit hit — please try again in a moment.' : e.message.slice(0, 200);
      send({ type: 'error', message: msg });
      res.end();
      return '';
    }
  } else {
    // Non-streaming mode
    try {
      const response = await groq.chat.completions.create({
        model: MODEL,
        messages,
        max_tokens: 800,
        temperature: 0.45,
      });
      fullResponse = response.choices[0]?.message?.content || '';
    } catch (e: any) {
      return `Sorry, I encountered an error: ${e.message.slice(0, 100)}`;
    }
  }

  // Store assistant response in session
  const messageId = `msg_${brain._nextId++}`;
  session.messages.push({
    role: 'assistant',
    content: fullResponse,
    ts: new Date().toISOString(),
  });

  // Auto-store in knowledge base (will be rated later)
  if (fullResponse.length > 50) {
    brain.knowledgeBase.push({
      id: messageId,
      question: message,
      answer: fullResponse,
      rating: 0,
      usedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: inferTags(message),
    });

    // Keep knowledge base under 2000 entries
    // Remove lowest-rated entries first
    if (brain.knowledgeBase.length > 2000) {
      brain.knowledgeBase.sort((a, b) => b.rating - a.rating || b.usedCount - a.usedCount);
      brain.knowledgeBase = brain.knowledgeBase.slice(0, 1800);
    }
  }

  saveBrain();
  return fullResponse;
}

// ── Feedback handler ──────────────────────────────────────────
export async function submitFeedback(messageId: string, rating: 1 | -1): Promise<void> {
  const qa = brain.knowledgeBase.find(q => q.id === messageId);
  if (!qa) return;

  qa.rating = rating;
  qa.updatedAt = new Date().toISOString();

  if (rating === 1) {
    brain.stats.thumbsUp++;
  } else {
    brain.stats.thumbsDown++;
    // Track failed topics for auto-improvement
    const topicKey = qa.tags[0] || 'general';
    const existing = brain.failedTopics.find(t => t.topic === topicKey);
    if (existing) {
      existing.count++;
      if (existing.examples.length < 5) existing.examples.push(qa.question);
      existing.lastSeen = new Date().toISOString();
    } else {
      brain.failedTopics.push({
        topic: topicKey,
        count: 1,
        examples: [qa.question],
        lastSeen: new Date().toISOString(),
        improved: false,
      });
    }

    // Auto-improve if a topic has 3+ negative ratings
    const failedTopic = brain.failedTopics.find(t => t.topic === topicKey && t.count >= 3 && !t.improved);
    if (failedTopic && process.env.GROQ_API_KEY) {
      improvePromptForTopic(failedTopic).catch(console.error);
    }
  }

  // Recalculate avg rating
  const rated = brain.knowledgeBase.filter(q => q.rating !== 0);
  brain.stats.avgRating = rated.length > 0
    ? rated.reduce((s, q) => s + q.rating, 0) / rated.length
    : 0;

  saveBrain();
}

// ── Auto prompt improvement ───────────────────────────────────
async function improvePromptForTopic(failedTopic: FailedTopic): Promise<void> {
  console.log(`[Brain] Auto-improving prompt for topic: ${failedTopic.topic}`);

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a prompt engineering expert specialising in insurance AI chatbots. Respond with a JSON object only.',
        },
        {
          role: 'user',
          content: `Users are consistently giving negative feedback on responses about "${failedTopic.topic}" insurance.

Example questions they asked (that got poor ratings):
${failedTopic.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Write a concise (2-3 sentence) guidance snippet that should be added to the AI's system prompt to improve responses about "${failedTopic.topic}".

Respond ONLY with JSON: {"guidance": "<2-3 sentence improvement guidance>"}`
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
    });

    const text = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());

    if (parsed.guidance) {
      brain.systemPromptOverrides[failedTopic.topic] = parsed.guidance;
      failedTopic.improved = true;
      brain.stats.lastImprovedAt = new Date().toISOString();
      console.log(`[Brain] ✅ Prompt improved for: ${failedTopic.topic}`);
      saveBrain();
    }
  } catch (e) {
    console.error('[Brain] Auto-improve error:', e);
  }
}

// ── Analytics ─────────────────────────────────────────────────
export function getBrainStats() {
  const totalRated = brain.knowledgeBase.filter(q => q.rating !== 0).length;
  const topTopics = brain.knowledgeBase
    .flatMap(q => q.tags)
    .reduce((acc: Record<string, number>, tag) => { acc[tag] = (acc[tag] || 0) + 1; return acc; }, {});

  const topQA = [...brain.knowledgeBase]
    .filter(q => q.rating === 1)
    .sort((a, b) => b.usedCount - a.usedCount)
    .slice(0, 5)
    .map(({ id, question, usedCount, rating }) => ({ id, question: question.slice(0, 80), usedCount, rating }));

  return {
    knowledgeBaseSize: brain.knowledgeBase.length,
    totalQuestions: brain.stats.totalQuestions,
    thumbsUp: brain.stats.thumbsUp,
    thumbsDown: brain.stats.thumbsDown,
    avgRating: brain.stats.avgRating.toFixed(2),
    totalRated,
    activeSessions: Object.keys(brain.sessions).length,
    userProfiles: Object.keys(brain.userProfiles).length,
    failedTopics: brain.failedTopics.length,
    improvedTopics: brain.failedTopics.filter(t => t.improved).length,
    lastImprovedAt: brain.stats.lastImprovedAt,
    topTopics: Object.entries(topTopics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([topic, count]) => ({ topic, count })),
    topQA,
    promptOverrides: Object.keys(brain.systemPromptOverrides),
  };
}

export function getUserProfile(userId: string) {
  return brain.userProfiles[userId] || null;
}

export function getSessionHistory(sessionId: string) {
  return brain.sessions[sessionId]?.messages || [];
}
