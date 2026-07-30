import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Database, Cpu, ArrowLeft, Activity, Sliders, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminLayout() {
  const { user } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`dashboard-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Background Grids */}
      <div className="bg-grid"></div>

      {/* Admin Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div>
          {/* Logo */}
          <div className="nav-logo" style={{ 
            marginBottom: '2.5rem',
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
                    fontSize: '1.25rem', 
                    color: '#0f172a',
                    letterSpacing: '-0.03em',
                    lineHeight: 1
                  }}>Content Humanizer</span>
                  <span style={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontWeight: 600, 
                    fontSize: '0.65rem', 
                    color: '#64748b',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    marginTop: '0.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    Admin Panel <div className="pulsing-dot" style={{ width: '6px', height: '6px' }}></div>
                  </span>
                </div>
              </div>
            ) : (
              <span style={{ 
                fontFamily: 'var(--font-sans)', 
                fontWeight: 800, 
                fontSize: '1.75rem', 
                color: '#8b5cf6',
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

          {/* Navigation Links */}
          <ul className="nav-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
            <li>
              <NavLink 
                to="/admin/overview"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "System Overview" : undefined}
              >
                <Activity size={18} />
                {!isCollapsed && <span>System Overview</span>}
              </NavLink>
            </li>
            
            <li>
              <NavLink 
                to="/admin/tasks"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Task Manager" : undefined}
              >
                <Database size={18} />
                {!isCollapsed && <span>Task Manager</span>}
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/admin/costs"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Cost Analytics" : undefined}
              >
                <Cpu size={18} />
                {!isCollapsed && <span>Cost Analytics</span>}
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/admin/models"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Model Config" : undefined}
              >
                <Sliders size={18} />
                {!isCollapsed && <span>Model Config</span>}
              </NavLink>
            </li>

            <li>
              <NavLink 
                to="/admin/users"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ textDecoration: 'none' }}
                title={isCollapsed ? "Users Manager" : undefined}
              >
                <Users size={18} />
                {!isCollapsed && <span>Users Manager</span>}
              </NavLink>
            </li>

            {/* Switch to User workspace */}
            <li style={{ marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <Link 
                to="/dashboard/playground" 
                className="user-switch-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: isCollapsed ? '0' : '0.75rem',
                  padding: isCollapsed ? '0.85rem' : '0.85rem 1rem',
                  color: '#1d4ed8',
                  borderRadius: '8px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  background: 'rgba(29, 78, 216, 0.08)',
                  border: '1px solid rgba(29, 78, 216, 0.15)',
                  boxShadow: '0 4px 12px rgba(29, 78, 216, 0.05)',
                  transition: 'all 0.2s ease-in-out',
                  width: '100%'
                }}
                title={isCollapsed ? "User Workspace" : undefined}
              >
                <ArrowLeft size={16} />
                {!isCollapsed && <span>User Workspace</span>}
              </Link>
            </li>
          </ul>
        </div>

        {/* Admin user stats */}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? '0' : '0.5rem', overflow: 'hidden', width: '100%', justifyContent: 'center' }}>
              <div style={{ 
                width: '28px', 
                height: '28px', 
                borderRadius: '50%', 
                background: '#a855f7', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                flexShrink: 0
              }}>
                {user.email?.[0].toUpperCase() || 'A'}
              </div>
              {!isCollapsed && (
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user.email}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600 }}>
                    System Administrator
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
    </div>
  );
}
