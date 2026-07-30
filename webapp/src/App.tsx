import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Landing from './components/Landing';
import Playground from './components/Playground';
import VoiceVault from './components/VoiceVault';
import ApiManagement from './components/ApiManagement';
import UserSettings from './components/UserSettings';
import Auth from './components/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './components/UserLayout';
import History from './components/History';
import CreditTransactions from './components/CreditTransactions';
import AdminLayout from './components/AdminLayout';
import AdminOverview from './components/AdminOverview';
import AdminTasks from './components/AdminTasks';
import AdminCosts from './components/AdminCosts';
import AdminUsers from './components/AdminUsers';
import Toast from './components/Toast';
export default function App() {
  const { user, authLoading, fetchProfile } = useAppStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#ffffff',
        position: 'relative'
      }}>
        <div className="bg-grid" style={{ display: 'block', opacity: 0.1 }}></div>
        <div className="spinner" style={{ borderLeftColor: '#3b82f6' }}></div>
        <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Verifying Identity...
        </p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public Login Route */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard/playground" replace /> : <Auth />} 
        />

        {/* Private User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserLayout />}>
            <Route index element={<Navigate to="playground" replace />} />
            <Route path="playground" element={<Playground />} />
            <Route path="voice-vault" element={<VoiceVault />} />
            <Route path="api" element={<ApiManagement />} />
            <Route path="history" element={<History />} />
            <Route path="transactions" element={<CreditTransactions />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>
        </Route>

        {/* Private Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="costs" element={<AdminCosts />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Route>

        {/* Fallback Redirection */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard/playground" : "/"} replace />} 
        />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}
