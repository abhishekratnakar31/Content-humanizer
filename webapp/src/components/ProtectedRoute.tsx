import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface ProtectedRouteProps {
  allowedRoles?: ('user' | 'admin')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, authLoading } = useAppStore();

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        color: '#0f172a',
        position: 'relative'
      }}>
        <div className="bg-grid" style={{ display: 'block', opacity: 0.04 }}></div>
        <div className="spinner" style={{ borderLeftColor: '#1d4ed8' }}></div>
        <p style={{ marginTop: '1.5rem', color: '#64748b', fontFamily: 'var(--font-sans)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Verifying Identity...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard/playground" replace />;
  }

  return <Outlet />;
}
