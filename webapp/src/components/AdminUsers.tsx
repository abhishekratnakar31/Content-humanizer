import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Users, ShieldAlert, Edit3, X, Shield, User, Trash2, CreditCard } from 'lucide-react';

export default function AdminUsers() {
  const { adminUsers, adminFetchUsers, adminUpdateUserConfig, adminDeleteUser } = useAppStore();
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // Form states for the left configuration panel
  const [panelRole, setPanelRole] = useState<string>('user');
  const [panelCredits, setPanelCredits] = useState<number>(0);
  const [panelStatus, setPanelStatus] = useState<string>('active');
  const [panelDisableApiKeys, setPanelDisableApiKeys] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    adminFetchUsers();
  }, []);

  const handleOpenPanel = (userItem: any) => {
    setSelectedUser(userItem);
    setPanelRole(userItem.role || 'user');
    setPanelCredits(userItem.credits || 0);
    setPanelStatus(userItem.status || 'active');
    setPanelDisableApiKeys(false);
  };

  const handleClosePanel = () => {
    setSelectedUser(null);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    const success = await adminUpdateUserConfig(selectedUser.userId, {
      role: panelRole,
      credits: panelCredits,
      status: panelStatus,
      disableApiKeys: panelDisableApiKeys
    });
    setIsSubmitting(false);

    if (success) {
      handleClosePanel();
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Are you absolutely sure you want to delete ${selectedUser.email}? This action is permanent.`)) return;

    setIsSubmitting(true);
    const success = await adminDeleteUser(selectedUser.userId);
    setIsSubmitting(false);

    if (success) {
      handleClosePanel();
    }
  };

  const getCreationDateString = (createdAt: any) => {
    if (!createdAt) return 'N/A';
    if (typeof createdAt === 'object') {
      const seconds = createdAt._seconds !== undefined ? createdAt._seconds : createdAt.seconds;
      if (seconds !== undefined) {
        return new Date(seconds * 1000).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    }
    const date = new Date(createdAt);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'N/A';
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out', position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            Registered Platform Users <Users style={{ color: 'var(--color-primary)' }} />
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage registered customer profiles, monitor allocated credits, verify API scopes, and grant support credits.
          </p>
        </div>
      </div>

      {/* Users List Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
          <Users size={18} style={{ color: 'var(--color-primary)' }} /> Users Database
        </h3>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr style={{ borderBottomColor: 'var(--card-border)' }}>
                <th style={{ color: 'var(--text-secondary)' }}>User Email</th>
                <th style={{ color: 'var(--text-secondary)' }}>Access Role</th>
                <th style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ color: 'var(--text-secondary)' }}>Remaining Credits</th>
                <th style={{ color: 'var(--text-secondary)' }}>API Key Status</th>
                <th style={{ color: 'var(--text-secondary)' }}>Created At</th>
                <th style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adminUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No users found in Firestore.
                  </td>
                </tr>
              ) : (
                adminUsers.map((item) => (
                  <tr key={item.userId} style={{ borderBottomColor: 'var(--card-border)' }}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {item.email}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '0.15rem' }}>
                        ID: {item.userId}
                      </div>
                    </td>
                    <td>
                      <span className={`tag ${item.role === 'admin' ? 'tag-success' : 'tag-info'}`}>
                        {item.role || 'user'}
                      </span>
                    </td>
                    <td>
                      <span className={`tag ${item.status === 'suspended' ? 'tag-danger' : 'tag-success'}`}>
                        {item.status || 'active'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-secondary)' }}>
                      {item.credits !== undefined ? item.credits.toLocaleString() : '0'}
                    </td>
                    <td>
                      <span className={`tag ${item.hasCreatedKey ? 'tag-success' : 'tag-warning'}`}>
                        {item.hasCreatedKey ? 'Key Generated' : 'No Keys'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {getCreationDateString(item.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenPanel(item)}
                        className="tag tag-info"
                        style={{ 
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.5rem'
                        }}
                      >
                        <Edit3 size={12} /> Configure
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--color-primary)', lineHeight: 1.5 }}>
          <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--color-info)' }} />
          <div>
            <strong>Administrator Configuration Console:</strong> Click the "Configure" action to launch the slide-in settings panel to adjust credentials, roles, key statuses, and administrative tiers.
          </div>
        </div>
      </div>

      {/* Slide-out configuration drawer from Left */}
      {selectedUser && (
        <div 
          onClick={handleClosePanel}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '420px',
              maxWidth: '90vw',
              background: '#ffffff',
              height: '100%',
              boxShadow: '10px 0 35px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem 1.75rem',
              animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Configure Profile</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {selectedUser.userId}</span>
              </div>
              <button 
                onClick={handleClosePanel}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingRight: '4px' }}>
              
              {/* User Email Readonly */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>User Email</label>
                <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {selectedUser.email}
                </div>
              </div>

              {/* Edit Role */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Access Role</label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => setPanelRole('user')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: panelRole === 'user' ? 'var(--color-primary)' : '#e2e8f0',
                      background: panelRole === 'user' ? 'rgba(29, 78, 216, 0.05)' : '#ffffff',
                      color: panelRole === 'user' ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <User size={16} /> User
                  </button>
                  <button 
                    onClick={() => setPanelRole('admin')}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: panelRole === 'admin' ? 'var(--color-primary)' : '#e2e8f0',
                      background: panelRole === 'admin' ? 'rgba(29, 78, 216, 0.05)' : '#ffffff',
                      color: panelRole === 'admin' ? 'var(--color-primary)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Shield size={16} /> Admin
                  </button>
                </div>
              </div>

              {/* Edit Status */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>User Status</label>
                <select 
                  value={panelStatus} 
                  onChange={(e) => setPanelStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.9rem',
                    background: '#ffffff',
                    color: 'var(--text-primary)',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Adjust/Edit Credits */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Credit Pool Balance</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="number" 
                    value={panelCredits}
                    onChange={(e) => setPanelCredits(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>Directly adjust the credit quota to grant or restrict platform usage.</span>
              </div>

              {/* Disable API Keys Option */}
              {selectedUser.hasCreatedKey && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', marginTop: '0.5rem' }}>
                  <input 
                    type="checkbox"
                    id="disableApi"
                    checked={panelDisableApiKeys}
                    onChange={(e) => setPanelDisableApiKeys(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="disableApi" style={{ fontSize: '0.85rem', fontWeight: 500, color: '#92400e', cursor: 'pointer' }}>
                    Revoke and disable all generated API keys
                  </label>
                </div>
              )}

              {/* Danger Zone: Remove User */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.75rem' }}>Danger Zone</h4>
                <button 
                  onClick={handleDeleteUser}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    color: '#ef4444',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#fef2f2'}
                >
                  <Trash2 size={16} /> Delete User Profile
                </button>
              </div>

            </div>

            {/* Drawer Footer Actions */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={handleClosePanel}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slide-in styles injected dynamically */}
      <style>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>

    </div>
  );
}
