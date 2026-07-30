import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Auth() {
  const { showToast } = useAppStore();
  // Removed offline mode for production environment
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      showToast("Passwords do not match", "error");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        showToast("Successfully signed up!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        showToast("Successfully signed in!", "success");
      }
    } catch (err: any) {
      console.error("Firebase email auth error: ", err);
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
      setError(friendlyMessage);
      showToast(friendlyMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showToast("Successfully signed in with Google!", "success");
    } catch (err: any) {
      console.error("Firebase Google sign in error: ", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        const msg = err.message || "Failed to sign in with Google.";
        setError(msg);
        showToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="auth-layout" style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8fafc',
      position: 'relative',
      zIndex: 1,
      fontFamily: 'var(--font-sans)',
      boxSizing: 'border-box'
    }}>
      {/* Left Side Branding Card Container (Swapped to Left) */}
      <div className="auth-branding-container" style={{
        flex: 1.2,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        boxSizing: 'border-box',
        minHeight: '100vh',
        background: '#f8fafc',
        justifyContent: 'center'
      }}>
        <div style={{
          flex: 1,
          background: 'linear-gradient(135deg, #070a13 0%, #0f172a 100%)',
          borderRadius: '24px',
          padding: '3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Subtle background decoration circles */}
          <div style={{
            position: 'absolute',
            top: '-10%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ zIndex: 1, maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.5rem', color: '#ffffff', letterSpacing: '-0.02em' }}>
              Effortlessly humanize and bypass AI detectors.
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1.1rem', lineHeight: 1.6, margin: 0 }}>
              Log in to access your evasion pipeline and humanize machine-generated content with enterprise-grade precision.
            </p>
          </div>

          {/* Overlapping Mockup Cards Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '350px',
            marginTop: '2rem',
            alignSelf: 'center',
            maxWidth: '520px'
          }}>
            {/* Card 1: Content Humanizer Sandbox (Back Card - Large Primary Dashboard) */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '0px',
              width: '85%',
              height: '280px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              zIndex: 1,
              opacity: 0.95,
              boxSizing: 'border-box'
            }}>
              <img 
                src="/sandbox_preview.png" 
                alt="Content Humanizer Sandbox" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top left'
                }}
              />
            </div>

            {/* Card 2: Voice Vault (Front Card - Smaller Overlay on Right) */}
            <div style={{
              position: 'absolute',
              top: '120px',
              left: '48%',
              width: '60%',
              height: '200px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              zIndex: 2,
              boxSizing: 'border-box'
            }}>
              <img 
                src="/voice_vault_preview.png" 
                alt="Voice Vault" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top left'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Form Container (Swapped to Right) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem 4rem 2rem 4rem',
        background: '#ffffff',
        position: 'relative',
        zIndex: 2,
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {/* Top Logo branding */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Content Humanizer
          </span>
        </div>

        {/* Center Form */}
        <div style={{
          width: '100%',
          maxWidth: '400px',
          margin: 'auto',
          padding: '2rem 0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {isSignUp ? 'Register to start humanizing machine-generated content.' : 'Enter your email and password to access your account.'}
          </p>

          {/* Error Notification */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              color: 'var(--color-danger)',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1', 
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
                <Mail size={16} style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem', 
                    borderRadius: '8px', 
                    border: '1px solid #cbd5e1', 
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Lock size={16} style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    style={{ 
                      width: '100%', 
                      padding: '0.75rem 2.5rem 0.75rem 2.5rem', 
                      borderRadius: '8px', 
                      border: '1px solid #cbd5e1', 
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box'
                    }} 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Lock size={16} style={{ 
                    position: 'absolute', 
                    left: '1rem', 
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
                marginTop: '1rem', 
                height: '46px',
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#222222'}
              onMouseOut={(e) => e.currentTarget.style.background = '#000000'}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderLeftColor: '#ffffff' }}></div>
              ) : (
                isSignUp ? 'Register' : 'Log In'
              )}
            </button>
          </form>

          {/* Third-Party Providers */}
          <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Or Login With
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.75rem',
              width: '100%',
              height: '44px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z" fill="#EA4335"/>
            </svg>
            Google Sign-In
          </button>

          <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>
              {isSignUp ? 'Already Have An Account? ' : "Don't Have An Account? "}
            </span>
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
              style={{
                background: 'none',
                border: 'none',
                color: '#000000',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Sign In Now.' : 'Register Now.'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
