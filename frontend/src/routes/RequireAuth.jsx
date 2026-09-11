import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/useAuthStore';

export function RequireAuth({ children, roles = [] }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-ner-bg text-slate-100 flex items-center justify-center p-4">
        <div className="tactical-glass p-8 rounded-2xl border border-red-500/50 max-w-md text-center space-y-4">
          <h2 className="text-xl font-black text-red-400 uppercase">Access Restricted</h2>
          <p className="text-xs text-slate-300">
            Your current role (<b className="capitalize">{user?.role?.replace('_', ' ')}</b>) is not authorized for this command console.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
