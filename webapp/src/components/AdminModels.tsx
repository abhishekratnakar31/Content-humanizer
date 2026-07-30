import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { auth } from '../firebase';
import { Cpu, Check, AlertCircle, Loader2, RefreshCw, Server, ShieldCheck, Settings } from 'lucide-react';

const ADMIN_API_BASE = import.meta.env.VITE_ADMIN_API_URL || '/api/v1';

export default function AdminModels() {
  const { showToast } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [activeModels, setActiveModels] = useState<any>({
    agent_0_model: 'gemini-2.5-flash',
    agent_1_model: 'gemini-2.5-flash',
    agent_2_model: 'gemini-2.5-flash',
    agent_3_model: 'gemini-2.5-flash',
    agent_4_model: 'gemini-2.5-pro',
    agent_5_model: 'gemini-2.5-pro',
    agent_scoring_model: 'gemini-2.5-flash',
    agent_polish_model: 'gemini-2.5-flash'
  });

  const [availableGeminiModels, setAvailableGeminiModels] = useState<string[]>([]);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);

  const getHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchConfig = async (isScan = false) => {
    if (isScan) setScanning(true);
    else setLoading(true);

    try {
      const headers = await getHeaders();
      const res = await fetch(`${ADMIN_API_BASE}/admin/models`, { headers });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = await res.json();
      if (data.active_models) {
        setActiveModels(data.active_models);
      }
      setAvailableGeminiModels(data.available_gemini_models || []);
      setHasGeminiKey(data.has_gemini_key);

      if (isScan) {
        showToast("Model list refreshed successfully.", "success");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to fetch model configuration.", "error");
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const headers = await getHeaders();
      const res = await fetch(`${ADMIN_API_BASE}/admin/models`, {
        method: 'POST',
        headers,
        body: JSON.stringify(activeModels)
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      showToast("Model assignments saved successfully.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save model configuration.", "error");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '1rem' }}>
        <Loader2 size={36} className="spinner" style={{ color: 'var(--color-accent)' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading active model assignments...</span>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            Pipeline Model Configuration <Settings style={{ color: 'var(--color-accent)' }} />
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            List available LLMs, inspect API provider connection status, and map models to specific agent pipeline roles.
          </p>
        </div>
        <button
          onClick={() => fetchConfig(true)}
          disabled={scanning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#374151',
            cursor: scanning ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { if (!scanning) e.currentTarget.style.background = '#f9fafb'; }}
          onMouseLeave={(e) => { if (!scanning) e.currentTarget.style.background = '#ffffff'; }}
        >
          <RefreshCw size={14} className={scanning ? 'spinner' : ''} />
          <span>{scanning ? 'Scanning...' : 'Scan for Models'}</span>
        </button>
      </div>

      {/* Provider Status Check */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: hasGeminiKey ? 'rgba(34, 197, 94, 0.1)' : 'rgba(245, 158, 11, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: hasGeminiKey ? '#22c55e' : '#f59e0b'
          }}>
            {hasGeminiKey ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Google Gemini Provider</h4>
            <span style={{ fontSize: '0.75rem', color: hasGeminiKey ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
              {hasGeminiKey ? 'API Key Active (Live model list loaded)' : 'API Key Missing (Using fallback list)'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '2rem' }}>
        {/* Mapping Form */}
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Cpu size={18} style={{ color: 'var(--color-accent)' }} /> Active Agent Role Mappings
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Agent List Mappings */}
            {[
              { key: 'agent_0_model', label: 'Agent 0: Pre-Processing Sterilizer', provider: 'Google Gemini' },
              { key: 'agent_1_model', label: 'Agent 1: Intent Extraction', provider: 'Google Gemini' },
              { key: 'agent_2_model', label: 'Agent 2: AI Pattern Detection', provider: 'Google Gemini' },
              { key: 'agent_3_model', label: 'Agent 3: Humanization Strategy', provider: 'Google Gemini' },
              { key: 'agent_4_model', label: 'Agent 4: Linguistic Humanizer', provider: 'Google Gemini' },
              { key: 'agent_5_model', label: 'Agent 5: Post-Processing Polish', provider: 'Google Gemini' },
              { key: 'agent_scoring_model', label: 'Agent 8: Quality Scoring', provider: 'Google Gemini' },
              { key: 'agent_polish_model', label: 'Agent 9: Final Polish', provider: 'Google Gemini' },
            ].map(agent => (
              <div key={agent.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {agent.label} ({agent.provider})
                </label>
                <select
                  value={activeModels[agent.key] || ''}
                  onChange={(e) => setActiveModels({ ...activeModels, [agent.key]: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '0.85rem',
                    outline: 'none',
                    background: '#ffffff',
                    color: '#1f2937'
                  }}
                >
                  {availableGeminiModels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
              padding: '0.65rem',
              background: 'linear-gradient(135deg, #00a2ff 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(0, 162, 255, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            {saving ? <Loader2 size={16} className="spinner" /> : <Check size={16} />}
            <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </form>

        {/* Info panel & detected lists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Server size={16} style={{ color: 'var(--color-secondary)' }} /> Google Gemini Models
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
              {availableGeminiModels.map((m) => (
                <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.6rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '6px', fontSize: '0.78rem', color: '#334155' }}>
                  <span style={{ fontFamily: 'monospace' }}>{m}</span>
                  {Object.values(activeModels).includes(m) && (
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0, 162, 255, 0.1)', color: '#00a2ff', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 600 }}>
                      In Use
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
