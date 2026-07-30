import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { User, Mail, Award, Key, ChevronRight, LogOut, CreditCard, Cpu, History as HistoryIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import History from './History';
import CreditTransactions from './CreditTransactions';

interface UserSettingsProps {
  onClose?: () => void;
}

export default function UserSettings({ onClose }: UserSettingsProps) {
  const { user, apiKeys, updateProfileName, updateCustomKeys, addCredits, logout } = useAppStore();
  const [name, setName] = useState(user?.name || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'llmKeys' | 'billing' | 'history' | 'transactions'>((location.state as any)?.activeTab || 'profile');

  const [geminiKey, setGeminiKey] = useState(user?.geminiApiKey ? '••••••••••••••••' : '');
  const [openaiKey, setOpenaiKey] = useState(user?.openaiApiKey ? '••••••••••••••••' : '');
  const [openrouterKey, setOpenrouterKey] = useState(user?.openrouterApiKey ? '••••••••••••••••' : '');
  const [savingLlmKeys, setSavingLlmKeys] = useState(false);

  React.useEffect(() => {
    setGeminiKey(user?.geminiApiKey ? '••••••••••••••••' : '');
    setOpenaiKey(user?.openaiApiKey ? '••••••••••••••••' : '');
    setOpenrouterKey(user?.openrouterApiKey ? '••••••••••••••••' : '');
  }, [user?.geminiApiKey, user?.openaiApiKey, user?.openrouterApiKey]);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUpdatingName(true);
    await updateProfileName(name);
    setUpdatingName(false);
  };

  const handleSaveLlmKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLlmKeys(true);

    const keys: any = {};
    
    if (geminiKey === '') {
      keys.geminiApiKey = null;
    } else if (geminiKey !== '••••••••••••••••') {
      keys.geminiApiKey = geminiKey;
    } else {
      keys.geminiApiKey = user?.geminiApiKey || null;
    }

    if (openaiKey === '') {
      keys.openaiApiKey = null;
    } else if (openaiKey !== '••••••••••••••••') {
      keys.openaiApiKey = openaiKey;
    } else {
      keys.openaiApiKey = user?.openaiApiKey || null;
    }

    if (openrouterKey === '') {
      keys.openrouterApiKey = null;
    } else if (openrouterKey !== '••••••••••••••••') {
      keys.openrouterApiKey = openrouterKey;
    } else {
      keys.openrouterApiKey = user?.openrouterApiKey || null;
    }

    await updateCustomKeys(keys);
    setSavingLlmKeys(false);
  };

  const handleClearLlmKeys = async () => {
    if (window.confirm("Are you sure you want to clear all custom API keys? This will resume credit deduction.")) {
      setSavingLlmKeys(true);
      await updateCustomKeys({
        geminiApiKey: null,
        openaiApiKey: null,
        openrouterApiKey: null
      });
      setGeminiKey('');
      setOpenaiKey('');
      setOpenrouterKey('');
      setSavingLlmKeys(false);
    }
  };

  const handleUpgradePlan = async (pkgId: string, credits: number) => {
    setPurchasingPlan(pkgId);
    const tier = pkgId === 'pkg-3' ? 'enterprise' : pkgId === 'pkg-2' ? 'professional' : 'starter';
    setTimeout(async () => {
      await addCredits(credits, tier);
      setPurchasingPlan(null);
      alert(`Plan successfully updated to ${tier.toUpperCase()}! ${credits.toLocaleString()} credits added.`);
    }, 1500);
  };

  const handleLogoutClick = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/');
  };

  const packages = [
    { 
      id: 'pkg-1', 
      name: 'Starter Pack', 
      credits: 10000, 
      price: '15', 
      tier: 'starter',
      color: '#10b981',
      features: ['10,000 standard credits', 'Access to all 11 Agents', 'Up to 3 Voice Vault profiles']
    },
    { 
      id: 'pkg-2', 
      name: 'Professional', 
      credits: 50000, 
      price: '48', 
      tier: 'professional',
      popular: true,
      color: '#a855f7',
      features: ['50,000 standard credits', 'Access to all 11 Agents', 'Up to 6 Voice Vault profiles']
    },
    { 
      id: 'pkg-3', 
      name: 'Enterprise Hub', 
      credits: 200000, 
      price: '149', 
      tier: 'enterprise',
      color: '#f59e0b',
      features: ['200,000 standard credits', 'Access to all 11 Agents', 'Up to 10 Voice Vault profiles']
    }
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '480px' }}>
      
      {/* Modal Header */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
          Account Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Manage your personal details, developer credentials, and active subscription plan tier.
        </p>
      </div>

      {/* Two Column Layout: Left Vertical Sidebar, Right Content Panel */}
      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: '0' }}>
        
        {/* Left Column: Vertical Tabs & Logout Button */}
        <div style={{ 
          width: '220px', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          borderRight: '1px solid #e5e7eb', 
          paddingRight: '1.25rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'api', label: 'Developer API Keys', icon: Key },
              { id: 'llmKeys', label: 'Custom LLM Keys', icon: Cpu },
              { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
              { id: 'history', label: 'Humanization History', icon: HistoryIcon },
              { id: 'transactions', label: 'Transaction Ledger', icon: CreditCard }
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: isActive ? '#000000' : 'transparent',
                    color: isActive ? '#ffffff' : '#6b7280',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  <Icon size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Logout button at bottom of left sidebar */}
          <div style={{ paddingTop: '1.25rem', borderTop: '1px solid #e5e7eb', marginTop: '1.25rem' }}>
            <button 
              type="button"
              onClick={handleLogoutClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                width: '100%',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.12)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.12)';
              }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>

        {/* Right Column: Tab Content Pane */}
        <div style={{ flex: 1, minHeight: '0', overflowY: 'auto', paddingLeft: '0.5rem' }}>
          
          {activeTab === 'profile' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', maxWidth: '550px' }}>
              <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <User size={18} style={{ color: '#000000' }} /> Profile Information
                </h3>

                <form onSubmit={handleUpdateName} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem' }}>Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#4b5563', fontSize: '0.85rem' }}>
                      <Mail size={15} />
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem' }}>Full Name</label>
                    <input 
                      type="text" 
                      className="text-input" 
                      placeholder="Enter your name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      disabled={updatingName}
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px' }}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', borderRadius: '8px', background: '#000000' }}
                    disabled={updatingName || !name.trim() || name === user?.name}
                  >
                    {updatingName ? 'Saving Changes...' : 'Update Name'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', maxWidth: '550px' }}>
              <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                    <Key size={18} style={{ color: '#000000' }} /> Developer Credentials
                  </h3>
                  <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', fontWeight: 700, borderRadius: '4px', background: 'rgba(0, 0, 0, 0.05)', color: '#000000', border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    {apiKeys.length} Active Key{apiKeys.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Generate keys to integrate Content Humanizer directly into your own publishing workflows or backend pipelines.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {apiKeys.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                      No API keys created yet.
                    </div>
                  ) : (
                    apiKeys.map((keyObj) => (
                      <div 
                        key={keyObj.apiKeyId} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: '0.5rem 0.75rem', 
                          background: '#f9fafb', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px', 
                          fontSize: '0.8rem' 
                        }}
                      >
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{keyObj.name}</strong>
                          <span style={{ fontSize: '0.7rem', color: '#6b7280', display: 'block', marginTop: '0.1rem' }}>
                            Scope: {keyObj.scope} • Created {new Date(keyObj.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="tag tag-success" style={{ fontSize: '0.65rem' }}>Active</span>
                      </div>
                    ))
                  )}
                </div>

                <button 
                  type="button"
                  className="btn-secondary" 
                  style={{ width: '100%', marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.6rem', fontSize: '0.8rem', borderRadius: '8px' }} 
                  onClick={() => {
                    if (onClose) onClose();
                    navigate('/dashboard/api');
                  }}
                >
                  Configure Credentials <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'llmKeys' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out', maxWidth: '550px' }}>
              <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                  <Cpu size={18} style={{ color: '#000000' }} /> Custom LLM API Keys
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                  Save your own API keys to bypass platform credit billing. When configured, queries are routed directly through your providers, costing 0 credits.
                </p>

                <form onSubmit={handleSaveLlmKeys} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Gemini API Key</span>
                      {user?.geminiApiKey && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>✓ Configured</span>}
                    </label>
                    <input 
                      type="password" 
                      className="text-input" 
                      placeholder={user?.geminiApiKey ? "••••••••••••••••" : "Enter your Gemini API key"} 
                      value={geminiKey} 
                      onChange={(e) => setGeminiKey(e.target.value)} 
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>OpenAI API Key</span>
                      {user?.openaiApiKey && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>✓ Configured</span>}
                    </label>
                    <input 
                      type="password" 
                      className="text-input" 
                      placeholder={user?.openaiApiKey ? "••••••••••••••••" : "Enter your OpenAI API key"} 
                      value={openaiKey} 
                      onChange={(e) => setOpenaiKey(e.target.value)} 
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>OpenRouter API Key</span>
                      {user?.openrouterApiKey && <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>✓ Configured</span>}
                    </label>
                    <input 
                      type="password" 
                      className="text-input" 
                      placeholder={user?.openrouterApiKey ? "••••••••••••••••" : "Enter your OpenRouter API key"} 
                      value={openrouterKey} 
                      onChange={(e) => setOpenrouterKey(e.target.value)} 
                      style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem', borderRadius: '8px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', borderRadius: '8px', background: '#000000' }}
                      disabled={savingLlmKeys}
                    >
                      {savingLlmKeys ? 'Saving...' : 'Save API Keys'}
                    </button>
                    {(user?.geminiApiKey || user?.openaiApiKey || user?.openrouterApiKey) && (
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={handleClearLlmKeys}
                        style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}
                        disabled={savingLlmKeys}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
                
                {/* Left Column: Active Subscription card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="glass-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', boxShadow: 'none', padding: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                      <Award size={16} style={{ color: 'var(--color-accent)' }} /> Subscription Details
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Current Plan Tier</span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#000000', textTransform: 'capitalize', marginTop: '0.1rem' }}>
                          {user?.tier || 'starter'} Plan
                        </h4>
                      </div>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Credit Balance</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                          {(user?.credits || 0).toLocaleString()} credits
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pricing Selector Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {packages.map((pkg) => {
                    const isActive = user?.tier === pkg.tier;
                    return (
                      <div 
                        key={pkg.id} 
                        style={{ 
                          padding: '0.85rem 1rem', 
                          borderRadius: '12px', 
                          border: isActive ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.15)', 
                          display: 'flex', 
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          background: 'linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(5, 5, 5, 0.99) 100%)',
                          boxShadow: isActive ? '0 8px 24px rgba(0, 0, 0, 0.35)' : 'none',
                          position: 'relative',
                          textAlign: 'left'
                        }}
                      >
                        {pkg.popular && (
                          <span className="tag" style={{ 
                            position: 'absolute', 
                            top: '8px', 
                            right: '10px', 
                            fontSize: '0.6rem',
                            padding: '0.15rem 0.4rem',
                            background: '#ffffff',
                            color: '#000000',
                            borderRadius: '9999px',
                            fontWeight: 700,
                            border: 'none'
                          }}>
                            Best Value
                          </span>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>{pkg.name}</h4>
                            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.1rem' }}>
                              {pkg.credits.toLocaleString()} standard credits
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>US${pkg.price}</span>
                            <span style={{ fontSize: '0.65rem', color: '#cbd5e1', display: 'block' }}>USD / one-time</span>
                          </div>
                        </div>

                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.12)', paddingTop: '0.5rem' }}>
                          {pkg.features.slice(1).map((feat, fidx) => (
                            <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '0.65rem' }}>✓</span>
                              <span style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>{feat}</span>
                            </div>
                          ))}
                        </div>

                        <button 
                          type="button"
                          className="btn-primary" 
                          style={{ 
                            width: '100%', 
                            background: isActive ? 'transparent' : '#ffffff', 
                            border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : 'none', 
                            color: isActive ? '#ffffff' : '#000000', 
                            padding: '0.45rem', 
                            fontSize: '0.75rem', 
                            borderRadius: '8px', 
                            cursor: isActive ? 'default' : 'pointer',
                            fontWeight: 700,
                            boxShadow: isActive ? 'none' : '0 4px 12px rgba(255, 255, 255, 0.1)'
                          }}
                          disabled={isActive || purchasingPlan !== null}
                          onClick={() => handleUpgradePlan(pkg.id, pkg.credits)}
                        >
                          {isActive ? 'Current Plan' : purchasingPlan === pkg.id ? 'Upgrading...' : `Select ${pkg.name}`}
                        </button>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}
          {activeTab === 'history' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <History hideHeader={true} />
            </div>
          )}

          {activeTab === 'transactions' && (
            <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <CreditTransactions hideHeader={true} />
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
