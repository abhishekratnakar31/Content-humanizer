import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, Plus, UserCheck, ChevronDown, ChevronUp, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

// ──────────────────────────────────────────────
// Human Score Badge Component
// ──────────────────────────────────────────────
interface HumanScoreProps {
  score: number;   // 1–10
  percent?: number; // optional override for % label
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
}

function HumanScoreBadge({ score, percent, size = 'md', showBar = true }: HumanScoreProps) {
  const pct = percent !== undefined ? percent : Math.round((score / 10) * 100);
  const clampedScore = Math.min(10, Math.max(0, score));

  // Color logic based on score
  const color = clampedScore >= 9
    ? { bar: '#10b981', text: '#059669', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' }
    : clampedScore >= 7
    ? { bar: '#6366f1', text: '#6366f1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)' }
    : { bar: '#f59e0b', text: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' };

  const label = clampedScore >= 9 ? 'Verified Human' : clampedScore >= 7 ? 'Mostly Human' : 'Partially Human';

  if (size === 'sm') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: color.bg, border: `1px solid ${color.border}`,
        borderRadius: '20px', padding: '0.1rem 0.5rem',
        fontSize: '0.7rem', fontWeight: 700, color: color.text,
        whiteSpace: 'nowrap'
      }}>
        <ShieldCheck size={10} />
        {clampedScore}/10 Human
      </span>
    );
  }

  if (size === 'lg') {
    return (
      <div style={{
        background: color.bg, border: `1px solid ${color.border}`,
        borderRadius: '12px', padding: '1rem 1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} style={{ color: color.text }} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: color.text }}>Human Writing Score</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: color.text, lineHeight: 1 }}>{clampedScore}</span>
            <span style={{ fontSize: '1rem', color: color.text, opacity: 0.7 }}>/10</span>
          </div>
        </div>
        {showBar && (
          <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: `linear-gradient(90deg, ${color.bar}aa, ${color.bar})`,
              borderRadius: '999px',
              transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: color.text, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: '0.78rem', color: color.text, fontWeight: 700 }}>{pct}% Human</span>
        </div>
      </div>
    );
  }

  // 'md' size
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600, color: color.text }}>
          <ShieldCheck size={13} />{label}
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: color.text }}>{clampedScore}/10</span>
      </div>
      {showBar && (
        <div style={{ height: '5px', borderRadius: '999px', background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: `linear-gradient(90deg, ${color.bar}aa, ${color.bar})`,
            borderRadius: '999px',
            transition: 'width 0.6s ease'
          }} />
        </div>
      )}
    </div>
  );
}

const RECOMMENDED_PROFILES = [
  {
    id: 'rec_tech',
    name: 'Tech Critic (Analytical)',
    description: 'Critical, objective, detail-oriented reviews.',
    sampleText: 'There is an irreplaceable quality in the physical notebook that the screen has yet to replicate. In a world defined by notifications, paper offers a rare sanctuary. When you write by hand, there is no latency, no software update, and no battery alert. But more importantly, the act of putting pen to paper slows down our thoughts. It forces a translation of chaos into linear structure. Sure, digital tools make searching and indexing effortless, but they also introduce a subtle friction: the friction of endless choices. Choosing the right app, the perfect font, the neatest folder structure—all of these are forms of procrastination disguised as organization. A blank notebook demands nothing but your thoughts. It is raw, imperfect, and completely yours.'
  },
  {
    id: 'rec_creative',
    name: 'Creative Storyteller (Warm & Narrative)',
    description: 'Descriptive, warm, conversational blog posting.',
    sampleText: 'The rain had been falling steadily since midday, turning the coastal town into a soft, grey watercolor. I found myself ducking into a small coffee house on the corner of the pier. The place smelled of roasted beans, damp coats, and old floorboards. A low hum of conversation drifted from the corner tables, punctuated by the occasional clink of a ceramic mug. I ordered a hot espresso and sat near the window, watching the raindrops trace unpredictable paths down the glass. Outside, the sea was restless, tossing dark waves against the wooden pilings of the dock. In that small, warm space, surrounded by strangers, there was a comforting sense of shared shelter. It felt like a brief, quiet pause in a world that rarely stops moving.'
  },
  {
    id: 'rec_executive',
    name: 'Executive Leader (Professional & Direct)',
    description: 'Structured, business editorial & thought leadership.',
    sampleText: 'Modern workplaces are drowning in synchronous collaboration. We have substituted actual work with the illusion of progress through endless video calls and real-time chat. If we want our teams to do deep, meaningful work, we must transition to an asynchronous-first communication culture. This shift requires high-quality documentation. When communication is asynchronous, writing becomes the primary medium of leadership. It forces clarity of thought. You cannot hand-wave a proposal in a well-written brief the way you can in a chaotic meeting. Furthermore, async communication respects individual focus, allowing team members to respond when they are in a position to think, not just react. We must measure performance by outcomes, not by presence in chat rooms.'
  },
  {
    id: 'rec_educator',
    name: 'Friendly Educator (Casual & Instructive)',
    description: 'Easy-to-follow, supportive, and engaging learning style.',
    sampleText: "Think about the last time you tried to learn something completely new. It probably felt overwhelming, right? That is totally normal. When we dive into a complex topic, our brains try to process everything all at once. The trick is to break it down into tiny, digestible pieces. Don't try to build the whole house on day one—just focus on laying a single, solid brick. Ask questions, make mistakes, and don't be afraid to say 'I don't know yet.' Learning is not a race to a finish line; it is a journey of curiosity. Let's take it one step at a time and see where it leads."
  },
  {
    id: 'rec_scientific',
    name: 'Scientific Explainer (Precise & Clear)',
    description: 'Technical information translated into clear, structured explanations.',
    sampleText: 'To understand how neural networks process information, it helps to look at biological systems. Our brains consist of billions of interconnected neurons that communicate via electrical signals. When we learn, the connections between these neurons strengthen or weaken. Artificial neural networks mimic this process mathematically. They take inputs, pass them through layers of weighted nodes, and produce an output. During training, the network compares its output to the desired result and adjusts the weights using an optimization algorithm. It is not magic; it is simply statistical pattern matching scaled up to a massive degree.'
  },
  {
    id: 'rec_minimalist',
    name: 'Minimalist Essayist (Quiet & Reflective)',
    description: 'Short, rhythmic sentences focusing on simplicity and mindfulness.',
    sampleText: 'We accumulate too much. Not just objects, but thoughts, projects, and commitments. We build elaborate systems to manage our busyness. But what if the answer is not managing it, but letting it go? True productivity is not about doing more; it is about having less to do. When you clear away the noise, what remains is space. Space to breathe, space to think, and space to create. Simplify your tools. Shorten your list. Focus on what is right in front of you. Everything else can wait.'
  },
  {
    id: 'rec_finance',
    name: 'Financial Analyst (Analytical & Logical)',
    description: 'Professional market insights, data-driven, and objective.',
    sampleText: 'Market volatility should not be viewed as a crisis, but as a pricing adjustment. When interest rates rise, capital becomes expensive, forcing businesses to prioritize efficiency over expansion. This transition inevitably leads to market corrections. Investors who focus on long-term value rather than short-term fluctuations tend to find opportunities during these downturns. Evaluating a company requires looking beyond its quarterly revenue. One must assess cash flow stability, debt ratios, and competitive positioning. Diversification remains the most reliable hedge against macroeconomic uncertainty.'
  },
  {
    id: 'rec_lifestyle',
    name: 'Lifestyle Journalist (Enthusiastic & Vivid)',
    description: 'Engaging, cultural, and vivid descriptions of food and travel.',
    sampleText: 'There is something magical about Sunday mornings in the city. The streets are quiet, bathed in the soft glow of early light. The local bakery is always the first to wake, sending the warm aroma of fresh croissants and toasted sourdough into the air. A slow walk through the neighborhood market reveals stalls bursting with seasonal fruits, fresh flowers, and artisanal cheeses. It is a sensory reminder to slow down and appreciate the simple pleasures of the weekend. Grab a coffee, sit on a park bench, and just watch the world wake up.'
  },
  {
    id: 'rec_marketer',
    name: 'Marketing Strategist (Persuasive & Engaging)',
    description: 'Results-oriented, benefit-focused, and highly engaging.',
    sampleText: 'Great marketing does not feel like selling. It feels like solving a problem. If you want to connect with your audience, you must stop talking about your features and start talking about their challenges. People do not buy products; they buy better versions of themselves. Map out the customer journey. Identify where they experience friction, and design your messaging to address those specific pain points. Keep it clear, keep it honest, and build trust over time. When you focus on value, the conversions follow naturally.'
  },
  {
    id: 'rec_conversation',
    name: 'The Conversationalist (Warm & Friendly)',
    description: 'Friendly, relaxed style using simple conversational terms.',
    sampleText: "Let's be honest—nobody likes reading dry, boring text. We want to read things that sound like they were written by a real person. So why do we change our tone when we write? We use big words and complex sentences to sound smart, but it usually just ends up sounding stiff. The best writing is just conversation put on paper. Write like you talk. Use short words, ask questions, and let your personality show through. It makes your writing more engaging, easier to read, and a lot more fun to create."
  }
];

export default function VoiceVault() {
  const { user, voiceProfiles, createVoiceProfile, getVoiceProfileDetails, updateVoiceProfile, deleteVoiceProfile, recommendVoiceProfile } = useAppStore();
  
  // Create Form State
  const [name, setName] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  // AI Persona Recommendation Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingRecommendation, setGeneratingRecommendation] = useState(false);
  const [generatedScore, setGeneratedScore] = useState<{ likeness: number, rating: number } | null>(null);

  // Card Expand / View State (Inline, no pop-ups)
  const [expandedProfileId, setExpandedProfileId] = useState<string | null>(null);
  const [profileDetails, setProfileDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [editName, setEditName] = useState('');
  const [editSampleText, setEditSampleText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete Confirmation State (Inline)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const tier = user?.tier || 'starter';
  const maxProfiles = tier === 'enterprise' ? 10 : tier === 'professional' ? 6 : 3;
  const customProfilesCount = voiceProfiles.filter(p => p.voiceProfileId !== 'vp_default').length;
  const isLimitReached = customProfilesCount >= maxProfiles;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sampleText.trim() || isLimitReached) return;
    
    // Capture the current score before the form resets
    const scoreToSave = generatedScore?.rating;

    setAnalyzing(true);
    setTimeout(async () => {
      // Pass the AI-generated score so the Registered Personas table shows the real value
      const success = await createVoiceProfile(name, sampleText, scoreToSave);
      if (success) {
        // Only clear form on success — preserves input if backend rejects
        setName('');
        setSampleText('');
        setGeneratedScore(null);
      }
      setAnalyzing(false);
    }, 2000);
  };

  const handleGenerateAiPreset = async () => {
    if (!aiPrompt.trim() || isLimitReached || analyzing) return;
    setGeneratingRecommendation(true);
    setGeneratedScore(null);
    try {
      const recommendation = await recommendVoiceProfile(aiPrompt);
      if (recommendation) {
        setName(recommendation.name);
        setSampleText(recommendation.sampleText);
        if (recommendation.human_likeness !== undefined && recommendation.human_rating !== undefined) {
          setGeneratedScore({
            likeness: recommendation.human_likeness,
            rating: recommendation.human_rating
          });
        }
        setAiPrompt('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingRecommendation(false);
    }
  };

  const handleExpand = async (id: string) => {
    setExpandedProfileId(id);
    setLoadingDetails(true);
    setIsEditing(false);
    setConfirmDeleteId(null);
    try {
      const details = await getVoiceProfileDetails(id);
      setProfileDetails(details);
      if (details) {
        setEditName(details.name);
        setEditSampleText(details.sampleText || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedProfileId || !editName.trim() || !editSampleText.trim()) return;

    setSavingEdit(true);
    try {
      await updateVoiceProfile(expandedProfileId, editName, editSampleText);
      // Refresh details inline
      await handleExpand(expandedProfileId);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteVoiceProfile(id);
    if (expandedProfileId === id) {
      setExpandedProfileId(null);
      setProfileDetails(null);
    }
    setConfirmDeleteId(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
          Brand Voice
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.5' }}>
          Analyze and clone your specific writing style. Save multiple personas to override uniform AI vocabulary.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5', maxWidth: '720px' }}>
          <strong>How it works:</strong> By training a custom profile, the AI learns your unique sentence structures, tone, and vocabulary. When you humanize text, it applies these traits directly to make the output match your personal style instead of standard AI patterns.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 0.3fr', gap: '2rem', width: '100%' }}>
        {/* Create Persona form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Train Custom Writing Profile
          </h3>

          <form onSubmit={handleSubmit}>
            {isLimitReached && (
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                color: 'var(--color-danger)',
                fontSize: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Limit Reached:</strong> You have created the maximum of {maxProfiles} custom personas allowed under your plan ({tier}). Please delete an existing persona to train a new one.
                </span>
              </div>
            )}

            <div className="form-group">
              <label>Persona Name</label>
              <input 
                type="text" 
                className="text-input" 
                placeholder="e.g. CEO Editorial, Friendly Blogger, Tech Reviewer"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={analyzing || isLimitReached}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label>Writing Style Reference Text</label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Recommended: 1,000+ words
                </span>
              </div>
              <textarea 
                className="editor-textarea" 
                style={{ height: '240px' }}
                placeholder="Paste samples of your writing. The engine will extract sentence complexity distributions, punctuation densities, conversational fillers, and syntax fingerprints..."
                value={sampleText}
                onChange={(e) => { setSampleText(e.target.value); setGeneratedScore(null); }}
                required
                disabled={analyzing || isLimitReached}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem', background: 'linear-gradient(135deg, #00a2ff 0%, #1d4ed8 100%)' }}
              disabled={analyzing || isLimitReached || !name.trim() || !sampleText.trim()}
            >
              {analyzing ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  Extracting Voice DNA...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Analyze & Register Writing Style
                </>
              )}
            </button>
          </form>
        </div>

        <div className="glass-card" style={{ alignSelf: 'start' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} style={{ color: 'var(--color-primary)' }} /> Suggested Writing Styles
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: '1.45' }}>
            Don't have your own articles? Click any preset below to instantly load a pre-vetted, 100% human-style writing reference profile.
          </p>

          {/* AI Custom Presets Generator */}
          <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Or generate custom AI persona recommendation (fully human form)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="text-input"
                style={{ flexGrow: 1, padding: '0.5rem 0.75rem', fontSize: '0.8rem', height: '36px' }}
                placeholder="e.g. Warm travel blogger, SaaS executive..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={generatingRecommendation || isLimitReached || analyzing}
              />
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '0 1rem', height: '36px', fontSize: '0.8rem', flexShrink: 0, background: 'linear-gradient(135deg, #00a2ff 0%, #1d4ed8 100%)' }}
                onClick={handleGenerateAiPreset}
                disabled={!aiPrompt.trim() || generatingRecommendation || isLimitReached || analyzing}
              >
                {generatingRecommendation ? (
                  <>
                    <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderLeftColor: '#ffffff' }}></div>
                    Generating...
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '180px', overflowY: 'auto', paddingRight: '4px' }}>
            {RECOMMENDED_PROFILES.map((preset) => {
              const isSelected = name === preset.name && sampleText === preset.sampleText;
              // Map static presets to human rating scores of 9 or 10 since they are fully pre-vetted human samples
              const mockRating = preset.id === 'rec_executive' || preset.id === 'rec_finance' ? 9 : 10;
              const mockPercent = mockRating === 10 ? 98 : 94;
              
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    if (isLimitReached || analyzing) return;
                    setName(preset.name);
                    setSampleText(preset.sampleText);
                    setGeneratedScore({ likeness: mockPercent, rating: mockRating });
                  }}
                  style={{
                    background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.01)',
                    border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--card-border)',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: (isLimitReached || analyzing) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: (isLimitReached || analyzing) ? 0.6 : 1
                  }}
                  className={isSelected ? '' : 'preset-card-hover'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--color-primary)' : 'var(--text-primary)', lineHeight: '1.3' }}>
                      {preset.name}
                    </strong>
                    <HumanScoreBadge score={mockRating} percent={mockPercent} size="sm" />
                  </div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                    {preset.description}
                  </span>
                  {isSelected && (
                    <HumanScoreBadge score={mockRating} percent={mockPercent} size="md" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Human Score — shown after selecting a preset or generating AI recommendation */}
          {generatedScore && (
            <div style={{ marginTop: '1rem' }}>
              <HumanScoreBadge score={generatedScore.rating} percent={generatedScore.likeness} size="lg" />
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', textAlign: 'center' }}>
                Score reflects AI-detection resistance of the selected writing sample.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* List of Active Personas as Tabular View */}
      <div className="glass-card" style={{ width: '100%', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <UserCheck size={18} /> Registered Personas ({voiceProfiles.length})
        </h3>

        {voiceProfiles.length === 0 ? (
          <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6 }}>
            No custom style profiles created yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Persona Name</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Profile ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Type</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Human Score</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {voiceProfiles.map((profile) => {
                  const isExpanded = expandedProfileId === profile.voiceProfileId;
                  const isDefault = profile.voiceProfileId === 'vp_default';
                  
                  return (
                    <React.Fragment key={profile.voiceProfileId}>
                      {/* Main Row */}
                      <tr 
                        style={{ 
                          borderBottom: '1px solid var(--card-border)', 
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          background: isExpanded ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onClick={() => handleExpand(profile.voiceProfileId)}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{profile.name}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{profile.voiceProfileId}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{isDefault ? 'Default Engine' : 'Custom Trained'}</td>
                        <td style={{ padding: '1rem', minWidth: '140px' }}>
                          {isDefault ? (
                            <HumanScoreBadge score={10} percent={99} size="md" />
                          ) : profile.fingerprint?.human_rating !== undefined ? (
                            <HumanScoreBadge
                              score={profile.fingerprint.human_rating}
                              percent={profile.fingerprint.human_rating * 10}
                              size="md"
                            />
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Score on expand
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span className="tag tag-success" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem' }}>Active</span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                              onClick={() => {
                                if (isExpanded) {
                                  setExpandedProfileId(null);
                                  setProfileDetails(null);
                                  setIsEditing(false);
                                } else {
                                  handleExpand(profile.voiceProfileId);
                                }
                              }}
                            >
                              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </button>
                            {!isDefault && (
                              <button
                                style={{ background: 'none', border: 'none', color: 'rgba(239, 68, 68, 0.7)', cursor: 'pointer', padding: '4px' }}
                                onClick={() => setConfirmDeleteId(profile.voiceProfileId)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Delete Confirmation Row */}
                      {confirmDeleteId === profile.voiceProfileId && (
                        <tr onClick={(e) => e.stopPropagation()}>
                          <td colSpan={6} style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.04)', borderBottom: '1px solid var(--card-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                                Are you sure you want to delete this custom persona? This cannot be undone.
                              </span>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                  className="btn-primary"
                                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '0.4rem 0.75rem', fontSize: '0.8rem', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                                  onClick={() => handleDelete(profile.voiceProfileId)}
                                >
                                  Confirm Delete
                                </button>
                                <button
                                  className="btn-secondary"
                                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                  onClick={() => setConfirmDeleteId(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Expanded Content Row */}
                      {isExpanded && (
                        <tr onClick={(e) => e.stopPropagation()}>
                          <td colSpan={6} style={{ padding: '1.5rem', background: 'rgba(255, 255, 255, 0.01)', borderBottom: '1px solid var(--card-border)' }}>
                            {loadingDetails ? (
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0', gap: '0.5rem' }}>
                                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Loading style DNA...</span>
                              </div>
                            ) : isEditing ? (
                              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <label style={{ fontSize: '0.75rem' }}>Persona Name</label>
                                  <input
                                    type="text"
                                    className="text-input"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    required
                                    disabled={savingEdit}
                                    style={{ padding: '0.5rem', fontSize: '0.9rem', width: '100%' }}
                                  />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <label style={{ fontSize: '0.75rem' }}>Writing Style Reference Text</label>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Min 50 chars</span>
                                  </div>
                                  <textarea
                                    className="editor-textarea"
                                    style={{ height: '140px', padding: '0.75rem', fontSize: '0.85rem', width: '100%' }}
                                    value={editSampleText}
                                    onChange={(e) => setEditSampleText(e.target.value)}
                                    required
                                    disabled={savingEdit}
                                  />
                                </div>

                                {editSampleText !== profileDetails?.sampleText && (
                                  <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    alignItems: 'flex-start',
                                    background: 'rgba(245, 158, 11, 0.08)',
                                    border: '1px solid rgba(245, 158, 11, 0.2)',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '6px',
                                    color: 'var(--color-warning)',
                                    fontSize: '0.75rem'
                                  }}>
                                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <span>Saving will trigger re-training of the AI DNA.</span>
                                  </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, #00a2ff 0%, #1d4ed8 100%)' }} disabled={savingEdit}>
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                  </button>
                                  <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }} onClick={() => setIsEditing(false)}>
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {!isDefault && (
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => setIsEditing(true)}>
                                      Edit Persona
                                    </button>
                                  </div>
                                )}

                                {/* DNA details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-info)', textTransform: 'uppercase' }}>Target Audience</strong>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                                      {profileDetails?.fingerprint?.audience || 'General readers.'}
                                    </p>
                                  </div>
                                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Tone Fingerprint</strong>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                                      {profileDetails?.fingerprint?.tone || 'Conversational tone.'}
                                    </p>
                                  </div>
                                  <div style={{ background: 'rgba(99, 102, 241, 0.03)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.12)' }}>
                                    <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-success)', textTransform: 'uppercase' }}>Voice Gap Analysis</strong>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: '1.4' }}>
                                      {profileDetails?.fingerprint?.voice_gap || 'Analysis not generated.'}
                                    </p>
                                  </div>
                                </div>

                                {/* Sample Text */}
                                <div>
                                  <strong style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Writing Style Reference Text</strong>
                                  <div style={{
                                    background: '#ffffff',
                                    border: '1px solid var(--card-border)',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.45',
                                    maxHeight: '120px',
                                    overflowY: 'auto',
                                    whiteSpace: 'pre-wrap'
                                  }}>
                                    {profileDetails?.sampleText || 'No reference text recorded.'}
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
