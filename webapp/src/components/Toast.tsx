import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Toast() {
  const { toast, clearToast } = useAppStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        clearToast();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={20} style={{ color: '#10b981' }} />;
      case 'info':
        return <Info size={20} style={{ color: '#3b82f6' }} />;
      case 'error':
      default:
        return <AlertCircle size={20} style={{ color: '#ef4444' }} />;
    }
  };

  const getLeftStripColor = () => {
    switch (toast.type) {
      case 'success':
        return '#10b981';
      case 'info':
        return '#3b82f6';
      case 'error':
      default:
        return '#ef4444';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      background: '#ffffff',
      color: '#1f2937',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      padding: '1rem 1.25rem',
      minWidth: '320px',
      maxWidth: '450px',
      borderLeft: `4px solid ${getLeftStripColor()}`,
      animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: 'var(--font-sans)',
      pointerEvents: 'auto'
    }}>
      <style>{`
        @keyframes toastSlideIn {
          from {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexGrow: 1 }}>
        <div style={{ flexShrink: 0, marginTop: '2px' }}>
          {getIcon()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
            {toast.type === 'error' ? 'System Notification' : toast.type === 'success' ? 'Success' : 'Information'}
          </span>
          <span style={{ fontSize: '0.82rem', color: '#4b5563', lineHeight: '1.4', wordBreak: 'break-word' }}>
            {toast.message}
          </span>
        </div>
      </div>

      <button 
        onClick={clearToast}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          color: '#9ca3af',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px',
          transition: 'all 0.2s',
          marginLeft: '0.5rem',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.color = '#4b5563';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
