import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Trash, Copy, Check, ShieldAlert, Edit2, X, Terminal, Code2, Globe, User, Building, Zap } from 'lucide-react';

const MODE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  standard: { label: 'Normal',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  human:    { label: 'Medium',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  expert:   { label: 'Best',    color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  bypass:   { label: '⚡ Bypass', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
};

export default function ApiManagement() {
  const { apiKeys, generateApiKey, revokeApiKey, updateApiKeyName, user, voiceProfiles } = useAppStore();
  const [keyName, setKeyName] = useState('');
  const scope = 'full';
  const [workspaceType, setWorkspaceType] = useState('individual');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [snippetCopied, setSnippetCopied] = useState(false);

  // Default mode & vault for the key being created
  const [defaultMode, setDefaultMode] = useState<string>('');
  const [defaultVoiceProfileId, setDefaultVoiceProfileId] = useState<string>('');

  // Modal flow state controls
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creationStep, setCreationStep] = useState(1);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDoneModalOpen, setIsDoneModalOpen] = useState(false);
  const [expiration, setExpiration] = useState('never');
  const [isFirstTimeWizard, setIsFirstTimeWizard] = useState(true);
  const [activeCodeTab, setActiveCodeTab] = useState('curl');

  // Edit Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editKeyName, setEditKeyName] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const resetCreateForm = () => {
    setKeyName('');
    setExpiration('never');
    setDefaultMode('');
    setDefaultVoiceProfileId('');
    setCreationStep(1);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    const key = await generateApiKey(
      keyName, scope, workspaceType, expiration, null, 'N/A',
      defaultMode || null,
      defaultVoiceProfileId || null
    );
    if (key) {
      setGeneratedKey(key);
      setIsCreateModalOpen(false);
      resetCreateForm();
      setIsSuccessModalOpen(true);
    }
  };

  const handleSimplifiedGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    const key = await generateApiKey(
      keyName, 'full', 'individual', expiration, null, 'N/A',
      defaultMode || null,
      defaultVoiceProfileId || null
    );
    if (key) {
      setGeneratedKey(key);
      setIsCreateModalOpen(false);
      resetCreateForm();
      setIsSuccessModalOpen(true);
    }
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Integration snippets matching the generated key
  const getCodeSnippet = () => {
    const token = generatedKey || 'humanizer_live_xxxxxxxxxxxxxxxxxxxxxxxx';
    switch (activeCodeTab) {
      case 'curl':
        return `curl -X POST https://apigateway-gmai4ubyrq-uc.a.run.app/api/v1/humanize \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "What is the meaning of life?",
    "mode": "expert",
    "reflection_level": "advanced"
  }'`;
      case 'js':
        return `fetch('https://apigateway-gmai4ubyrq-uc.a.run.app/api/v1/humanize', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${token}',
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Content Humanizer Integration'
  },
  body: JSON.stringify({
    text: 'What is the meaning of life?',
    mode: 'expert',
    reflection_level: 'advanced'
  })
})
.then(res => res.json())
.then(data => console.log(data));`;
      case 'python':
        return `import requests

url = "https://apigateway-gmai4ubyrq-uc.a.run.app/api/v1/humanize"
headers = {
    "Authorization": "Bearer ${token}",
    "Content-Type": "application/json"
}
payload = {
    "text": "What is the meaning of life?",
    "mode": "expert",
    "reflection_level": "advanced"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
      default:
        return '';
    }
  };

  return (
    <div>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            API Keys
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage your project API keys. Remember to keep your API keys safe to prevent unauthorized access.
          </p>
        </div>
        
        {/* Create API Key Trigger Button */}
        <button 
          className="btn-primary" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontWeight: 500,
            fontSize: '0.9rem',
            background: 'var(--color-primary)'
          }}
          onClick={() => {
            const firstTime = !user?.hasCreatedKey && apiKeys.length === 0;
            setIsFirstTimeWizard(firstTime);
            setCreationStep(1);
            setIsCreateModalOpen(true);
          }}
        >
          <Plus size={16} /> Create API Key
        </button>
      </div>

      {/* Main Keys List Section */}
      <div className="glass-card" style={{ padding: '1.5rem 0' }}>
        {apiKeys.length === 0 ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6, fontSize: '0.95rem' }}>
            No API credentials configured. Generate a key to begin.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secret Key</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default Mode</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voice Vault</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Created</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expires</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Usage (24Hrs)</th>
                  <th style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.apiKeyId} style={{ borderBottom: '1px solid var(--card-border)', verticalAlign: 'middle' }}>
                    
                    {/* Name column */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {key.name}
                    </td>

                    {/* Key Type (individual/org) */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                      {key.keyType || 'individual'}
                    </td>

                    {/* Masked Secret Key column */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                      humanizer_...{key.apiKeyId.substring(key.apiKeyId.length - 4)}
                    </td>

                    {/* Default Mode badge */}
                    <td style={{ padding: '1.2rem 1.5rem' }}>
                      {key.defaultMode && MODE_LABELS[key.defaultMode] ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          color: MODE_LABELS[key.defaultMode].color,
                          background: MODE_LABELS[key.defaultMode].bg,
                          border: `1px solid ${MODE_LABELS[key.defaultMode].color}33`
                        }}>
                          {MODE_LABELS[key.defaultMode].label}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.5 }}>—</span>
                      )}
                    </td>

                    {/* Voice Vault badge */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {key.defaultVoiceProfileId ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                          fontSize: '0.75rem', fontWeight: 500, padding: '0.2rem 0.6rem',
                          borderRadius: '999px', color: '#10b981',
                          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          {voiceProfiles.find(v => v.voiceProfileId === key.defaultVoiceProfileId)?.name || key.defaultVoiceProfileId}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>—</span>
                      )}
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>

                    {/* Expires */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {key.expiresAt ? (
                        (() => {
                          const expiryDate = new Date(key.expiresAt);
                          const isExpired = expiryDate.getTime() < Date.now();
                          if (isExpired) {
                            return (
                              <span 
                                style={{ 
                                  color: 'var(--color-danger, #ef4444)',
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  padding: '0.2rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.25rem'
                                }}
                                title={`Expired on ${expiryDate.toLocaleString()}`}
                              >
                                Expired
                              </span>
                            );
                          }
                          return expiryDate.toLocaleDateString();
                        })()
                      ) : (
                        'Never'
                      )}
                    </td>

                    {/* Usage (24hrs) */}
                    <td style={{ padding: '1.2rem 1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      0 API Calls
                    </td>

                    {/* Actions column */}
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ 
                            borderRadius: '6px', 
                            padding: '0.4rem', 
                            cursor: 'pointer' 
                          }}
                          onClick={() => {
                            setEditingKeyId(key.apiKeyId);
                            setEditKeyName(key.name);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.05)', 
                            border: '1px solid rgba(239, 68, 68, 0.15)', 
                            borderRadius: '6px', 
                            padding: '0.4rem', 
                            color: 'var(--color-danger)', 
                            cursor: 'pointer' 
                          }}
                          onClick={() => revokeApiKey(key.apiKeyId)}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. CREATE KEY MODAL OVERLAY */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '620px',
            padding: '1.5rem 2.25rem',
            position: 'relative',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
            >
              <X size={18} />
            </button>

            {!isFirstTimeWizard ? (
              <form onSubmit={handleSimplifiedGenerate}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Create API Key
                </h3>

                {/* Name field */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Name <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }} title="A display name for this API key to identify it later.">ⓘ</span>
                  </label>
                  <input 
                    type="text" 
                    className="text-input" 
                    placeholder='e.g. "Marketing Automation"'
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    maxLength={50}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Expiration field */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Expiration <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }} title="The duration before this API key automatically expires.">ⓘ</span>
                  </label>
                  <select 
                    className="select-input" 
                    value={expiration} 
                    onChange={(e) => setExpiration(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    <option value="never">No expiration</option>
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="60">60 Days</option>
                    <option value="90">90 Days</option>
                  </select>
                </div>

                {/* Default Mode */}
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <Zap size={13} /> Default Mode
                    <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }} title="Auto-applied when callers don't send a mode. Callers can still override per-request.">ⓘ</span>
                  </label>
                  <select className="select-input" value={defaultMode} onChange={(e) => setDefaultMode(e.target.value)} style={{ width: '100%' }}>
                    <option value="">No default (caller must specify)</option>
                    <option value="standard">Normal Mode — Fast, basic humanization</option>
                    <option value="human">Medium Mode — Balanced quality</option>
                    <option value="expert">Best Mode — Pro model rewrites</option>
                    <option value="bypass">⚡ Bypass Mode — Maximum AI-evasion</option>
                  </select>
                </div>

                {/* Default Voice Vault */}
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Default Voice Vault
                    <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }} title="Auto-applies this writing persona when the caller doesn't send a voice_profile_id.">ⓘ</span>
                  </label>
                  <select className="select-input" value={defaultVoiceProfileId} onChange={(e) => setDefaultVoiceProfileId(e.target.value)} style={{ width: '100%' }}>
                    <option value="">No default (caller must specify)</option>
                    {voiceProfiles.map((vp) => (
                      <option key={vp.voiceProfileId} value={vp.voiceProfileId}>{vp.name}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    These settings are baked into the key and applied automatically.
                  </span>
                </div>

                {/* Create button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ 
                      padding: '0.6rem 1.8rem', 
                      borderRadius: '6px', 
                      background: 'var(--color-primary)',
                      fontWeight: 500
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Create API Key
                </h3>

                {/* STEP 1: Account Type Selection */}
                {creationStep === 1 && (
                  <div>
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Account Type
                      </label>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button 
                          type="button"
                          style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '10px',
                            border: `1px solid ${workspaceType === 'individual' ? 'var(--color-primary)' : 'var(--card-border)'}`,
                            background: workspaceType === 'individual' ? 'rgba(29, 78, 216, 0.05)' : 'var(--bg-tertiary)',
                            color: workspaceType === 'individual' ? 'var(--color-primary)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease',
                            boxShadow: workspaceType === 'individual' ? 'var(--shadow-sm)' : 'none'
                          }}
                          onClick={() => setWorkspaceType('individual')}
                        >
                          <User size={22} style={{ color: workspaceType === 'individual' ? 'var(--color-primary)' : 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Individual</span>
                        </button>
                        <button 
                          type="button"
                          style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '10px',
                            border: `1px solid ${workspaceType === 'organization' ? 'var(--color-primary)' : 'var(--card-border)'}`,
                            background: workspaceType === 'organization' ? 'rgba(29, 78, 216, 0.05)' : 'var(--bg-tertiary)',
                            color: workspaceType === 'organization' ? 'var(--color-primary)' : 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s ease',
                            boxShadow: workspaceType === 'organization' ? 'var(--shadow-sm)' : 'none'
                          }}
                          onClick={() => setWorkspaceType('organization')}
                        >
                          <Building size={22} style={{ color: workspaceType === 'organization' ? 'var(--color-primary)' : 'var(--text-secondary)' }} />
                          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Organization</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        className="btn-primary" 
                        style={{ padding: '0.6rem 1.8rem', borderRadius: '6px', background: 'var(--color-primary)' }}
                        onClick={() => setCreationStep(2)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Name & Expiration Form */}
                {creationStep === 2 && (
                  <form onSubmit={handleGenerate}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Display Name
                      </label>
                      <input 
                        type="text" 
                        className="text-input" 
                        placeholder='e.g. "Marketing Automation"'
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        maxLength={50}
                        required
                        style={{ width: '100%' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                        A display name for the key. Maximum 50 characters.
                      </span>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Expiration
                      </label>
                      <select 
                        className="select-input" 
                        value={expiration} 
                        onChange={(e) => setExpiration(e.target.value)}
                        style={{ width: '100%' }}
                      >
                        <option value="never">No expiration</option>
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                        <option value="60">60 Days</option>
                        <option value="90">90 Days</option>
                      </select>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                        {expiration === 'never' ? 'This key will not expire.' : `This key will expire in ${expiration} days.`}
                      </span>
                    </div>

                    {/* Default Mode (wizard) */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        <Zap size={13} /> Default Mode
                        <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }} title="Auto-applied when callers don't send a mode. Callers can still override per-request.">ⓘ</span>
                      </label>
                      <select className="select-input" value={defaultMode} onChange={(e) => setDefaultMode(e.target.value)} style={{ width: '100%' }}>
                        <option value="">No default (caller must specify)</option>
                        <option value="standard">Normal Mode — Fast, basic humanization</option>
                        <option value="human">Medium Mode — Balanced quality</option>
                        <option value="expert">Best Mode — Pro model rewrites</option>
                        <option value="bypass">⚡ Bypass Mode — Maximum AI-evasion</option>
                      </select>
                    </div>

                    {/* Default Voice Vault (wizard) */}
                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Default Voice Vault
                        <span style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.75rem', opacity: 0.7 }} title="Auto-applies this writing persona when the caller doesn't specify.">ⓘ</span>
                      </label>
                      <select className="select-input" value={defaultVoiceProfileId} onChange={(e) => setDefaultVoiceProfileId(e.target.value)} style={{ width: '100%' }}>
                        <option value="">No default (caller must specify)</option>
                        {voiceProfiles.map((vp) => (
                          <option key={vp.voiceProfileId} value={vp.voiceProfileId}>{vp.name}</option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                        These settings are baked into the key and applied automatically.
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <button 
                        type="button"
                        className="btn-secondary"
                        onClick={() => setCreationStep(1)}
                      >
                        Back
                      </button>
                      <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.8rem', borderRadius: '6px', background: 'var(--color-primary)' }}>
                        Submit
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SUCCESS KEY GENERATED MODAL (WITH CODE INTEGRATION TAB EXAMPLE EXCLUSIVELY SHOWN HERE) */}
      {/* 2. SUCCESS KEY GENERATED MODAL (WITH CODE INTEGRATION TAB EXAMPLE EXCLUSIVELY SHOWN HERE) */}
      {isSuccessModalOpen && generatedKey && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '750px',
            padding: '1.5rem 2.25rem',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h4 style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <ShieldAlert /> Cryptographic API Key Generated Successfully!
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '1rem' }}>
              Make sure to copy this credential now. For security purposes, we hash this key using SHA-256 and <strong style={{ color: 'var(--text-primary)' }}>never store the plaintext value</strong>. You will not be able to retrieve it again.
            </p>

            {/* Key String Input & Copy Icon Button */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem' }}>
              <input 
                type="text" 
                className="text-input" 
                style={{ 
                  flexGrow: 1, 
                  fontFamily: 'monospace', 
                  fontSize: '0.85rem', 
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  letterSpacing: '0.02em',
                  userSelect: 'all',
                  padding: '0.6rem 1rem'
                }} 
                value={generatedKey} 
                readOnly 
              />
              <button 
                className="btn-primary" 
                onClick={handleCopy} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  background: 'var(--color-primary)'
                }}
                title={copied ? 'Copied!' : 'Copy to clipboard'}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            {/* TAB CONTAINER FOR INTEGRATION EXAMPLES */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                Quick Integration Examples:
              </span>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--card-border)', marginBottom: '0.75rem', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setActiveCodeTab('curl')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: activeCodeTab === 'curl' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    background: 'transparent',
                    color: activeCodeTab === 'curl' ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Terminal size={14} /> cURL
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveCodeTab('js')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: activeCodeTab === 'js' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    background: 'transparent',
                    color: activeCodeTab === 'js' ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Code2 size={14} /> JavaScript
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveCodeTab('python')}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    borderBottom: activeCodeTab === 'python' ? '2px solid var(--color-primary)' : '2px solid transparent',
                    background: 'transparent',
                    color: activeCodeTab === 'python' ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Globe size={14} /> Python
                </button>
              </div>

              <div style={{ position: 'relative' }}>
                <button 
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getCodeSnippet());
                    setSnippetCopied(true);
                    setTimeout(() => setSnippetCopied(false), 2000);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '4px',
                    padding: '0.4rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Copy Code"
                >
                  {snippetCopied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                </button>
                <pre style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '1rem 1.25rem', 
                  borderRadius: '8px', 
                  border: '1px solid var(--card-border)', 
                  fontFamily: 'monospace', 
                  fontSize: '0.75rem', 
                  overflowX: 'auto', 
                  color: 'var(--text-primary)',
                  lineHeight: '1.5'
                }}>
                  {getCodeSnippet()}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-primary" 
                style={{ padding: '0.6rem 1.8rem', borderRadius: '6px', background: 'var(--color-primary)' }}
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  if (isFirstTimeWizard) {
                    setIsDoneModalOpen(true);
                  } else {
                    setGeneratedKey(null);
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. FINAL WORKSPACE CONFIGURED CONGRATULATIONS MODAL */}
      {isDoneModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '600px',
            padding: '1.75rem 2.25rem',
            textAlign: 'center',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <Check size={24} />
            </div>

            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              You're all set!
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Your workspace is configured and ready to go. Head to the dashboard to manage your keys and usage, or check out the docs to start building.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                className="btn-primary" 
                style={{ flex: 1, padding: '0.65rem', background: 'var(--color-primary)' }}
                onClick={() => {
                  setGeneratedKey(null);
                  setIsDoneModalOpen(false);
                }}
              >
                Go to Dashboard
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ flex: 1, padding: '0.65rem' }}
                onClick={() => {
                  setGeneratedKey(null);
                  setIsDoneModalOpen(false);
                }}
              >
                Read the Docs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. EDIT API KEY MODAL OVERLAY */}
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '600px',
            padding: '1.5rem 2.25rem',
            position: 'relative',
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <button 
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingKeyId(null);
                setEditKeyName('');
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Edit API Key
            </h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!editKeyName.trim() || !editingKeyId) return;
              setSavingEdit(true);
              const success = await updateApiKeyName(editingKeyId, editKeyName);
              setSavingEdit(false);
              if (success) {
                setIsEditModalOpen(false);
                setEditingKeyId(null);
                setEditKeyName('');
              }
            }}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  Display Name
                </label>
                <input 
                  type="text" 
                  className="text-input" 
                  placeholder='e.g. "Marketing Automation"'
                  value={editKeyName} 
                  onChange={(e) => setEditKeyName(e.target.value)} 
                  maxLength={50}
                  required
                  style={{ width: '100%' }}
                  disabled={savingEdit}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingKeyId(null);
                    setEditKeyName('');
                  }}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ padding: '0.6rem 1.8rem', borderRadius: '6px', background: 'var(--color-primary)' }}
                  disabled={savingEdit || !editKeyName.trim()}
                >
                  {savingEdit ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
