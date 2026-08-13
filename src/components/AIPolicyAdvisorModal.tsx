import React, { useState, useRef, useEffect } from 'react';
import { X, Zap, Send, Lock, ThumbsUp, ThumbsDown, RefreshCw, Lightbulb, User } from 'lucide-react';
import type { IndianPolicy, User as UserType } from '../types';

interface AIPolicyAdvisorModalProps {
  onClose: () => void;
  policies: IndianPolicy[];
  onSelectRecommendedPolicy: (p: IndianPolicy) => void;
  user: UserType | null;
  onOpenAuthModal: (mode?: 'login' | 'register', reason?: string) => void;
  onOpenAIProModal: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
  rated?: 1 | -1 | null;
}

const API = '';

export const AIPolicyAdvisorModal: React.FC<AIPolicyAdvisorModalProps> = ({
  onClose, policies, onSelectRecommendedPolicy, user, onOpenAuthModal, onOpenAIProModal
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! 🙏 I'm PolicyDekho AI — trained on real IRDAI FY 2024-25 data and improving with every conversation.\n\nI can help you:\n• Compare policies by **CSR, ICR, and solvency** — using verified IRDAI data\n• Estimate premiums with 18% GST for your age and city\n• Understand cashless claims, waiting periods, and add-ons\n• Find the best plan for your budget and health needs\n\nWhat would you like to know?`,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Which health plan has the best CSR?',
    'Best term life under ₹1,000/month?',
    'How does cashless claim work?',
    'Compare Star Health vs HDFC ERGO',
    'How much health cover do I need?',
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load personalised suggestions
  useEffect(() => {
    fetch(`${API}/api/ai/suggestions`, {
      headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
    })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSuggestions(d.suggestions);
          if (d.profileSummary?.age || d.profileSummary?.city) {
            setProfile(d.profileSummary);
          }
        }
      })
      .catch(() => {});
  }, [user]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const msgId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setShowSuggestions(false);

    const userMsgId = msgId();
    const asstMsgId = msgId();

    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: msg },
      { id: asstMsgId, role: 'assistant', content: '', loading: true, rated: null },
    ]);
    setLoading(true);

    try {
      const response = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          message: msg,
          sessionId,
          userId: user?.id,
        }),
      });

      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';
      let serverMsgId = asstMsgId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(part.slice(6));
            if (event.type === 'session_id') {
              // session confirmed
            } else if (event.type === 'chunk') {
              fullText += event.text;
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId
                  ? { ...m, content: fullText, loading: false }
                  : m
              ));
            } else if (event.type === 'done') {
              if (event.messageId) serverMsgId = event.messageId;
            } else if (event.type === 'error') {
              setMessages(prev => prev.map(m =>
                m.id === asstMsgId
                  ? { ...m, content: `⚠️ ${event.message}`, loading: false }
                  : m
              ));
            }
          } catch {}
        }
      }

      // Update message ID to server-assigned one for feedback
      setMessages(prev => prev.map(m =>
        m.id === asstMsgId ? { ...m, id: serverMsgId, loading: false, rated: null } : m
      ));

    } catch (err: any) {
      // Fallback to local response
      const fallback = generateLocalResponse(msg, policies);
      setMessages(prev => prev.map(m =>
        m.id === asstMsgId
          ? { ...m, content: fallback, loading: false, rated: null }
          : m
      ));
    }

    setLoading(false);
  };

  const submitFeedback = async (messageId: string, rating: 1 | -1) => {
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, rated: rating } : m
    ));

    try {
      await fetch(`${API}/api/ai/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({ messageId, rating }),
      });
    } catch {}
  };

  const generateLocalResponse = (question: string, policies: IndianPolicy[]): string => {
    const q = question.toLowerCase();

    if (q.includes('csr') || q.includes('claim settlement') || q.includes('best')) {
      const top = [...policies].sort((a, b) => b.claimSettlementRatio - a.claimSettlementRatio).slice(0, 3);
      return `**Top CSR Rankings (IRDAI FY 2024-25):**\n\n${top.map((p, i) =>
        `${i+1}. **${p.planName}** — ${p.claimSettlementRatio}% CSR | ICR ${p.incurredClaimRatio}%`
      ).join('\n')}\n\n✅ CSR above 98% means the insurer settles nearly all claims within 3 months.`;
    }

    if (q.includes('health') || q.includes('medical')) {
      const health = policies.filter(p => p.category === 'HEALTH').sort((a, b) => b.claimSettlementRatio - a.claimSettlementRatio);
      return `**Top Health Insurance Plans (IRDAI FY 2024-25):**\n\n${health.slice(0, 3).map(p =>
        `• **${p.planName}** — ${p.claimSettlementRatio}% CSR | ${p.networkCount.toLocaleString()}+ hospitals | ₹${p.baseAnnualPremium.toLocaleString('en-IN')}/yr`
      ).join('\n')}\n\n💡 Niva Bupa and Aditya Birla both achieved **100% CSR** in FY 2024-25 for standalone health.`;
    }

    if (q.includes('term') || q.includes('life')) {
      const life = policies.filter(p => p.category === 'TERM_LIFE').sort((a, b) => b.claimSettlementRatio - a.claimSettlementRatio);
      return `**Top Term Life Plans (IRDAI FY 2024-25):**\n\n${life.slice(0, 3).map(p =>
        `• **${p.planName}** — ${p.claimSettlementRatio}% CSR | Solvency ${p.solvencyRatio}x | ₹${p.baseAnnualPremium.toLocaleString('en-IN')}/yr`
      ).join('\n')}\n\n💡 HDFC Life holds **India's highest CSR at 99.96%** for FY 2024-25.`;
    }

    if (q.includes('gst') || q.includes('tax') || q.includes('80d')) {
      return `**GST & Tax on Insurance (IRDAI Mandate):**\n\n• All insurance premiums attract **18% GST**\n• Example: ₹10,000 base premium → ₹1,800 GST → **₹11,800 total**\n\n**Section 80D Tax Benefit:**\n• Self + family health: up to **₹25,000** deduction\n• Senior citizen parents: up to **₹50,000** additional\n• Maximum total: **₹75,000/year**`;
    }

    if (q.includes('cashless') || q.includes('claim') || q.includes('hospital')) {
      return `**How Cashless Claims Work:**\n\n1. **Planned:** Inform insurer 24-48 hours before admission\n2. **Emergency:** Inform within 24 hours of admission\n3. Hospital sends pre-auth to TPA (2-6 hour approval)\n4. Treatment proceeds — you pay only non-covered items\n5. Hospital settles directly with insurer\n\n✅ Always carry your **Cashless Card** and **policy number** to the hospital.`;
    }

    return `I can help you with insurance comparisons, CSR ratings, premium calculations, and claim guidance.\n\nTry asking:\n• "Which health plan has 100% CSR?"\n• "Best term life under ₹1,000/month"\n• "How to file a cashless claim?"`;
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 6 }}/>;
      // Bold text
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <div key={i} style={{ marginBottom: 2, lineHeight: 1.6 }}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <strong key={j} style={{ color: line.startsWith('•') || line.startsWith('1.') || line.startsWith('2.') ? 'inherit' : '#0A1628' }}>{part}</strong>
              : <span key={j}>{part}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520, height: '88vh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #00C896, #00A87E)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap size={18} color="white"/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>PolicyDekho AI Advisor</div>
            <div style={{ fontSize: 11, color: '#00A87E', display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00C896', display: 'inline-block', animation: 'pulse-teal 2s infinite' }}/>
              Self-learning · IRDAI FY 2024-25 data
            </div>
          </div>
          {profile && (
            <div style={{ fontSize: 10, color: 'var(--slate)', textAlign: 'right', lineHeight: 1.6 }}>
              {profile.age && <div>Age ~{profile.age}</div>}
              {profile.city && <div>{profile.city.charAt(0).toUpperCase() + profile.city.slice(1)}</div>}
            </div>
          )}
          {!user?.isAiProSubscriber && (
            <button onClick={onOpenAIProModal}
              className="badge badge-purple"
              style={{ cursor: 'pointer', flexShrink: 0 }}>
              ⚡ Pro
            </button>
          )}
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)', padding: 4 }}>
            <X size={18}/>
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, maxWidth: '87%' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #00C896, #00A87E)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <Zap size={13} color="white"/>
                  </div>
                )}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                  fontSize: 13,
                  lineHeight: 1.6,
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #0A1628, #1E3A5F)'
                    : 'white',
                  color: msg.role === 'user' ? 'white' : 'var(--navy)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                  boxShadow: '0 1px 4px rgba(10,22,40,0.06)',
                }}>
                  {msg.loading ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 20 }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', opacity: 0.6, animation: `bounce 1.2s ${i * 0.2}s infinite` }}/>
                      ))}
                    </div>
                  ) : (
                    renderContent(msg.content)
                  )}
                </div>
                {msg.role === 'user' && (
                  <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <User size={13} color="white"/>
                  </div>
                )}
              </div>

              {/* Feedback buttons for assistant messages */}
              {msg.role === 'assistant' && !msg.loading && msg.id !== 'welcome' && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6, marginLeft: 36 }}>
                  <button
                    onClick={() => msg.rated !== 1 && submitFeedback(msg.id, 1)}
                    style={{
                      background: msg.rated === 1 ? 'rgba(0,200,150,0.12)' : 'transparent',
                      border: `1px solid ${msg.rated === 1 ? 'rgba(0,200,150,0.3)' : 'var(--border)'}`,
                      borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, color: msg.rated === 1 ? '#00A87E' : 'var(--slate)',
                      transition: 'all 0.15s',
                    }}
                    title="Helpful"
                  >
                    <ThumbsUp size={11}/> {msg.rated === 1 ? 'Helpful!' : 'Helpful'}
                  </button>
                  <button
                    onClick={() => msg.rated !== -1 && submitFeedback(msg.id, -1)}
                    style={{
                      background: msg.rated === -1 ? 'rgba(239,68,68,0.08)' : 'transparent',
                      border: `1px solid ${msg.rated === -1 ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
                      borderRadius: 6, padding: '3px 8px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, color: msg.rated === -1 ? '#DC2626' : 'var(--slate)',
                      transition: 'all 0.15s',
                    }}
                    title="Not helpful — we'll improve this"
                  >
                    <ThumbsDown size={11}/> {msg.rated === -1 ? 'Improving...' : 'Not helpful'}
                  </button>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef}/>
        </div>

        {/* Suggestions */}
        {showSuggestions && messages.length <= 2 && (
          <div style={{ padding: '0 16px 8px', flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Lightbulb size={12}/> {profile ? 'Personalised for you' : 'Quick questions'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  style={{
                    background: 'white', border: '1px solid var(--border)', borderRadius: 20,
                    padding: '5px 12px', fontSize: 11.5, color: 'var(--navy2)',
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--sans)',
                  }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--teal)'; (e.currentTarget as HTMLElement).style.color = 'var(--teal)'; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--navy2)'; }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              ref={inputRef}
              className="inp"
              placeholder="Ask about any insurance plan, CSR, or claim..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              disabled={loading}
              style={{ fontSize: 13 }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{ padding: '10px 14px', flexShrink: 0 }}
            >
              {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }}/> : <Send size={16}/>}
            </button>
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--slate)' }}>
              🧠 Learning from {user ? 'your' : 'user'} feedback · IRDAI FY 2024-25 data
            </span>
            {!user && (
              <button onClick={() => { onClose(); onOpenAuthModal('login'); }}
                style={{ fontSize: 11, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Sign in for personalised advice →
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
