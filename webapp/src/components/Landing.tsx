import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { auth } from '../firebase';
import { 
  Sparkles, 
  ShieldOff,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  X,
  Check,
  Zap,
  Brain,
  Eye,
  Shield,
  Mic,
  PenTool
} from 'lucide-react';

export default function Landing() {
  const { 
    user, 
    detectText, 
    detectionPatterns, 
    detectionMetrics
  } = useAppStore();

  const navigate = useNavigate();

  // Landing Page Editor State
  const [inputText, setInputText] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectionScore, setDetectionScore] = useState<number | null>(null);
  const [detectionError, setDetectionError] = useState(false);
  const [showDetailedMetrics, setShowDetailedMetrics] = useState(false);
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'highlight'>('edit');

  const featuresList = [
    { icon: Brain, title: '11-Agent Pipeline', desc: 'Every piece of content passes through 11 specialized editing agents that each target a different AI signature pattern.', color: '#00a2ff' },
    { icon: Eye, title: 'AI Detection Bypass', desc: 'Achieves consistent bypass rates across GPTZero, Originality.ai, Turnitin, and all major AI detection platforms.', color: '#1e3a8a' },
    { icon: Mic, title: 'Voice Vault', desc: 'Train and store custom writing styles. Apply your unique voice to every piece of content for consistent brand tone.', color: '#00a2ff' },
    { icon: Shield, title: 'Enterprise Security', desc: 'SOC 2 compliant infrastructure with end-to-end encryption. Your content never leaves our secure pipeline.', color: '#1e3a8a' },
    { icon: PenTool, title: 'Style Preservation', desc: 'Maintains your original meaning, structure, and intent while removing machine-generated signatures.', color: '#00a2ff' },
    { icon: Zap, title: 'Real-Time Processing', desc: 'Process content in seconds, not minutes. Our optimized pipeline delivers enterprise-speed humanization.', color: '#1e3a8a' },
  ];

  const pricingPlans = [
    { 
      name: 'Starter Pack', 
      price: 'US$15', 
      period: ' / one-time', 
      credits: '10,000', 
      desc: '~100k words bypass. Perfect for freelance copywriters.', 
      features: ['10,000 standard credits', 'Access to all 11 Agents', 'Up to 3 Voice Vault profiles', '90%+ AI Resistance Guarantee'], 
      highlighted: false 
    },
    { 
      name: 'Professional', 
      price: 'US$48', 
      period: ' / one-time', 
      credits: '50,000', 
      desc: '~500k words bypass. Ideal for content agencies and sites.', 
      features: ['50,000 standard credits', 'Access to all 11 Agents', 'Up to 6 Voice Vault profiles', '90%+ AI Resistance Guarantee'], 
      highlighted: true 
    },
    { 
      name: 'Enterprise Hub', 
      price: 'US$149', 
      period: ' / one-time', 
      credits: '200,000', 
      desc: '~2M words bypass. Best for bulk publishing syndicates.', 
      features: ['200,000 standard credits', 'Access to all 11 Agents', 'Up to 10 Voice Vault profiles', '90%+ AI Resistance Guarantee'], 
      highlighted: false 
    },
  ];

  const handleClear = () => {
    setInputText('');
    setDetectionScore(null);
    setEditorViewMode('edit');
  };

  // Modal Auth State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Stats / Character count
  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

  const handleDetect = async () => {
    if (!inputText.trim()) return;
    setDetecting(true);
    setDetectionScore(null);
    setDetectionError(false);
    const score = await detectText(inputText);
    if (score === -1) {
      setDetectionError(true);
    } else {
      setDetectionScore(score);
      setEditorViewMode('highlight');
    }
    setDetecting(false);
  };

  const handleHumanizeClick = () => {
    if (user) {
      // User is logged in, navigate to playground with pre-filled state if desired, or let them do it there
      navigate('/dashboard/playground', { state: { initialText: inputText } });
    } else {
      // Prompt login popup
      setAuthError(null);
      setShowAuthModal(true);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    if (isSignUp && password !== confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
      navigate('/dashboard/playground');
    } catch (err: any) {
      console.error("Popup email auth error: ", err);
      let friendlyMessage = "Authentication failed. Please check your credentials.";
      if (err.code === 'auth/email-already-in-use') {
        friendlyMessage = "An account already exists with this email address.";
      } else if (err.code === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (err.code === 'auth/weak-password') {
        friendlyMessage = "Password must be at least 6 characters long.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        friendlyMessage = "Incorrect email or password.";
      } else if (err.code === 'auth/invalid-credential') {
        friendlyMessage = "Incorrect email or password.";
      }
      setAuthError(friendlyMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
      navigate('/dashboard/playground');
    } catch (err: any) {
      console.error("Popup Google sign in error: ", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || "Failed to sign in with Google.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const renderHighlightedText = () => {
    if (!inputText) return null;
    if (!detectionPatterns || detectionPatterns.length === 0) {
      return <span>{inputText}</span>;
    }

    interface HighlightInterval {
      start: number;
      end: number;
      explanation: string;
      vector: string;
    }

    const matches: HighlightInterval[] = [];

    detectionPatterns.forEach(pat => {
      const quote = pat.quote.trim();
      if (!quote) return;
      
      let idx = inputText.indexOf(quote);
      while (idx !== -1) {
        matches.push({
          start: idx,
          end: idx + quote.length,
          explanation: pat.explanation,
          vector: pat.vector
        });
        idx = inputText.indexOf(quote, idx + 1);
      }
    });

    if (matches.length === 0) {
      return <span>{inputText}</span>;
    }

    // Merge overlapping/nested intervals
    matches.sort((a, b) => {
      if (a.start !== b.start) return a.start - b.start;
      return b.end - a.end;
    });

    const mergedMatches: HighlightInterval[] = [];
    let current = matches[0];

    for (let i = 1; i < matches.length; i++) {
      const next = matches[i];
      if (next.start < current.end) {
        if (next.end > current.end) {
          current.end = next.end;
        }
      } else {
        mergedMatches.push(current);
        current = next;
      }
    }
    mergedMatches.push(current);

    const resultElements: React.ReactNode[] = [];
    let lastIdx = 0;

    mergedMatches.forEach((match, idx) => {
      if (match.start > lastIdx) {
        resultElements.push(inputText.substring(lastIdx, match.start));
      }
      const matchedText = inputText.substring(match.start, match.end);
      resultElements.push(
        <span 
          key={`hl-${idx}`}
          style={{
            background: 'rgba(239, 68, 68, 0.18)',
            borderBottom: '2.5px solid #ef4444',
            borderRadius: '2px',
            padding: '1px 0',
            cursor: 'help',
            transition: 'all 0.2s ease'
          }}
          title={`[${match.vector}] ${match.explanation}`}
        >
          {matchedText}
        </span>
      );
      lastIdx = match.end;
    });

    if (lastIdx < inputText.length) {
      resultElements.push(inputText.substring(lastIdx));
    }

    return resultElements;
  };

  const getVerdictInfo = (score: number) => {
    if (score >= 70) {
      return {
        label: 'AI Generated',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.05)',
        border: 'rgba(239, 68, 68, 0.15)',
        icon: AlertCircle
      };
    } else if (score >= 40) {
      return {
        label: 'Likely AI / Mixed',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.05)',
        border: 'rgba(245, 158, 11, 0.15)',
        icon: AlertTriangle
      };
    } else {
      return {
        label: 'Human Written',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.05)',
        border: 'rgba(34, 197, 94, 0.15)',
        icon: CheckCircle2
      };
    }
  };

  const getMetricDescription = (label: string) => {
    switch (label.toLowerCase()) {
      case 'perplexity':
        return 'Measures the predictability of word choices. High perplexity indicates more natural, human-like word selection.';
      case 'burstiness':
        return 'Measures variance in sentence lengths and structures. Humans write with high burstiness, while AI tends to be uniform.';
      case 'readability':
        return 'Analyzes writing style complexity. Natural, well-paced readability scores indicate human authorship.';
      case 'vocabulary':
        return 'Evaluates lexical diversity and richness. Diverse vocabulary choices are typical of human writing.';
      case 'simplicity':
        return 'Assesses structural simpleness. Human text has natural depth, whereas AI text is often overly simplistic.';
      case 'repetition':
        return 'Tracks phrase and pattern repetition. Lower repetition rates correlate with human writing.';
      default:
        return '';
    }
  };

  const ScanIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M3 17v2a2 2 0 0 1 2 2h2" />
    </svg>
  );


  const editorCard = (
    <div id="workspace-editor" className="glass-card" style={{ 
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '24px',
      padding: '1.75rem',
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.02)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '280px'
    }}>
      {/* Text Area Content Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        {detectionScore !== null && detectionPatterns && detectionPatterns.length > 0 ? (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
            <button 
              onClick={() => setEditorViewMode('edit')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: editorViewMode === 'edit' ? '#ffffff' : 'transparent',
                color: editorViewMode === 'edit' ? '#0f172a' : '#64748b',
                border: 'none',
                cursor: 'pointer',
                boxShadow: editorViewMode === 'edit' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              Edit Text
            </button>
            <button 
              onClick={() => setEditorViewMode('highlight')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: editorViewMode === 'highlight' ? '#ffffff' : 'transparent',
                color: editorViewMode === 'highlight' ? '#0f172a' : '#64748b',
                border: 'none',
                cursor: 'pointer',
                boxShadow: editorViewMode === 'highlight' ? '0 1px 3px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              AI Highlights
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.8rem', color: '#0f172a', fontWeight: 700, letterSpacing: '0.02em' }}>
              Try Our AI Detector
            </span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
            {wordCount} words
          </span>
          {inputText && (
            <button
              onClick={handleClear}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.2rem',
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Examples Row */}
      {editorViewMode === 'edit' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Try:</span>
          {[
            { label: 'AI Blog Draft', text: "In today's fast-paced digital era, content creation is transforming at an unprecedented pace. It is important to note that artificial intelligence has become a vital tool for writers seeking to optimize their workflow. Furthermore, by automating mundane drafting tasks, creators can focus on higher-level strategic planning. In conclusion, embracing these cutting-edge technologies is not merely an option, but a absolute necessity for success in today's highly competitive online landscape." },
            { label: 'AI College Essay', text: "Throughout history, the transition from agricultural economies to industrial cities has had a profound impact on social structures. Moreover, historical evidence clearly demonstrates that urban migrations reshaped family dynamics and class relations. It is crucial to analyze how these shifts occurred to understand contemporary labor movements. Ultimately, the legacy of the Industrial Revolution continues to influence modern socio-economic systems worldwide." },
            { label: 'AI Marketing Pitch', text: "I hope this email finds you well. In today's rapidly changing market, finding qualified leads can be a daunting task. Furthermore, manual outreach requires significant time and energy. That is why our cutting-edge platform is designed to streamline your business operations and maximize your sales potential. Please let me know if you would be open to a brief 10-minute call next Tuesday to discuss how we can help you scale." }
          ].map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setInputText(ex.text);
                setDetectionScore(null);
                setEditorViewMode('edit');
              }}
              style={{
                background: '#f1f5f9',
                border: 'none',
                padding: '0.25rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: '#475569',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            >
              {ex.label}
            </button>
          ))}
        </div>
      )}

      {/* Textarea Input/Highlight Panel */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        {editorViewMode === 'highlight' && detectionScore !== null && detectionPatterns && detectionPatterns.length > 0 ? (
          <div 
            style={{ 
              width: '100%',
              minHeight: '160px',
              height: '200px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              padding: '1rem',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: '1.65',
              color: '#0f172a',
              outline: 'none',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              textAlign: 'left'
            }}
          >
            {renderHighlightedText()}
          </div>
        ) : (
          <textarea 
            style={{ 
              width: '100%',
              minHeight: '160px',
              height: '200px',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              padding: '1rem',
              fontFamily: 'inherit',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              color: '#0f172a',
              outline: 'none',
              resize: 'none',
              transition: 'border-color 0.2s'
            }}
            placeholder="Paste your content here to check AI risk percentage..."
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (detectionScore !== null) {
                setDetectionScore(null);
                setEditorViewMode('edit');
              }
            }}
            disabled={detecting}
          />
        )}
      </div>

      {/* Stats Footer bar & Action Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={handleDetect}
            disabled={detecting || wordCount === 0}
            style={{
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              padding: '0.65rem 1.25rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: wordCount === 0 ? 'not-allowed' : 'pointer',
              opacity: wordCount === 0 ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { if (wordCount > 0) e.currentTarget.style.background = '#f8fafc'; }}
            onMouseOut={(e) => { if (wordCount > 0) e.currentTarget.style.background = '#ffffff'; }}
          >
            {detecting ? (
              <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px', borderLeftColor: '#0f172a', margin: 0 }}></span>
            ) : (
              <>
                <ScanIcon size={14} /> Detect AI
              </>
            )}
          </button>

          <button 
            onClick={handleHumanizeClick}
            style={{
              background: '#00a2ff',
              color: '#ffffff',
              border: 'none',
              padding: '0.65rem 1.5rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 10px rgba(0, 162, 255, 0.2)',
              transition: 'opacity 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.opacity = '0.95'}
            onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
          >
            <Sparkles size={14} /> Humanize
          </button>
        </div>
      </div>

      {/* AI Generated Sentences List with slide transition */}
      <div style={{
        maxHeight: (detectionScore !== null && detectionPatterns && detectionPatterns.length > 0) ? '300px' : '0px',
        opacity: (detectionScore !== null && detectionPatterns && detectionPatterns.length > 0) ? 1 : 0,
        overflow: 'hidden',
        marginTop: (detectionScore !== null && detectionPatterns && detectionPatterns.length > 0) ? '1.5rem' : '0px',
        paddingTop: (detectionScore !== null && detectionPatterns && detectionPatterns.length > 0) ? '1.25rem' : '0px',
        borderTop: (detectionScore !== null && detectionPatterns && detectionPatterns.length > 0) ? '1px dashed #e2e8f0' : 'none',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        textAlign: 'left'
      }}>
        <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', marginTop: 0 }}>
          <AlertCircle size={15} style={{ color: '#ef4444' }} /> AI-Generated Text Highlights
        </h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {(detectionPatterns || []).map((pat, idx) => (
            <div 
              key={`pat-${idx}`} 
              style={{ 
                background: 'rgba(239, 68, 68, 0.03)', 
                borderLeft: '3px solid #ef4444', 
                padding: '0.75rem', 
                borderRadius: '0 8px 8px 0',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', lineHeight: '1.4' }}>
                "{pat.quote}"
              </div>
              <div style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: '1.3' }}>
                <strong style={{ color: '#ef4444' }}>Explanation:</strong> {pat.explanation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const resultsCard = (
    <div className="glass-card" style={{ 
      background: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      borderRadius: '24px',
      padding: '1.25rem 1rem',
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.02)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.06)', paddingBottom: '0.5rem' }}>
        <ScanIcon size={16} />
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>AI Detection Results</h4>
      </div>

      {/* Speedometer gauge & Verdict */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', padding: '0.25rem 0' }}>
        {(() => {
          const hasScore = detectionScore !== null;
          const scoreValue = hasScore ? (detectionScore as number) : 0;
          const verdictInfo = hasScore ? getVerdictInfo(scoreValue) : {
            label: 'Not Scanned',
            color: '#64748b',
            bg: '#f1f5f9',
            border: '#cbd5e1',
            icon: Info
          };
          const VerdictIcon = verdictInfo.icon;
          
          return (
            <>
              {/* SVG Full Circle Gauge in dark blue and red */}
              <div style={{ position: 'relative', width: '110px', height: '110px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '0.75rem' }}>
                <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={hasScore ? (251.2 * (1 - scoreValue / 100)) : 251.2}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: '#1e3a8a',
                  fontFamily: 'var(--font-sans)',
                  lineHeight: 1
                }}>
                  {hasScore ? `${scoreValue}%` : '--'}
                </div>
              </div>

              {/* Threat Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: verdictInfo.bg,
                border: `1px solid ${verdictInfo.border}`,
                color: verdictInfo.color,
                padding: '0.45rem 1.15rem',
                borderRadius: '9999px',
                fontWeight: 600,
                fontSize: '0.85rem',
                marginTop: '0.25rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)'
              }}>
                <VerdictIcon size={14} />
                <span>{verdictInfo.label}</span>
              </div>

              {/* Collapsible trigger */}
              {hasScore && (
                <>
                  <div style={{ width: '100%', height: '1px', background: 'rgba(0, 0, 0, 0.06)', margin: '1.25rem 0 0.5rem 0' }} />
                  <div 
                    onClick={() => setShowDetailedMetrics(!showDetailedMetrics)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      cursor: 'pointer',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      userSelect: 'none',
                      padding: '0.4rem',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {showDetailedMetrics ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    <span>View detailed metrics</span>
                  </div>

                  {showDetailedMetrics && detectionMetrics && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem 1.25rem',
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0 0.25rem',
                      textAlign: 'left'
                    }}>
                      {detectionMetrics.map((metric) => {
                        const isDanger = metric.color === 'red';
                        const metricColor = isDanger ? '#ef4444' : '#22c55e';
                        return (
                          <div key={metric.label} style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#64748b' }}>
                                {metric.label}
                                <span title={getMetricDescription(metric.label)} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
                                  <Info size={12} style={{ opacity: 0.6 }} />
                                </span>
                              </span>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{metric.value}</span>
                            </div>
                            <div style={{ width: '100%', height: '5px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  width: `${metric.value}%`, 
                                  height: '100%', 
                                  background: metricColor, 
                                  borderRadius: '3px',
                                  transition: 'width 0.8s ease-out'
                                }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );

  return (
    <div style={{
      background: `
        radial-gradient(at top left, rgba(0, 162, 255, 0.04) 0%, transparent 40%), 
        radial-gradient(at top right, rgba(0, 162, 255, 0.03) 0%, transparent 40%), 
        radial-gradient(at bottom, rgba(0, 162, 255, 0.05) 0%, transparent 100%), 
        linear-gradient(to right, rgba(0, 162, 255, 0.04) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 162, 255, 0.04) 1px, transparent 1px),
        #f8fafc
      `,
      backgroundSize: '100% 100%, 100% 100%, 100% 100%, 24px 24px, 24px 24px',
      color: '#0f172a',
      minHeight: '100vh',
      fontFamily: 'var(--font-sans)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>

      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2rem',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontWeight: 800, 
                fontSize: '1.75rem', 
                color: '#0f172a',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>Content</span>
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontWeight: 600, 
                fontSize: '0.65rem', 
                color: '#64748b',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginTop: '0.2rem'
              }}>Humanizer</span>
            </div>
          </Link>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }} className="desktop-only">
                Logged in as <strong>{user.email}</strong> ({user.credits} Credits)
              </span>
              <Link to="/dashboard/playground" className="btn-primary" style={{ textDecoration: 'none', background: '#00a2ff', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '9999px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content Layout */}
      <main style={{ 
        height: 'calc(100vh - 80px)', 
        minHeight: '680px',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        boxSizing: 'border-box',
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,162,255,0.06) 0%, rgba(0,162,255,0) 70%)',
          left: '-5%',
          top: '5%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,58,138,0.04) 0%, rgba(30,58,138,0) 70%)',
          right: '5%',
          bottom: '5%',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <style>{`
          @media (max-width: 1100px) {
            .landing-container {
              flex-direction: column !important;
              gap: 2.5rem !important;
              padding-top: 1.5rem !important;
            }
            .hero-left-section {
              max-width: 100% !important;
              flex: none !important;
              text-align: center !important;
              align-items: center !important;
            }
            .hero-left-section h1 {
              font-size: 3rem !important;
              text-align: center !important;
            }
            .hero-left-section p {
              text-align: center !important;
            }
            .workspace-right-section {
              width: 100% !important;
              flex-direction: column !important;
            }
            .workspace-right-section > div {
              width: 100% !important;
              flex: none !important;
            }
          }
        `}</style>

        {/* Side-by-side Layout Container */}
        <div style={{
          display: 'flex',
          gap: '4rem',
          maxWidth: '100%',
          width: '100%',
          margin: '0 auto',
          padding: '0 6%',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }} className="landing-container">

          {/* Div 1: Left (Hero text) */}
          <div className="hero-left-section" style={{
            flex: '0 0 520px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '1.75rem',
            textAlign: 'left'
          }}>
            <h1 style={{
              fontSize: '4.5rem',
              fontWeight: 900,
              lineHeight: 1.05,
              fontFamily: 'var(--font-sans)',
              letterSpacing: '-0.03em',
              margin: 0
            }}>
              <span style={{ color: '#00a2ff' }}>Content</span><br />
              <span style={{ color: '#1e3a8a' }}>Humanizer</span>
            </h1>
            <p style={{
              color: '#475569',
              fontSize: '1.15rem',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '460px'
            }}>
              Turn your machine-generated drafts into natural, completely undetectable writing that bypasses all AI detectors.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
              {!user && (
                <button 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.75rem',
                    height: '48px',
                    padding: '0 1.5rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '9999px',
                    color: '#1e293b',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                  }}
                  disabled={authLoading}
                >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            )}
            </div>
          </div>

          {/* Div 2: Right (Workspace: Editor & Results) */}
          <div className="workspace-right-section" style={{
            flex: 1,
            display: 'flex',
            gap: '2rem',
            alignItems: 'start',
            width: '100%',
            minWidth: 0
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {editorCard}
            </div>
            <div style={{ 
              flex: detectionScore !== null ? '0 0 290px' : '0 0 0px', 
              width: detectionScore !== null ? '290px' : '0px',
              opacity: detectionScore !== null ? 1 : 0,
              marginLeft: detectionScore !== null ? '0px' : '-2rem',
              overflow: 'hidden',
              visibility: detectionScore !== null ? 'visible' : 'hidden',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              <div style={{ width: '290px' }}>
                {resultsCard}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Toast Notification (Top Right) */}
        {detectionError && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: 'rgba(254, 242, 242, 0.95)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <style>{`
              @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
              }
            `}</style>
            <ShieldOff size={22} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
            <div style={{ textAlign: 'left', flexGrow: 1, paddingRight: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#991b1b' }}>Detection Service Offline</h4>
              <p style={{ color: '#7f1d1d', fontSize: '0.8rem', lineHeight: '1.4', margin: '0.3rem 0 0' }}>
                Could not reach the detection backend. Free scans require the gateway service to be reachable.
              </p>
            </div>
            <button 
              onClick={() => setDetectionError(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#991b1b',
                cursor: 'pointer',
                opacity: 0.7,
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </main>

      {/* FEATURES SECTION */}
      <section style={{
        width: '100%',
        padding: '6rem 2rem',
        boxSizing: 'border-box',
        background: 'transparent',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#1e3a8a',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '-0.03em',
            marginBottom: '1rem'
          }}>
            Everything You Need to <span style={{ color: '#00a2ff' }}>Write Naturally</span>
          </h2>
          <p style={{
            color: '#475569',
            fontSize: '1.125rem',
            maxWidth: '680px',
            margin: '0 auto 4rem auto',
            lineHeight: 1.6
          }}>
            Create authentic humanized content that builds reader trust, preserves your search rankings, and bypasses machine signatures.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {featuresList.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={idx}
                  className="glass-card"
                  style={{
                    background: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                    borderRadius: '20px',
                    padding: '2.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '1.25rem',
                    transition: 'all 0.3s ease',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `rgba(${feat.color === '#00a2ff' ? '0, 162, 255' : '30, 58, 138'}, 0.08)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feat.color
                  }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>
                      {feat.title}
                    </h4>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', margin: 0 }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* HOW WE MAKE IT HUMAN (11-AGENT PIPELINE) */}
      <section style={{
        width: '100%',
        padding: '6rem 2rem',
        boxSizing: 'border-box',
        borderTop: '1px solid #e2e8f0',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 162, 255, 0.01) 50%, rgba(255, 255, 255, 0) 100%)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          display: 'flex', 
          gap: '4rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          boxSizing: 'border-box'
        }}>
          {/* Left info column */}
          <div style={{ flex: '1 1 500px', textAlign: 'left' }}>

            <h2 style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: '#1e3a8a',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              margin: '0 0 1.5rem 0'
            }}>
              The 11-Step <br />
              <span style={{ color: '#00a2ff' }}>Editorial</span> Flow
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Instead of just swapping words with cheap synonyms (which reads awkwardly and fails AI scans), Content Humanizer guides your draft through a careful 11-step rewriting process.
            </p>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Just like a professional team of human editors, our system analyzes tone, rewrites robotic phrasing, overlays your personal style DNA, and performs quality audits before delivery.
            </p>
                      </div>

          {/* Right column: 11-Step Timeline pipeline */}
          <div style={{ 
            flex: '1.2 1 600px', 
            position: 'relative', 
            minWidth: '320px',
            height: '520px',
            boxSizing: 'border-box'
          }}>
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 9999px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
              }
            `}</style>
            
            {/* Scrollable Container */}
            <div 
              className="custom-scrollbar"
              style={{
                height: '100%',
                overflowY: 'auto',
                paddingRight: '1rem',
                paddingLeft: '0.5rem',
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                boxSizing: 'border-box'
              }}
            >
              {/* Relative wrapper for the timeline and contents to resolve absolute height correctly */}
              <div style={{ position: 'relative', width: '100%' }}>
                {/* Vertical timeline line */}
                <div style={{
                  position: 'absolute',
                  left: '20px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  background: 'linear-gradient(to bottom, #00a2ff 0%, #1e3a8a 100%)',
                  zIndex: 0
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                { 
                  title: 'Intent Extraction', 
                  tag: 'ANALYSIS', 
                  tagColor: '#00a2ff', 
                  tagBg: 'rgba(0, 162, 255, 0.08)',
                  desc: 'Profiles target audience, purpose, and tone fingerprint. Identifies what expert insights are needed to bridge the voice gap.' 
                },
                { 
                  title: 'AI Pattern Detection', 
                  tag: 'ANALYSIS', 
                  tagColor: '#00a2ff', 
                  tagBg: 'rgba(0, 162, 255, 0.08)',
                  desc: 'Flags perplexity uniformity, burstiness failures, and structural tells. Establishes baseline AI-written probability score.' 
                },
                { 
                  title: 'Humanization Strategy', 
                  tag: 'ANALYSIS', 
                  tagColor: '#00a2ff', 
                  tagBg: 'rgba(0, 162, 255, 0.08)',
                  desc: 'Constructs a specialized strategy targeting detected statistical patterns to make the final rewrite blend in naturally.' 
                },
                { 
                  title: 'Linguistic Humanizer', 
                  tag: 'TRANSFORMATION', 
                  tagColor: '#2563eb', 
                  tagBg: 'rgba(37, 99, 235, 0.08)',
                  desc: 'Rewrites sentences for sentence length variations and syntax alterations, breaking strict mathematical structures.' 
                },
                { 
                  title: 'Style Personalization', 
                  tag: 'TRANSFORMATION', 
                  tagColor: '#2563eb', 
                  tagBg: 'rgba(37, 99, 235, 0.08)',
                  desc: 'Injects user-specific Voice Vault writing profiles, applying your unique style DNA and expressions.' 
                },
                { 
                  title: 'Perplexity Adjustment', 
                  tag: 'TRANSFORMATION', 
                  tagColor: '#2563eb', 
                  tagBg: 'rgba(37, 99, 235, 0.08)',
                  desc: 'Optimizes word choice frequency using semantic variations to eliminate predictable machine vocabulary.' 
                },
                { 
                  title: 'Burstiness Balancing', 
                  tag: 'TRANSFORMATION', 
                  tagColor: '#2563eb', 
                  tagBg: 'rgba(37, 99, 235, 0.08)',
                  desc: 'Alters paragraph flow and sentence lengths dynamically to replicate natural human typing cadences.' 
                },
                { 
                  title: 'Grammar & Flow Polish', 
                  tag: 'TRANSFORMATION', 
                  tagColor: '#2563eb', 
                  tagBg: 'rgba(37, 99, 235, 0.08)',
                  desc: 'Cleans up transitions, refines passive voice constructions, and ensures absolute readability.' 
                },
                { 
                  title: 'Machine Evasion Scan', 
                  tag: 'QUALITY CONTROL', 
                  tagColor: '#1e3a8a', 
                  tagBg: 'rgba(30, 58, 138, 0.08)',
                  desc: 'Simulates immediate detection tests against major AI scanners to catch remaining robotic markers.' 
                },
                { 
                  title: 'SEO & Fact Verification', 
                  tag: 'QUALITY CONTROL', 
                  tagColor: '#1e3a8a', 
                  tagBg: 'rgba(30, 58, 138, 0.08)',
                  desc: 'Ensures key search terms, brand names, and facts remain perfectly intact during rewrite.' 
                },
                { 
                  title: 'Undetectable Seal', 
                  tag: 'QUALITY CONTROL', 
                  tagColor: '#1e3a8a', 
                  tagBg: 'rgba(30, 58, 138, 0.08)',
                  desc: 'Applies final verification and outputs a high-fidelity human score report.' 
                }
              ].map((step, idx) => (
                <div 
                  key={idx}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    zIndex: 1
                  }}
                >
                  {/* Circular step badge directly on timeline */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: `2px solid ${idx === 10 ? '#1e3a8a' : idx < 3 ? '#00a2ff' : '#2563eb'}`,
                    color: idx < 3 ? '#00a2ff' : idx < 8 ? '#2563eb' : '#1e3a8a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    boxSizing: 'border-box'
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  {/* Visual card content */}
                  <div style={{
                    flexGrow: 1,
                    background: '#ffffff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-sans)' }}>
                        {step.title}
                      </h4>
                      <span style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        color: step.tagColor,
                        background: step.tagBg,
                        letterSpacing: '0.05em'
                      }}>
                        {step.tag}
                      </span>
                    </div>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* PLATFORM SYNERGY */}
      <section style={{
        width: '100%',
        padding: '6rem 2rem',
        boxSizing: 'border-box',
        borderTop: '1px solid #e2e8f0',
        background: 'transparent'
      }}>
        <style>{`
          @keyframes pulse-live {
            0% {
              box-shadow: 0 0 0 0 rgba(0, 162, 255, 0.7);
            }
            70% {
              box-shadow: 0 0 0 6px rgba(0, 162, 255, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(0, 162, 255, 0);
            }
          }
        `}</style>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap-reverse' }}>
          
          {/* Left Visual Card */}
          <div style={{ 
            flex: '1 1 450px', 
            position: 'relative', 
            height: '420px', 
            background: 'linear-gradient(135deg, #070a13 0%, #0f172a 100%)', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            padding: '2rem', 
            boxSizing: 'border-box', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            color: '#ffffff',
            boxShadow: '0 20px 40px -15px rgba(7, 10, 19, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            {/* Widget Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.08em' }}>GEO DASHBOARD</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, letterSpacing: '0.05em' }}>ALL SYSTEMS OPERATIONAL</span>
                <span style={{ 
                  display: 'inline-flex', 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: '#10b981',
                  boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)',
                  animation: 'pulse-live 2s infinite'
                }} />
              </div>
            </div>
            
            {/* Widget Main Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Brand: <span style={{ color: '#00a2ff' }}>humanizer.ai</span></div>
              
              <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>SHARE OF VOICE</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>24.8%</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>+3.2%</span>
                  </div>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>CITATION RATE</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>15.2%</span>
                    <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700 }}>+1.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Visibility Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'left', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>VISIBILITY BY AI MODEL</div>
              {[
                { name: 'ChatGPT-4o', pct: 35, color: '#10a37f' },
                { name: 'Google Gemini', pct: 42, color: '#4285f4' },
                { name: 'Claude 3.5 Sonnet', pct: 28, color: '#d97706' },
                { name: 'Perplexity AI', pct: 51, color: '#00a2ff' }
              ].map((model, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ width: '110px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{model.name}</span>
                  <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ width: `${model.pct}%`, height: '100%', background: model.color, borderRadius: '9999px' }} />
                  </div>
                  <span style={{ width: '32px', fontSize: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>{model.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right info column */}
          <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h2 style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              color: '#1e3a8a',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 1.5rem 0'
            }}>
              Built for the <br />
              <span style={{ color: '#00a2ff' }}>GEO</span> Suite
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              GEO integrates seamlessly with your existing content generation pipelines. Egress clean, optimized drafts straight to search platforms, blogs, or internal content systems without leaving a trace of mechanical footprint.
            </p>
            <button 
              onClick={() => window.open('https://humanizer.ai', '_blank', 'noopener,noreferrer')}
              style={{
                background: '#00a2ff',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 2rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 162, 255, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 162, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 162, 255, 0.3)';
              }}
            >
              Explore GEO Suite
            </button>
          </div>
        </div>
      </section>

      {/* DEVELOPER API & AGENT SKILLS */}
      <section style={{
        width: '100%',
        padding: '6rem 2rem',
        boxSizing: 'border-box',
        borderTop: '1px solid #e2e8f0',
        background: 'transparent'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '4rem', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Left Column Info */}
          <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
            <h2 style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              color: '#1e3a8a',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: '0 0 1.5rem 0'
            }}>
              Integrate With Your Workflow
            </h2>
            <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Build powerful humanization into your apps, AI agents, and content pipelines. Use our REST API to connect your voice vault personas directly to your publishing workflows.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                "Trained Voice Sync: Call custom styles trained in your Voice Vault programmatically.",
                "Multi-Agent Execution: Trigger all 11 editing agents through a single API call."
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                  <Check size={18} style={{ color: '#00a2ff', flexShrink: 0, marginTop: '0.15rem' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => navigate('/login')}
                style={{
                  background: '#00a2ff',
                  color: '#ffffff',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 162, 255, 0.25)',
                  transition: 'all 0.2s'
                }}
              >
                Get API Access →
              </button>
            </div>
          </div>

          {/* Right Column: Code Terminal */}
          <div style={{
            flex: '1 1 450px',
            background: '#06090f',
            border: '1px solid #1e293b',
            borderRadius: '24px',
            padding: '2rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: '1.7',
            textAlign: 'left',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            color: '#cbd5e1'
          }}>
            <div style={{ color: '#475569', marginBottom: '0.5rem' }}># Retrieve trained voice styles from your vault</div>
            <div style={{ marginBottom: '1.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              <span style={{ color: '#00a2ff' }}>curl</span> -X GET https://api.humanizer.ai/api/v1/voice-vault \<br />
              &nbsp;&nbsp;-H <span style={{ color: '#38bdf8' }}>"Authorization: Bearer humanizer_live_your_api_key"</span>
            </div>
            
            <div style={{ color: '#475569', marginBottom: '0.5rem' }}># Humanize drafts using a custom voice ID</div>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              <span style={{ color: '#00a2ff' }}>curl</span> -X POST https://api.humanizer.ai/api/v1/humanize \<br />
              &nbsp;&nbsp;-H <span style={{ color: '#38bdf8' }}>"Authorization: Bearer humanizer_live_your_api_key"</span> \<br />
              &nbsp;&nbsp;-H <span style={{ color: '#38bdf8' }}>"Content-Type: application/json"</span> \<br />
              &nbsp;&nbsp;-d <span style={{ color: '#38bdf8' }}>{"'{\"text\": \"AI writing...\", \"voice_profile_id\": \"vp_your_voice_id\"}'"}</span>
            </div>
          </div>

        </div>
      </section>

      {/* PRICING */}
      <section style={{
        width: '100%',
        padding: '6rem 2rem',
        boxSizing: 'border-box',
        borderTop: '1px solid #e2e8f0',
        background: 'transparent',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#1e3a8a',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '-0.03em',
            marginBottom: '1rem'
          }}>
            Transparent Credit <span style={{ color: '#00a2ff' }}>Pricing</span>
          </h2>
          <p style={{
            color: '#475569',
            fontSize: '1.125rem',
            maxWidth: '680px',
            margin: '0 auto 4rem auto',
            lineHeight: 1.6
          }}>
            Choose the perfect plan for your humanization volume needs.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {pricingPlans.map((pkg, idx) => (
              <div 
                key={idx}
                style={{
                  background: '#ffffff',
                  border: pkg.highlighted ? '2px solid #00a2ff' : '1px solid #cbd5e1',
                  borderRadius: '24px',
                  padding: '3rem 2.25rem',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  boxShadow: pkg.highlighted ? '0 10px 25px -5px rgba(0, 162, 255, 0.1)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
              >
                {pkg.highlighted && (
                  <span style={{
                    position: 'absolute',
                    top: '1.25rem',
                    right: '1.25rem',
                    background: 'rgba(0, 162, 255, 0.1)',
                    color: '#00a2ff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Popular
                  </span>
                )}
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{pkg.name}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem 0' }}>{pkg.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '3rem', fontWeight: 800, color: '#1e3a8a' }}>{pkg.price}</span>
                    <span style={{ color: '#64748b', fontSize: '1rem' }}>{pkg.period}</span>
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
                    {pkg.credits} Standard Credits
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
                        <Check size={16} style={{ color: '#00a2ff' }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  style={{
                    width: '100%',
                    background: pkg.highlighted ? '#00a2ff' : 'transparent',
                    color: pkg.highlighted ? '#ffffff' : '#00a2ff',
                    border: pkg.highlighted ? 'none' : '1px solid #00a2ff',
                    padding: '0.85rem 0',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section style={{
        width: '100%',
        padding: '10.5rem 2rem',
        background: 'transparent',
        boxSizing: 'border-box',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects inside section */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,162,255,0.05) 0%, rgba(0,162,255,0) 70%)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: '3rem',
            fontWeight: 800,
            color: '#1e3a8a',
            fontFamily: 'var(--font-sans)',
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            lineHeight: 1.15
          }}>
            Ready to Humanize Your Content?
          </h2>
          <p style={{
            color: '#475569',
            fontSize: '1.125rem',
            marginBottom: '2.5rem',
            lineHeight: 1.6
          }}>
            Bypass AI detection, preserve your SEO keyword authority, and craft custom author personas in seconds.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{
                background: '#00a2ff',
                color: '#ffffff',
                border: 'none',
                padding: '0.85rem 2.25rem',
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: '9999px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 162, 255, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 162, 255, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 162, 255, 0.3)';
              }}
            >
              Sign Up Now
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: '#0f172a',
        color: '#ffffff',
        padding: '4rem 2rem',
        boxSizing: 'border-box',
        borderTop: '1px solid #1e293b'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Content Humanizer</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>Natural AI-Bypass Platform</div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '2rem auto 0 auto', borderTop: '1px solid #1e293b', paddingTop: '2rem', fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>© 2026 Content Humanizer. All rights reserved.</span>
        </div>
      </footer>


      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem'
        }}
        onClick={() => setShowAuthModal(false)}
        >
          {/* Modal Container */}
          <div style={{
            display: 'flex',
            width: '100%',
            maxWidth: '900px',
            background: '#ffffff',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            maxHeight: '90vh',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()} // Prevent close on card click
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <X size={16} />
            </button>

            {/* Left Side: Branding (deep navy banner) */}
            <div style={{
              flex: 1.1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '3rem',
              background: '#0f172a',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="desktop-only"
            >
              {/* Background gradient blob */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -55%)',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(0, 162, 255, 0.15) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '-0.03em',
                  margin: 0
                }}>
                  <span style={{ color: '#00a2ff' }}>Content</span><br />
                  <span style={{ color: '#ffffff' }}>Humanizer</span>
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, margin: '0.5rem 0 0' }}>
                  The premium AI content detection evasion pipeline. Transform machine-generated text into natural, undetectable human-like content with enterprise-grade precision.
                </p>
              </div>
            </div>

            {/* Right Side: Auth Forms */}
            <div style={{
              flex: 1,
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: '#ffffff',
              color: '#0f172a',
              overflowY: 'auto'
            }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
                  Unlock Humanization
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  Sign in or register to bypass AI detectors.
                </p>
              </div>

              {/* Tab Selector */}
              <div style={{ 
                display: 'flex', 
                background: '#f1f5f9', 
                padding: '0.25rem', 
                borderRadius: '8px', 
                marginBottom: '1.5rem',
                border: '1px solid #e2e8f0'
              }}>
                <button 
                  type="button"
                  onClick={() => { setIsSignUp(false); setAuthError(null); }}
                  style={{
                    flex: 1,
                    background: !isSignUp ? '#ffffff' : 'transparent',
                    border: 'none',
                    color: !isSignUp ? '#0f172a' : '#64748b',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    boxShadow: !isSignUp ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsSignUp(true); setAuthError(null); }}
                  style={{
                    flex: 1,
                    background: isSignUp ? '#ffffff' : 'transparent',
                    border: 'none',
                    color: isSignUp ? '#0f172a' : '#64748b',
                    padding: '0.45rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    boxShadow: isSignUp ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                  }}
                >
                  Register
                </button>
              </div>

              {/* Error Message */}
              {authError && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  color: '#991b1b',
                  fontSize: '0.8rem',
                  textAlign: 'left'
                }}>
                  <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>{authError}</div>
                </div>
              )}

              {/* Form Input fields */}
              <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      style={{ 
                        width: '100%', 
                        padding: '0.65rem 1rem 0.65rem 2.25rem', 
                        background: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px',
                        color: '#0f172a',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }} 
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={authLoading}
                    />
                    <Mail size={14} style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      style={{ 
                        width: '100%', 
                        padding: '0.65rem 1rem 0.65rem 2.25rem', 
                        background: '#ffffff', 
                        border: '1px solid #cbd5e1', 
                        borderRadius: '8px',
                        color: '#0f172a',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={authLoading}
                    />
                    <Lock size={14} style={{ 
                      position: 'absolute', 
                      left: '0.75rem', 
                      top: '50%', 
                      transform: 'translateY(-50%)',
                      color: '#94a3b8'
                    }} />
                  </div>
                </div>

                {isSignUp && (
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ color: '#334155', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem', display: 'block' }}>Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="password" 
                        style={{ 
                          width: '100%', 
                          padding: '0.65rem 1rem 0.65rem 2.25rem', 
                          background: '#ffffff', 
                          border: '1px solid #cbd5e1', 
                          borderRadius: '8px',
                          color: '#0f172a',
                          fontSize: '0.9rem',
                          outline: 'none'
                        }} 
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={authLoading}
                      />
                      <Lock size={14} style={{ 
                        position: 'absolute', 
                        left: '0.75rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: '#94a3b8'
                      }} />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    marginTop: '0.5rem', 
                    height: '42px',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.2s',
                    boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.15)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  disabled={authLoading}
                >
                  {authLoading ? (
                    <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderLeftColor: '#ffffff', margin: 0 }}></div>
                  ) : (
                    <>
                      {isSignUp ? (
                        <>Create Account <UserPlus size={14} /></>
                      ) : (
                        <>Sign In <LogIn size={14} /></>
                      )}
                    </>
                  )}
                </button>
              </form>

              {/* Separator */}
              <div style={{ margin: '1.25rem 0', textAlign: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: '1px',
                  background: '#e2e8f0',
                  zIndex: 1
                }}></div>
                <span style={{
                  background: '#ffffff',
                  padding: '0 0.5rem',
                  fontSize: '0.7rem',
                  color: '#64748b',
                  position: 'relative',
                  zIndex: 2,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  letterSpacing: '0.02em'
                }}>or continue with</span>
              </div>

              {/* Google Auth button */}
              <button 
                type="button" 
                onClick={handleGoogleSignIn}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem',
                  height: '42px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  color: '#334155',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                disabled={authLoading}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
                </svg>
                Google Sign-In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
