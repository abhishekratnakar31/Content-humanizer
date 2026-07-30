import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, Shield, Key, Database, ChevronLeft, ChevronRight, History, CreditCard } from 'lucide-react';
import UserSettings from './UserSettings';

export default function UserLayout() {
  const { user } = useAppStore();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Background Grids */}
      <div className="bg-grid"></div>

      {/* Sidebar Panel */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
          <div className="nav-logo" style={{ 
            marginBottom: '2rem', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: isCollapsed ? 'center' : 'space-between', 
            width: '100%' 
          }}>
            {!isCollapsed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              </div>
            ) : (
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontWeight: 800, 
                fontSize: '1.75rem', 
                color: '#1d4ed8',
                letterSpacing: '-0.03em',
                lineHeight: 1
              }}>c</span>
            )}
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: '6px',
                transition: 'all 0.2s',
                marginLeft: isCollapsed ? '0' : '0.5rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
              onMouseOut={(e) => e.currentTarget.style.background = 'none'}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <ul className="nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
            <li>
              <NavLink 
                to="/dashboard/playground"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Playground" : undefined}
              >
                <Sparkles size={18} />
                {!isCollapsed && <span>Playground</span>}
              </NavLink>
            </li>

            
            <li>
              <NavLink 
                to="/dashboard/voice-vault"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Brand Voice" : undefined}
              >
                <Shield size={18} />
                {!isCollapsed && <span>Brand Voice</span>}
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/dashboard/api"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "API Management" : undefined}
              >
                <Key size={18} />
                {!isCollapsed && <span>API Management</span>}
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/dashboard/history"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "History" : undefined}
              >
                <History size={18} />
                {!isCollapsed && <span>History</span>}
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/dashboard/transactions"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Transactions" : undefined}
              >
                <CreditCard size={18} />
                {!isCollapsed && <span>Transactions</span>}
              </NavLink>
            </li>


            {user?.role === 'admin' && (
              <li style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <Link 
                  to="/admin/overview" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isCollapsed ? '0' : '0.75rem',
                    padding: isCollapsed ? '0.85rem' : '0.85rem 1rem',
                    color: '#8b5cf6',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.05)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                  className="admin-switch-btn"
                  title={isCollapsed ? "Admin Console" : undefined}
                >
                  <Database size={18} />
                  {!isCollapsed && <span>Admin Console</span>}
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* User Stats Card */}
        {user && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            justifyContent: 'center',
            alignItems: 'center',
            background: '#111827',
            color: '#ffffff',
            borderRadius: '8px',
            padding: isCollapsed ? '0.6rem' : '0.75rem 1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            gap: isCollapsed ? '0' : '0.5rem'
          }}>
            <div 
              onClick={() => setShowSettingsModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '0.5rem', overflow: 'hidden', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
              title="Account Settings"
            >
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                background: '#3b82f6', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                    {!!(user.geminiApiKey || user.openaiApiKey || user.openrouterApiKey) ? 'Unlimited (Own Keys)' : `${user.credits.toLocaleString()} Credits`}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main Panel */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Settings Modal Popup */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem'
        }}
        onClick={() => setShowSettingsModal(false)}
        >
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '900px',
            padding: '2.5rem 2rem 2rem 2rem',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowSettingsModal(false)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = '#1e293b'}
              onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <UserSettings onClose={() => setShowSettingsModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
