import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useLocation } from 'react-router-dom';
import { diffWords } from 'diff';
import { marked } from 'marked';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Info,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Trash2,
  RefreshCw,
  Scan,
  Plus,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';

const agentThoughts: Record<string, string> = {
  "Initial Adversarial Evaluator": "Performing baseline AI detection scan on original text to identify starting patterns and scores...",
  "Orchestrator & Planner": "Extracting target audience profile, tone fingerprint, and voice gap analysis to guide the humanization strategy...",
  "Sanitizer": "Scanning for AI fingerprints. Stripping robotic transitions, over-hedging, AI clichés, and converting formal language to contractions...",
  "Linguistic Humanizer": "Core rewrite in progress. Injecting human voice, natural rhythm, sentence variety, and conversational personality...",
  "Style & SEO Aligner": "Applying style personalization, authenticity polish, readability check, and SEO keyword preservation...",
  "Adversarial Evaluator": "Scoring quality metrics - human likeness, AI detection resistance, readability, SEO retention, and overall coherence...",
  "Revision Refiner": "Refining text layout based on evaluator feedback...",
  "Final Polish": "Refining text layout and performing final cleanup pass. Fixing formatting, double spaces, and broken punctuation..."
};

function ThoughtProcess({ text, active }: { text: string; active: boolean }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!active) {
      setDisplayedText(text);
      return;
    }
    
    setDisplayedText('');
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 12);
    
    return () => clearInterval(interval);
  }, [text, active]);

  return (
    <div style={{
      background: 'transparent',
      borderLeft: '2px solid #00a2ff',
      borderRadius: '4px',
      padding: '0.25rem 0 0.25rem 0.75rem',
      marginTop: '0.4rem',
      fontFamily: 'monospace',
      color: '#8892b0',
      lineHeight: '1.45',
      maxHeight: '100px',
      overflowY: 'auto'
    }}>
      <div style={{ color: '#00a2ff', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', marginBottom: '0.2rem', letterSpacing: '0.05em' }}>
        Thinking Process
      </div>
      {displayedText}
      {active && <span className="cursor" style={{ display: 'inline-block', width: '6px', height: '12px', background: '#00a2ff', marginLeft: '2px', animation: 'blink 1s infinite' }}></span>}
      <style>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function HighlightedText({ text, patterns, color }: { text: string; patterns: any[]; color: string }) {
  if (!patterns || patterns.length === 0) {
    return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
  }

  interface MatchRange {
    start: number;
    end: number;
    pattern: any;
  }
  const matches: MatchRange[] = [];

  patterns.forEach((pat) => {
    if (!pat.quote) return;
    let idx = text.indexOf(pat.quote);
    while (idx !== -1) {
      matches.push({
        start: idx,
        end: idx + pat.quote.length,
        pattern: pat
      });
      idx = text.indexOf(pat.quote, idx + 1);
    }
  });

  // Sort by start position
  matches.sort((a, b) => a.start - b.start || b.end - a.end);

  // Merge overlapping ranges
  const merged: MatchRange[] = [];
  matches.forEach((current) => {
    if (merged.length === 0) {
      merged.push(current);
    } else {
      const last = merged[merged.length - 1];
      if (current.start < last.end) {
        if (current.end > last.end) {
          last.end = current.end;
          if (last.pattern.explanation !== current.pattern.explanation) {
            last.pattern = {
              ...last.pattern,
              explanation: last.pattern.explanation + " | " + current.pattern.explanation,
              alternative: last.pattern.alternative || current.pattern.alternative
            };
          }
        }
      } else {
        merged.push(current);
      }
    }
  });

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  merged.forEach((range, idx) => {
    if (range.start > lastIndex) {
      elements.push(<span key={`text-${idx}`} dangerouslySetInnerHTML={{ __html: marked.parseInline(text.substring(lastIndex, range.start)) as string }} />);
    }

    const matchText = text.substring(range.start, range.end);
    elements.push(
      <span
        key={`match-${idx}`}
        className="highlighted-sentence-wrapper"
        style={{
          position: 'relative',
          backgroundColor: `${color}1A`,
          borderBottom: `2px dotted ${color}`,
          cursor: 'help',
          padding: '2px 0',
          borderRadius: '2px',
          display: 'inline',
        }}
      >
        <span dangerouslySetInnerHTML={{ __html: marked.parseInline(matchText) as string }} />
        <span
          className="highlighted-tooltip"
          style={{
            visibility: 'hidden',
            width: '260px',
            backgroundColor: '#1f2937',
            color: '#fff',
            textAlign: 'left',
            borderRadius: '6px',
            padding: '8px 10px',
            position: 'absolute',
            zIndex: 10,
            bottom: '125%',
            left: '50%',
            marginLeft: '-130px',
            opacity: 0,
            transition: 'opacity 0.2s',
            fontSize: '0.75rem',
            lineHeight: '1.4',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            whiteSpace: 'normal',
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '4px', color: '#f3f4f6' }}>AI Pattern Detected</div>
          <div>{range.pattern.explanation}</div>
          {range.pattern.alternative && !/^none needed$/i.test(range.pattern.alternative.trim()) && (
            <div style={{ marginTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '4px' }}>
              <span style={{ fontWeight: 700, color: '#34d399' }}>Try:</span> <span style={{ fontStyle: 'italic' }}>"{range.pattern.alternative}"</span>
            </div>
          )}
          <span style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            marginLeft: '-5px',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#1f2937 transparent transparent transparent'
          }}></span>
        </span>
      </span>
    );

    lastIndex = range.end;
  });

  if (lastIndex < text.length) {
    elements.push(<span key="text-end" dangerouslySetInnerHTML={{ __html: marked.parseInline(text.substring(lastIndex)) as string }} />);
  }

  return (
    <div className="markdown-rendered" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '0.95rem' }}>
      {elements}
      <style>{`
        .highlighted-sentence-wrapper:hover .highlighted-tooltip {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

export default function Playground() {
  const logEndRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const loadedInitialText = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { 
    user, 
    processingJob, 
    processingLogs, 
    currentOutput, 
    currentMetrics, 
    voiceProfiles,
    humanizeText,
    detectText,
    showToast,
    addCredits,
    clearPlayground,
    playgroundInputText,
    playgroundInputDetectionScore,
    playgroundInputDetectionPatterns,
    playgroundInputDetectionMetrics,
    playgroundOutputDetectionScore,
    playgroundOutputDetectionPatterns,
    playgroundOutputDetectionMetrics,
    playgroundEditorViewMode,
    playgroundActiveTab,
    playgroundOriginalViewMode
  } = useAppStore();

  const [mode, setMode] = useState('human');
  const [reflectionLevel, setReflectionLevel] = useState('advanced');
  const [activeMode, setActiveMode] = useState<'normal' | 'medium' | 'best' | 'bypass'>('medium');
  const [selectedVoiceId, setSelectedVoiceId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [purchasingPkgId, setPurchasingPkgId] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [showDetector, setShowDetector] = useState(false);

  // Setters using useAppStore.setState
  const inputText = playgroundInputText;
  const setInputText = (text: string) => useAppStore.setState({ playgroundInputText: text });
  
  const inputDetectionScore = playgroundInputDetectionScore;
  const setInputDetectionScore = (score: number | null) => useAppStore.setState({ playgroundInputDetectionScore: score });
  const inputDetectionPatterns = playgroundInputDetectionPatterns;
  const setInputDetectionPatterns = (patterns: any[] | null) => useAppStore.setState({ playgroundInputDetectionPatterns: patterns });
  const inputDetectionMetrics = playgroundInputDetectionMetrics;
  const setInputDetectionMetrics = (metrics: any[] | null) => useAppStore.setState({ playgroundInputDetectionMetrics: metrics });

  const outputDetectionScore = playgroundOutputDetectionScore;
  const setOutputDetectionScore = (score: number | null) => useAppStore.setState({ playgroundOutputDetectionScore: score });
  const outputDetectionPatterns = playgroundOutputDetectionPatterns;
  const setOutputDetectionPatterns = (patterns: any[] | null) => useAppStore.setState({ playgroundOutputDetectionPatterns: patterns });
  const outputDetectionMetrics = playgroundOutputDetectionMetrics;
  const setOutputDetectionMetrics = (metrics: any[] | null) => useAppStore.setState({ playgroundOutputDetectionMetrics: metrics });

  const editorViewMode = playgroundEditorViewMode;
  const setEditorViewMode = (mode: 'edit' | 'highlight') => useAppStore.setState({ playgroundEditorViewMode: mode });
  const activeTab = playgroundActiveTab;
  const setActiveTab = (tab: 'editor' | 'humanized') => useAppStore.setState({ playgroundActiveTab: tab });
  const originalViewMode = playgroundOriginalViewMode;
  const setOriginalViewMode = (mode: 'edit' | 'diff') => useAppStore.setState({ playgroundOriginalViewMode: mode });

  const leftScrollRef = useRef<HTMLDivElement | null>(null);
  const rightScrollRef = useRef<HTMLDivElement | null>(null);
  const isScrollingLeft = useRef(false);
  const isScrollingRight = useRef(false);

  const handleLeftScroll = () => {
    if (isScrollingRight.current) return;
    isScrollingLeft.current = true;
    if (leftScrollRef.current && rightScrollRef.current) {
      rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
    setTimeout(() => { isScrollingLeft.current = false; }, 50);
  };

  const handleRightScroll = () => {
    if (isScrollingLeft.current) return;
    isScrollingRight.current = true;
    if (leftScrollRef.current && rightScrollRef.current) {
      leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    }
    setTimeout(() => { isScrollingRight.current = false; }, 50);
  };

  // Dynamic variables resolved based on the active tab
  const currentDetectionScore = activeTab === 'humanized' ? outputDetectionScore : inputDetectionScore;
  const currentDetectionPatterns = activeTab === 'humanized' ? outputDetectionPatterns : inputDetectionPatterns;
  const currentDetectionMetrics = activeTab === 'humanized' ? outputDetectionMetrics : inputDetectionMetrics;

  // Sync route initial text
  useEffect(() => {
    if (!loadedInitialText.current) {
      const state = location.state as { initialText?: string; openBilling?: boolean } | null;
      if (state?.initialText) {
        setInputText(state.initialText);
      }
      if (state?.openBilling) {
        setShowBillingModal(true);
      }
      loadedInitialText.current = true;
    }
  }, [location.state]);

  // Automatically scan the humanized result when it changes
  // (Removed: Now handled natively by the backend pipeline and resumeTask)

  useEffect(() => {
    if (processingJob && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [processingLogs, processingJob]);



  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const characterCount = inputText.length;
  
  // Check if using custom keys
  const hasCustomKeys = !!(user?.geminiApiKey || user?.openaiApiKey || user?.openrouterApiKey);

  // Calculate multiplier
  const reflectionMultiplier = reflectionLevel === 'advanced' ? 1.5 : reflectionLevel === 'maximum' ? 2.0 : 1.0;
  const voiceMultiplier = selectedVoiceId ? 2.0 : 1.0;
  // Bypass mode gets an extra 1.5x on top (Agent 0 + max reflection + highest temp model)
  const bypassMultiplier = mode === 'bypass' ? 1.5 : 1.0;
  const costMultiplier = reflectionMultiplier * voiceMultiplier * bypassMultiplier;
  const estimatedCredits = hasCustomKeys ? 0 : Math.ceil(wordCount / 10) * costMultiplier;

  const handlePurchase = (pkgId: string, credits: number) => {
    setPurchasingPkgId(pkgId);
    const tier = pkgId === 'pkg-3' ? 'enterprise' : pkgId === 'pkg-2' ? 'professional' : 'starter';
    // Simulate stripe redirect & confirmation
    setTimeout(async () => {
      await addCredits(credits, tier);
      setPurchasingPkgId(null);
      showToast(`Payment successful! ${credits.toLocaleString()} credits added to your account.`, "success");
      setShowBillingModal(false);
    }, 1500);
  };

  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    if ((user?.credits || 0) < estimatedCredits) {
      showToast("Insufficient credits. Please top up using the payment portal.", "error");
      setShowBillingModal(true);
      return;
    }
    // Reset output detection states for the new run
    setOutputDetectionScore(null);
    setOutputDetectionPatterns(null);
    setOutputDetectionMetrics(null);
    
    // Auto-show detector for the original scan
    setShowDetector(true);
    setEditorViewMode('highlight');
    setActiveTab('editor');

    await humanizeText(inputText, mode, reflectionLevel, selectedVoiceId || undefined);
  };

  const handleDetect = async () => {
    const isHumanized = activeTab === 'humanized';
    const textToDetect = isHumanized ? currentOutput : inputText;
    if (!textToDetect.trim()) return;
    
    setDetecting(true);
    if (isHumanized) {
      setOutputDetectionScore(null);
      setOutputDetectionPatterns(null);
      setOutputDetectionMetrics(null);
    } else {
      setInputDetectionScore(null);
      setInputDetectionPatterns(null);
      setInputDetectionMetrics(null);
    }

    const score = await detectText(textToDetect);
    if (score === -1) {
      showToast("Could not reach the detection backend. Please ensure the backend is running and your API key is valid.", "error");
    } else {
      const storePatterns = useAppStore.getState().detectionPatterns;
      const storeMetrics = useAppStore.getState().detectionMetrics;

      if (isHumanized) {
        setOutputDetectionScore(score);
        setOutputDetectionPatterns(storePatterns);
        setOutputDetectionMetrics(storeMetrics);
      } else {
        setInputDetectionScore(score);
        setInputDetectionPatterns(storePatterns);
        setInputDetectionMetrics(storeMetrics);
        setEditorViewMode('highlight');
      }
    }
    setDetecting(false);
  };

  const handleClear = () => {
    setInputText('');
    setInputDetectionScore(null);
    setInputDetectionPatterns(null);
    setInputDetectionMetrics(null);
    setEditorViewMode('edit');
  };

  const getVerdictInfo = (score: number) => {
    if (score >= 70) {
      return {
        label: 'AI Generated',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.08)',
        border: 'rgba(239, 68, 68, 0.2)',
        icon: AlertCircle
      };
    } else if (score >= 40) {
      return {
        label: 'Likely AI / Mixed',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.08)',
        border: 'rgba(245, 158, 11, 0.2)',
        icon: AlertTriangle
      };
    } else {
      return {
        label: 'Human Written',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.08)',
        border: 'rgba(34, 197, 94, 0.2)',
        icon: CheckCircle2
      };
    }
  };

  const getMetricDescription = (label: string) => {
    switch (label.toLowerCase()) {
      case 'perplexity':
        return 'Measures the predictability of word choices. High perplexity indicates more natural, human-like word selection.';
      case 'burstiness':
        return 'Measures variance in sentence lengths and structures. Humans write with high burstiness (varying sentence lengths), while AI tends to be uniform.';
      case 'readability':
        return 'Analyzes writing style complexity. Natural, well-paced readability scores indicate human authorship.';
      case 'vocabulary':
        return 'Evaluates lexical diversity and richness. Diverse vocabulary choices are typical of human writing.';
      case 'simplicity':
        return 'Assesses structural simpleness. Human text has natural depth, whereas AI text is often overly simplistic or uniform.';
      case 'repetition':
        return 'Tracks phrase and pattern repetition. Lower repetition rates correlate with human writing.';
      default:
        return '';
    }
  };

  const [inputCopied, setInputCopied] = useState(false);

  const handleInputCopy = () => {
    navigator.clipboard.writeText(inputText);
    setInputCopied(true);
    setTimeout(() => setInputCopied(false), 2000);
  };

  const handleCopy = async () => {
    try {
      const html = await Promise.resolve(marked.parse(currentOutput));
      const text = currentOutput.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
      
      const blobHtml = new Blob([html as string], { type: 'text/html' });
      const blobText = new Blob([text], { type: 'text/plain' });
      const data = [new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
      })];
      await navigator.clipboard.write(data);
    } catch (e) {
      navigator.clipboard.writeText(currentOutput.replace(/\*\*(.*?)\*\*/g, '$1'));
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', minHeight: '0px' }}>
      
      {/* Main Workspace Card Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        background: 'transparent',
        gap: '1.25rem',
        color: '#1f2937',
        fontFamily: 'var(--font-sans)',
        minHeight: '0'
      }}>
        
        {/* Left Side: Editor Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          height: '100%',
          minHeight: '0'
        }}>
          
          {/* Editor Header Bar */}
          <div style={{
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            borderBottom: '1px solid #e5e7eb',
            background: 'transparent'
          }}>
            {/* Left title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} style={{ color: '#00a2ff' }} /> Content Humanizer Sandbox
              </span>
            </div>

            {/* Config & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Highlight vs Edit Toggle (only active on Write tab when detection score is present) */}
              {inputDetectionScore !== null && inputDetectionPatterns && inputDetectionPatterns.length > 0 && (
                <div style={{ display: 'flex', background: '#f3f4f6', padding: '2px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <button 
                    onClick={() => setEditorViewMode('edit')}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: editorViewMode === 'edit' ? '#ffffff' : 'transparent',
                      color: editorViewMode === 'edit' ? '#1f2937' : '#6b7280',
                      border: 'none',
                      boxShadow: editorViewMode === 'edit' ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => setEditorViewMode('highlight')}
                    style={{
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      background: editorViewMode === 'highlight' ? '#ffffff' : 'transparent',
                      color: editorViewMode === 'highlight' ? '#1f2937' : '#6b7280',
                      border: 'none',
                      boxShadow: editorViewMode === 'highlight' ? 'var(--shadow-sm)' : 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Highlights
                  </button>
                </div>
              )}

              {/* Brand Voice Selector */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select 
                  style={{
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  value={selectedVoiceId} 
                  onChange={(e) => setSelectedVoiceId(e.target.value)}
                >
                  <option value="">Default</option>
                  {voiceProfiles.map((p) => (
                    <option key={p.voiceProfileId} value={p.voiceProfileId}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Humanization Mode Selector */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select 
                  style={{
                    background: '#ffffff',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.5rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                  value={activeMode} 
                  onChange={(e) => {
                    const val = e.target.value as 'normal' | 'medium' | 'best' | 'bypass';
                    setActiveMode(val);
                    if (val === 'normal') {
                      setMode('standard');
                      setReflectionLevel('basic');
                    } else if (val === 'medium') {
                      setMode('human');
                      setReflectionLevel('advanced');
                    } else if (val === 'best') {
                      setMode('expert');
                      setReflectionLevel('maximum');
                    } else {
                      // bypass: maximum everything
                      setMode('bypass');
                      setReflectionLevel('maximum');
                    }
                  }}
                >
                  <option value="normal">Quick Clean</option>
                  <option value="medium">Deep Rewrite</option>
                  <option value="best">Authority</option>
                  <option value="bypass">⚡ Stealth</option>
                </select>
              </div>

              {/* New Playground button */}
              <button
                onClick={() => {
                  clearPlayground();
                  setActiveMode('medium');
                  setMode('human');
                  setReflectionLevel('advanced');
                  setSelectedVoiceId('');
                  setShowDetector(false);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  color: '#4b5563',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#9ca3af'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#d1d5db'; }}
              >
                <Plus size={13} /> New
              </button>

              {/* AI Detector toggle */}
              <button
                onClick={() => setShowDetector(!showDetector)}
                style={{
                  background: showDetector ? 'rgba(0, 162, 255, 0.08)' : 'transparent',
                  border: showDetector ? '1px solid rgba(0, 162, 255, 0.3)' : '1px solid #d1d5db',
                  color: showDetector ? '#00a2ff' : '#4b5563',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  transition: 'all 0.15s'
                }}
              >
                {showDetector ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
                {showDetector ? 'Hide Detector' : 'AI Detector'}
              </button>

              {/* Clear text button */}
              {inputText && (
                <button
                  onClick={handleClear}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#4b5563',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
                >
                  <Trash2 size={13} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Editor Body Area */}
          <div style={{
            flex: 1,
            display: 'flex',
            minHeight: '0',
            background: '#ffffff'
          }}>
            {/* Left Panel: Original Text */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderRight: (currentOutput || processingJob) ? '1px solid #e5e7eb' : 'none',
              height: '100%',
              minWidth: '0'
            }}>
              {/* Left Panel Header (Only if split mode active) */}
              {(currentOutput || processingJob) && (
                <div style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1.25rem',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Original Text
                  </span>
                  
                  {/* Copy + Edit/Diff Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {wordCount > 0 && (
                    <button
                      onClick={handleInputCopy}
                      title="Copy Original Text"
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        color: inputCopied ? '#10b981' : '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}
                    >
                      {inputCopied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      <span>{inputCopied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}
                  <div style={{ display: 'flex', background: '#e5e7eb', padding: '2px', borderRadius: '6px' }}>
                    <button 
                      onClick={() => setOriginalViewMode('edit')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: originalViewMode === 'edit' ? '#ffffff' : 'transparent',
                        color: originalViewMode === 'edit' ? '#1f2937' : '#6b7280',
                        border: 'none',
                        boxShadow: originalViewMode === 'edit' ? 'var(--shadow-sm)' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setOriginalViewMode('diff')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: originalViewMode === 'diff' ? '#ffffff' : 'transparent',
                        color: originalViewMode === 'diff' ? '#1f2937' : '#6b7280',
                        border: 'none',
                        boxShadow: originalViewMode === 'diff' ? 'var(--shadow-sm)' : 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Diff View
                    </button>
                  </div>
                  </div>
                </div>
              )}

              {/* Left Content Scroll Area */}
              <div 
                ref={leftScrollRef}
                onScroll={handleLeftScroll}
                onClick={() => {
                  if (originalViewMode === 'edit' && editorViewMode !== 'highlight') {
                    textareaRef.current?.focus();
                  }
                }}
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: (originalViewMode === 'edit' && editorViewMode !== 'highlight') ? 'text' : 'default'
                }}
              >
                {originalViewMode === 'diff' && currentOutput ? (
                  <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.8', 
                    fontSize: '0.95rem',
                    color: '#1f2937',
                    fontFamily: 'inherit'
                  }}>
                    {diffWords(inputText, currentOutput).map((part, idx) => {
                      if (part.added) {
                        return (
                          <span 
                            key={idx} 
                            style={{ 
                              backgroundColor: '#dcfce7', 
                              color: '#166534', 
                              padding: '0 2px', 
                              borderRadius: '2px' 
                            }}
                          >
                            {part.value}
                          </span>
                        );
                      }
                      if (part.removed) {
                        return (
                          <span 
                            key={idx} 
                            style={{ 
                              backgroundColor: '#fee2e2', 
                              color: '#991b1b', 
                              textDecoration: 'line-through', 
                              padding: '0 2px', 
                              borderRadius: '2px' 
                            }}
                          >
                            {part.value}
                          </span>
                        );
                      }
                      return <span key={idx}>{part.value}</span>;
                    })}
                  </div>
                ) : activeTab === 'editor' && editorViewMode === 'highlight' && inputDetectionScore !== null && inputDetectionPatterns && inputDetectionPatterns.length > 0 ? (
                  <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.8', 
                    fontSize: '0.95rem',
                    color: '#1f2937',
                    fontFamily: 'inherit'
                  }}>
                    <HighlightedText 
                      text={inputText} 
                      patterns={inputDetectionPatterns} 
                      color={getVerdictInfo(inputDetectionScore).color} 
                    />
                  </div>
                ) : (
                  <textarea 
                    ref={textareaRef}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      resize: 'none',
                      outline: 'none',
                      color: '#1f2937',
                      fontSize: '0.95rem',
                      lineHeight: '1.8',
                      fontFamily: 'inherit',
                      width: '100%',
                      height: '100%',
                      padding: '1.25rem 1.5rem',
                      minHeight: '280px'
                    }}
                    placeholder="Start writing or paste your AI-generated text here..."
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (inputDetectionScore !== null) {
                        setInputDetectionScore(null);
                        setInputDetectionPatterns(null);
                        setInputDetectionMetrics(null);
                        setEditorViewMode('edit');
                      }
                    }}
                    disabled={processingJob}
                  />
                )}
              </div>
            </div>

            {/* Right Panel: Humanized Output or Processing Logs */}
            {(currentOutput || processingJob) && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minWidth: '0',
                background: '#f9fafb'
              }}>
                {/* Right Panel Header */}
                <div style={{
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 1.25rem',
                  borderBottom: '1px solid #e5e7eb',
                  background: '#f9fafb',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Humanized Result
                  </span>
                  
                  {/* Copy Button */}
                  {currentOutput && (
                    <button
                      onClick={handleCopy}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #d1d5db',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}
                    >
                      {copied ? <Check size={12} style={{ color: '#10b981' }} /> : <Copy size={12} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                {/* Right Content Scroll Area */}
                <div 
                  ref={rightScrollRef}
                  onScroll={handleRightScroll}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {processingJob ? (
                    <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div className="pipeline-logs" style={{ 
                        textAlign: 'left', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.75rem',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        padding: '1.25rem',
                        borderRadius: '8px',
                        color: '#4b5563'
                      }}>
                        {processingLogs.map((log, index) => {
                          const isLast = index === processingLogs.length - 1;
                          const cleanLog = log.replace(/\.\.\.$/, '').trim();
                          
                          // Look up the thinking process text by matching key in agentThoughts
                          const thoughtEntry = Object.entries(agentThoughts).find(([key]) => 
                            cleanLog.toLowerCase().includes(key.toLowerCase()) || 
                            key.toLowerCase().includes(cleanLog.toLowerCase())
                          );
                          const thoughtText = thoughtEntry ? thoughtEntry[1] : '';
                          
                          return (
                            <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', opacity: isLast ? 1 : 0.45, transition: 'opacity 0.4s ease' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: 600 }}>
                                {isLast ? (
                                  <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', borderLeftColor: '#00a2ff', margin: 0 }}></span>
                                ) : (
                                  <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                                )}
                                <span style={{ color: '#1f2937' }}>{cleanLog}</span>
                              </div>
                              {thoughtText && (
                                <ThoughtProcess text={thoughtText} active={isLast} />
                              )}
                            </div>
                          );
                        })}
                        <div ref={logEndRef} />
                      </div>
                    </div>
                  ) : (
                    currentOutput && (
                      <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div style={{ 
                          whiteSpace: 'pre-wrap', 
                          lineHeight: '1.8', 
                          fontSize: '0.95rem',
                          color: '#1f2937',
                          fontFamily: 'inherit'
                        }}>
                          {activeTab === 'humanized' && editorViewMode === 'highlight' && outputDetectionScore !== null && outputDetectionPatterns && outputDetectionPatterns.length > 0 ? (
                            <HighlightedText 
                              text={currentOutput} 
                              patterns={outputDetectionPatterns} 
                              color={getVerdictInfo(outputDetectionScore).color} 
                            />
                          ) : (
                            <div>
                              <div 
                                className="markdown-rendered"
                                dangerouslySetInnerHTML={{ __html: marked.parse(currentOutput) as string }} 
                              />
                              <style>{`
                                .markdown-rendered p { margin-bottom: 1rem; }
                                .markdown-rendered p:last-child { margin-bottom: 0; }
                                .markdown-rendered strong { font-weight: 700; color: #111827; }
                                .markdown-rendered ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
                                .markdown-rendered ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
                                .markdown-rendered h1, .markdown-rendered h2, .markdown-rendered h3 { font-weight: 700; color: #111827; margin-top: 1.5rem; margin-bottom: 0.75rem; }
                                .markdown-rendered h1 { font-size: 1.5rem; }
                                .markdown-rendered h2 { font-size: 1.25rem; }
                                .markdown-rendered h3 { font-size: 1.1rem; }
                              `}</style>
                            </div>
                          )}
                        </div>

                        {/* Quality Score Analysis integrated inside output */}
                        {currentMetrics && (
                          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>Quality Score Analysis</span>
                              <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Calibrated Bypass & Coherence</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                              {[
                                { label: 'Source AI %', value: currentMetrics.input_ai_written_percent, color: '#ef4444' },
                                { label: 'Bypass Resistance', value: currentMetrics.ai_detection_resistance, color: '#10b981' },
                                { label: 'Human Likeness', value: currentMetrics.human_likeness, color: '#00a2ff' },
                                { label: 'Readability Score', value: currentMetrics.readability, color: '#8b5cf6' },
                                { label: 'SEO Retention', value: currentMetrics.seo_retention, color: '#0ea5e9' },
                                { label: 'Overall Match', value: currentMetrics.overall, color: '#ec4899' }
                              ].map((metric) => (
                                <div key={metric.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <span style={{ color: '#4b5563' }}>{metric.label}</span>
                                    <span style={{ color: metric.color }}>{metric.value}%</span>
                                  </div>
                                  <div style={{ width: '100%', height: '5px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div 
                                      style={{ 
                                        width: `${metric.value}%`, 
                                        height: '100%', 
                                        background: metric.color, 
                                        borderRadius: '3px',
                                        transition: 'width 0.8s ease-out'
                                      }} 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Summary */}
                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb', fontSize: '0.78rem', color: '#4b5563', lineHeight: '1.4' }}>
                              <strong style={{ color: '#111827' }}>Transformation Log:</strong> {currentMetrics.summary}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Editor Footer Bar */}
          <div style={{
            height: '55px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.25rem',
            background: 'transparent'
          }}>
            {/* Counts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>
                {wordCount} words • {characterCount} chars {wordCount > 0 && (hasCustomKeys ? '• Cost: Free (Own Keys)' : `• Cost: ${estimatedCredits} credits`)}
              </div>
              

            </div>

            {/* Action CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {user && (
                <div style={{ 
                  fontSize: '0.78rem', 
                  color: '#374151', 
                  fontWeight: 600,
                  background: '#f3f4f6',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ color: '#6b7280' }}>Total:</span>
                  <span style={{ color: '#00a2ff' }}>{user.credits.toLocaleString()}</span>
                  <span style={{ color: '#6b7280' }}>credits</span>
                </div>
              )}

              {/* Main Submit CTA */}
              <button 
                type="button"
                className="btn-primary" 
                style={{ 
                  background: 'linear-gradient(135deg, #00a2ff 0%, #1d4ed8 100%)', 
                  color: '#ffffff',
                  fontSize: '0.82rem',
                  padding: '0.45rem 1.35rem',
                  borderRadius: '9999px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 162, 255, 0.25)',
                  cursor: (processingJob || wordCount === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={handleHumanize}
                disabled={processingJob || wordCount === 0}
                onMouseEnter={(e) => {
                  if (!processingJob && wordCount > 0) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 162, 255, 0.35)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 162, 255, 0.25)';
                }}
              >
                <Sparkles size={14} /> Humanize
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Scans (Collapsible) */}
        {showDetector && <div style={{
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          background: '#f9fafb',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          height: '100%',
          minHeight: '0',
          flexShrink: 0,
          transition: 'width 0.2s ease'
        }}>

          {currentOutput && (
            <div style={{ padding: '1.25rem 1.25rem 0 1.25rem', flexShrink: 0 }}>
              <div style={{ display: 'flex', background: '#e5e7eb', padding: '2px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('editor');
                    setEditorViewMode('highlight');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: activeTab === 'editor' ? '#ffffff' : 'transparent',
                    color: activeTab === 'editor' ? '#1f2937' : '#6b7280',
                    border: 'none',
                    boxShadow: activeTab === 'editor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Original Scan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('humanized');
                    setEditorViewMode('highlight');
                  }}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: activeTab === 'humanized' ? '#ffffff' : 'transparent',
                    color: activeTab === 'humanized' ? '#1f2937' : '#6b7280',
                    border: 'none',
                    boxShadow: activeTab === 'humanized' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Humanized Scan
                </button>
              </div>
            </div>
          )}

          {currentDetectionScore === null ? (
            /* Unscanned State */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'rgba(0, 162, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00a2ff',
                marginBottom: '1rem'
              }}>
                <Bot size={28} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
                Not Analyzed Yet
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Click 'Detect AI' to analyze your text and see detailed metrics.
              </p>
              <button
                type="button"
                onClick={handleDetect}
                disabled={detecting || wordCount === 0 || processingJob}
                style={{
                  background: '#00a2ff',
                  color: '#0a0b0d',
                  fontSize: '0.85rem',
                  padding: '0.6rem 1.35rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 162, 255, 0.2)',
                  cursor: (detecting || wordCount === 0 || processingJob) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!detecting && wordCount > 0 && !processingJob) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 162, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 162, 255, 0.2)';
                }}
              >
                {detecting ? (
                  <>
                    <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', borderLeftColor: '#0a0b0d', margin: 0 }}></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan size={15} /> Detect AI
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Scanned Results Panel */
            (() => {
              const verdictInfo = getVerdictInfo(currentDetectionScore);
              const VerdictIcon = verdictInfo.icon;
              return (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem', overflowY: 'hidden' }}>
                  {/* Upper Div: Percentage Gauge & Linguistic Analytics */}
                  <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Bot size={16} style={{ color: '#00a2ff' }} /> AI Scan Results
                    </span>
                    <button
                      onClick={handleDetect}
                      disabled={detecting || wordCount === 0 || processingJob}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#00a2ff',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <RefreshCw size={12} className={detecting ? 'spin' : ''} style={{ animation: detecting ? 'spin 1s linear infinite' : 'none' }} /> Re-Scan
                    </button>
                  </div>

                  <style>{`
                    @keyframes spin {
                      from { transform: rotate(0deg); }
                      to { transform: rotate(360deg); }
                    }
                  `}</style>

                  {/* Gauge Section (Shows both side-by-side if humanized output exists, otherwise single gauge) */}
                  {currentOutput && playgroundInputDetectionScore !== null && playgroundOutputDetectionScore !== null ? (
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      {/* Left: Original Score */}
                      {(() => {
                        const originalVerdict = getVerdictInfo(playgroundInputDetectionScore);
                        const OriginalIcon = originalVerdict.icon;
                        return (
                          <div style={{
                            flex: 1,
                            background: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '10px',
                            padding: '0.6rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Original AI %</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: originalVerdict.color, fontFamily: 'var(--font-display)', lineHeight: '1.1' }}>
                              {playgroundInputDetectionScore}%
                            </span>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              background: originalVerdict.bg,
                              color: originalVerdict.color,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '9999px',
                              fontWeight: 600,
                              fontSize: '0.68rem',
                              marginTop: '0.4rem'
                            }}>
                              <OriginalIcon size={11} />
                              <span>{originalVerdict.label}</span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Right: Humanized Score */}
                      {(() => {
                        const humanizedVerdict = getVerdictInfo(playgroundOutputDetectionScore);
                        const HumanizedIcon = humanizedVerdict.icon;
                        return (
                          <div style={{
                            flex: 1,
                            background: 'rgba(34, 197, 94, 0.03)',
                            border: '1px solid rgba(34, 197, 94, 0.15)',
                            borderRadius: '10px',
                            padding: '0.6rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Humanized AI %</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: humanizedVerdict.color, fontFamily: 'var(--font-display)', lineHeight: '1.1' }}>
                              {playgroundOutputDetectionScore}%
                            </span>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.2rem',
                              background: humanizedVerdict.bg,
                              color: humanizedVerdict.color,
                              padding: '0.2rem 0.5rem',
                              borderRadius: '9999px',
                              fontWeight: 600,
                              fontSize: '0.68rem',
                              marginTop: '0.4rem'
                            }}>
                              <HumanizedIcon size={11} />
                              <span>{humanizedVerdict.label}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    /* Single Gauge View (before humanizing or if not both generated) */
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ position: 'relative', width: '150px', height: '110px', display: 'flex', justifyContent: 'center' }}>
                        <svg width="150" height="110" viewBox="0 0 100 80" style={{ overflow: 'visible' }}>
                          <path
                            d="M 20 70 A 35 35 0 1 1 80 70"
                            fill="none"
                            stroke="rgba(0, 0, 0, 0.06)"
                            strokeWidth="8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M 20 70 A 35 35 0 1 1 80 70"
                            fill="none"
                            stroke={verdictInfo.color}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray="148"
                            strokeDashoffset={148 * (1 - (currentDetectionScore ?? 0) / 100)}
                            style={{ 
                              transition: 'stroke-dashoffset 0.8s ease-in-out',
                            }}
                          />
                        </svg>
                        <div style={{
                          position: 'absolute',
                          top: '55%',
                          left: '50%',
                          transform: 'translate(-50%, -55%)',
                          fontSize: '2.25rem',
                          fontWeight: 800,
                          color: '#111827',
                          fontFamily: 'var(--font-display)',
                          lineHeight: 1
                        }}>
                          {currentDetectionScore}%
                        </div>
                      </div>

                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        background: verdictInfo.bg,
                        border: `1px solid ${verdictInfo.border}`,
                        color: verdictInfo.color,
                        padding: '0.35rem 1rem',
                        borderRadius: '9999px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        marginTop: '0.5rem'
                      }}>
                        <VerdictIcon size={14} />
                        <span>{verdictInfo.label}</span>
                      </div>
                    </div>
                  )}

                  {/* Detailed metrics */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Linguistic Analytics
                    </span>
                    {currentDetectionMetrics && currentDetectionMetrics.map((metric) => {
                      const isDanger = metric.color === 'red';
                      const metricColor = isDanger ? '#ef4444' : '#22c55e';
                      return (
                        <div key={metric.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                            <span style={{ color: '#374151', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                              {metric.label}
                              <span title={getMetricDescription(metric.label)} style={{ display: 'inline-flex', alignItems: 'center', cursor: 'help' }}>
                                <Info size={11} style={{ opacity: 0.5 }} />
                              </span>
                            </span>
                            <span style={{ fontWeight: 600, color: '#111827' }}>{metric.value}%</span>
                          </div>
                          <div style={{ width: '100%', height: '4px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${metric.value}%`, 
                                height: '100%', 
                                background: metricColor, 
                                borderRadius: '2px',
                                transition: 'width 0.8s ease-out'
                              }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>

                  {/* Bottom Div: AI Sentence Traces */}
                  <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Sentence Traces ({currentDetectionPatterns?.length || 0})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {currentDetectionPatterns && currentDetectionPatterns.map((pat, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            fontSize: '0.75rem', 
                            background: '#ffffff', 
                            padding: '0.6rem 0.8rem', 
                            borderRadius: '6px', 
                            border: '1px solid #e5e7eb',
                            borderLeft: `2.5px solid ${verdictInfo.color}`,
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ fontStyle: 'italic', color: '#1f2937', display: 'block', marginBottom: '0.25rem' }}>
                            "{pat.quote}"
                          </span>
                          <span style={{ color: '#4b5563', display: 'block', fontSize: '0.7rem' }}>
                            {pat.explanation}
                          </span>
                          {pat.alternative && !/^none needed$/i.test(pat.alternative.trim()) && (
                            <div style={{ marginTop: '0.5rem', paddingTop: '0.4rem', borderTop: '1px dashed #e5e7eb', fontSize: '0.7rem' }}>
                              <span style={{ fontWeight: 700, color: '#10b981' }}>Try: </span>
                              <span style={{ color: '#059669', fontStyle: 'italic' }}>"{pat.alternative}"</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()
          )}
        </div>}
      </div>

      {/* Billing Modal Overlay */}
      {showBillingModal && (
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
          zIndex: 1000,
          padding: '1.5rem'
        }}
        onClick={() => setShowBillingModal(false)}
        >
          {/* Modal Container */}
          <div style={{
            background: 'var(--bg-primary, #ffffff)',
            border: '1px solid var(--card-border, #e2e8f0)',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '850px',
            padding: '2rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowBillingModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', padding: '0.75rem', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', marginBottom: '0.75rem' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Insufficient Credits</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', lineHeight: '1.5' }}>
                Your current balance is <strong style={{ color: 'var(--color-primary)' }}>{(user?.credits || 0).toLocaleString()} credits</strong>, but this humanization job requires <strong style={{ color: 'var(--color-secondary)' }}>{estimatedCredits.toLocaleString()} credits</strong>. Top up to continue.
              </p>
            </div>

            {/* Pricing Packages Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
              {[
                { 
                  id: 'pkg-1', 
                  name: 'Starter Pack', 
                  credits: 1000, 
                  price: '9', 
                  desc: 'Perfect for freelance copywriters.',
                  color: '#10b981', // Emerald
                  btnBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  badge: 'Starter',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  features: ['1,000 standard credits', 'Access to all pipeline Agents', 'Up to 3 Brand Voice profiles', '90%+ AI Resistance Guarantee']
                },
                { 
                  id: 'pkg-2', 
                  name: 'Professional', 
                  credits: 5000, 
                  price: '29', 
                  desc: 'Ideal for content agencies and sites.', 
                  popular: true,
                  color: '#a855f7', // Purple
                  btnBg: 'linear-gradient(135deg, #3b82f6 0%, #a855f7 50%, #ec4899 100%)',
                  badge: 'Best Value',
                  borderColor: 'rgba(168, 85, 247, 0.5)',
                  features: ['5,000 standard credits', 'Access to all pipeline Agents', 'Up to 6 Brand Voice profiles', 'Priority processing queue']
                },
                { 
                  id: 'pkg-3', 
                  name: 'Enterprise Hub', 
                  credits: 20000, 
                  price: '79', 
                  desc: 'Best for bulk publishing syndicates.',
                  color: '#f59e0b', // Amber/Gold
                  btnBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  badge: 'Power User',
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  features: ['20,000 standard credits', 'Access to all pipeline Agents', 'Up to 10 Brand Voice profiles', 'Dedicated support line']
                }
              ].map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="glass-card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                    border: `1px solid ${pkg.borderColor}`,
                    boxShadow: pkg.popular ? 'var(--shadow-glow-purple)' : 'none',
                    position: 'relative',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  <span className="tag" style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: `${pkg.color}15`, color: pkg.color, borderColor: `${pkg.color}30`, fontWeight: 700 }}>
                    {pkg.badge}
                  </span>
                  
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{pkg.name}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{pkg.desc}</p>
                    
                    <div style={{ margin: '1rem 0' }}>
                      <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>US${pkg.price}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}> USD</span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.45rem', borderTop: '1px solid var(--card-border)', paddingTop: '0.75rem' }}>
                      {pkg.features.map((feat, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={pkg.color} strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    className="btn-primary" 
                    style={{ 
                      width: '100%', 
                      background: pkg.btnBg, 
                      border: 'none',
                      color: '#ffffff',
                      padding: '0.5rem',
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                    disabled={purchasingPkgId !== null}
                    onClick={() => handlePurchase(pkg.id, pkg.credits)}
                  >
                    {purchasingPkgId === pkg.id ? 'Securing Stripe...' : `Buy ${pkg.credits.toLocaleString()}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
