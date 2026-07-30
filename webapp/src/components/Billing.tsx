import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CreditCard, Check, AlertCircle } from 'lucide-react';

export default function Billing() {
  const { user, addCredits } = useAppStore();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const handlePurchase = (pkgId: string, credits: number) => {
    setPurchasing(pkgId);
    const tier = pkgId === 'pkg-3' ? 'enterprise' : pkgId === 'pkg-2' ? 'professional' : 'starter';
    // Simulate stripe redirect & confirmation
    setTimeout(async () => {
      await addCredits(credits, tier);
      setPurchasing(null);
      alert(`Payment successful! ${credits.toLocaleString()} credits added to your account.`);
    }, 1500);
  };

  const packages = [
    { 
      id: 'pkg-1', 
      name: 'Starter Pack', 
      credits: 10000, 
      price: '15', 
      desc: '~100k words bypass. Perfect for freelance copywriters.',
      features: ['10,000 standard credits', 'Access to all 11 Agents', 'Up to 3 Voice Vault profiles', '90%+ AI Resistance Guarantee']
    },
    { 
      id: 'pkg-2', 
      name: 'Professional (Popular)', 
      credits: 50000, 
      price: '48', 
      desc: '~500k words bypass. Ideal for content agencies and sites.', 
      popular: true,
      features: ['50,000 standard credits', 'Access to all 11 Agents', 'Up to 6 Voice Vault profiles', '90%+ AI Resistance Guarantee']
    },
    { 
      id: 'pkg-3', 
      name: 'Enterprise Hub', 
      credits: 200000, 
      price: '149', 
      desc: '~2M words bypass. Best for bulk publishing syndicates.',
      features: ['200,000 standard credits', 'Access to all 11 Agents', 'Up to 10 Voice Vault profiles', '90%+ AI Resistance Guarantee']
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Credit & Billing Economics <CreditCard style={{ color: 'var(--color-primary)' }} />
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Top up credit balances securely. 1 Credit = 10 base words. Custom voices and Reflection levels apply multipliers.
        </p>
      </div>

      {/* Credit Status Card */}
      <div className="glass-card" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gradient-card)' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Current Balance</span>
          <h3 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
            {(user?.credits || 0).toLocaleString()} <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Credits</span>
          </h3>
        </div>
        
        <div style={{ textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <div>Approx. words left: <strong style={{ color: 'var(--text-primary)' }}>{((user?.credits || 0) * 10).toLocaleString()} words</strong></div>
          <div style={{ marginTop: '0.25rem' }}>Account Role: <span className="tag tag-success">{user?.role}</span></div>
          <div style={{ marginTop: '0.25rem' }}>Active Plan: <span className="tag tag-info" style={{ textTransform: 'capitalize' }}>{user?.tier || 'starter'}</span></div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="glass-card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              border: pkg.popular ? '1px solid var(--color-primary)' : '1px solid var(--card-border)',
              boxShadow: pkg.popular ? 'var(--shadow-glow)' : 'none'
            }}
          >
            {pkg.popular && (
              <span className="tag tag-info" style={{ position: 'absolute', top: '15px', right: '15px', fontSize: '0.7rem' }}>
                Most Popular
              </span>
            )}
            
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pkg.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{pkg.desc}</p>
              
              <div style={{ margin: '1.5rem 0' }}>
                <span style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>US${pkg.price}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}> USD / one-time</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {pkg.features.map((feat, fidx) => (
                  <li key={fidx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Check size={14} style={{ color: 'var(--color-success)' }} /> {feat}
                  </li>
                ))}
              </ul>
            </div>

            <button 
              className="btn-primary" 
              style={{ 
                width: '100%', 
                background: pkg.popular ? 'var(--gradient-primary)' : 'transparent', 
                border: pkg.popular ? 'none' : '1px solid var(--card-border)',
                color: pkg.popular ? '#ffffff' : 'var(--text-primary)'
              }}
              disabled={purchasing !== null}
              onClick={() => handlePurchase(pkg.id, pkg.credits)}
            >
              {purchasing === pkg.id ? 'Redirecting to Stripe...' : `Buy ${pkg.credits.toLocaleString()} Credits`}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(99, 102, 241, 0.02)' }}>
        <AlertCircle style={{ color: 'var(--color-primary)' }} />
        <div>
          <h4 style={{ fontSize: '0.95rem' }}>Transparent Economic Modifiers</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.2rem', lineHeight: '1.4' }}>
            Base charging rate is 1 Credit per 10 words. When reflection checks are enabled, the loops require more LLM compute: Basic = 1.0x, Advanced = 1.5x, Maximum = 2.0x. Custom Voice Vault profiles cost a 2.0x modifier due to pre-pipeline style-alignment. The multipliers stack.
          </p>
        </div>
      </div>
    </div>
  );
}
