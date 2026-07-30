import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Sparkles, 
  Trash2, 
  Scan, 
  Bot, 
  RefreshCw, 
  Info, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';

export default function AiDetector() {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { 
    detectText,
    detectionPatterns,
    detectionMetrics,
    showToast
  } = useAppStore();

  const [inputText, setInputText] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [detectionScore, setDetectionScore] = useState<number | null>(null);
  const [editorViewMode, setEditorViewMode] = useState<'edit' | 'highlight'>('edit');

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const characterCount = inputText.length;

  const handleDetect = async () => {
    if (!inputText.trim()) return;
    setDetecting(true);
    setDetectionScore(null);
    const score = await detectText(inputText);
    if (score === -1) {
      showToast("Could not reach the detection backend. Please ensure the backend is running and your API key is valid.", "error");
    } else {
      setDetectionScore(score);
      setEditorViewMode('highlight');
    }
    setDetecting(false);
  };

  const handleClear = () => {
    setInputText('');
    setDetectionScore(null);
    setEditorViewMode('edit');
  };

  const handleHumanizeRedirect = () => {
    navigate('/dashboard/playground', { state: { initialText: inputText } });
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

    // Merge overlapping or nested intervals
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
            background: 'rgba(239, 68, 68, 0.12)',
            borderBottom: '2.5px solid #ef4444',
            color: '#b91c1c',
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', minHeight: '600px' }}>
      
      {/* Main Workspace Card Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        color: '#1f2937',
        fontFamily: 'var(--font-sans)'
      }}>
        
        {/* Left Side: Editor Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          height: '100%'
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
            {/* Header Label */}
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Scan size={16} style={{ color: '#00a2ff' }} /> AI Detector Sandbox
            </div>

            {/* Config & Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              
              {/* Highlight vs Edit Toggle */}
              {detectionScore !== null && detectionPatterns && detectionPatterns.length > 0 && (
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

              {/* Clean Button */}
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
          <div 
            onClick={() => {
              if (editorViewMode === 'edit') {
                textareaRef.current?.focus();
              }
            }}
            style={{
              flex: 1,
              padding: '1.25rem 1.5rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              cursor: editorViewMode === 'edit' ? 'text' : 'default'
            }}
          >
            {/* Editable Textarea or Highlights Mode */}
            {editorViewMode === 'highlight' && detectionScore !== null && detectionPatterns && detectionPatterns.length > 0 ? (
              <div 
                style={{ 
                  flex: 1,
                  overflowY: 'auto', 
                  whiteSpace: 'pre-wrap', 
                  lineHeight: '1.7', 
                  fontSize: '0.95rem',
                  color: '#1f2937',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  padding: '0.25rem 0'
                }}
              >
                {renderHighlightedText()}
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
                  lineHeight: '1.7',
                  fontFamily: 'inherit',
                  width: '100%',
                  height: '100%',
                  minHeight: '280px'
                }}
                placeholder="Paste the text you want to analyze here..."
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
            <div style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 600 }}>
              {wordCount} words • {characterCount} chars
            </div>

            {/* Action CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Humanize redirection shortcut */}
              {detectionScore !== null && detectionScore >= 40 && (
                <button
                  type="button"
                  onClick={handleHumanizeRedirect}
                  style={{
                    background: 'transparent',
                    color: '#00a2ff',
                    fontSize: '0.82rem',
                    padding: '0.45rem 1rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    border: '1px solid rgba(0, 162, 255, 0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 162, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Sparkles size={14} /> Humanize this text
                </button>
              )}

              {/* Main Submit CTA */}
              <button 
                type="button"
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
                  cursor: (detecting || wordCount === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={handleDetect}
                disabled={detecting || wordCount === 0}
              >
                {detecting ? (
                  <>
                    <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '1.5px', borderLeftColor: '#ffffff', margin: 0 }}></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan size={14} /> Detect AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar Scans */}
        <div style={{
          width: '340px',
          display: 'flex',
          flexDirection: 'column',
          background: '#f9fafb',
          borderLeft: '1px solid #e5e7eb',
          height: '100%'
        }}>
          {detectionScore === null ? (
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
                disabled={detecting || wordCount === 0}
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
                  cursor: (detecting || wordCount === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
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
              const verdictInfo = getVerdictInfo(detectionScore);
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
                        disabled={detecting || wordCount === 0}
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

                    {/* Gauge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div style={{ width: '150px', height: '110px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
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
                            strokeDashoffset={148 * (1 - detectionScore / 100)}
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
                          {detectionScore}%
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

                    {/* Detailed metrics */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem', borderTop: '1px solid #e5e7eb', paddingTop: '1rem' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Linguistic Analytics
                      </span>
                      {detectionMetrics && detectionMetrics.map((metric) => {
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
                      AI Sentence Traces ({detectionPatterns?.length || 0})
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {detectionPatterns && detectionPatterns.map((pat, idx) => (
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
                          {pat.alternative && (
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
        </div>
      </div>
    </div>
  );
}
