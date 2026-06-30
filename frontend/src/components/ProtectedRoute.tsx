import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4">
        <div className="w-full max-w-md space-y-6">
          {/* Skeleton Loader */}
          <div className="h-8 bg-zinc-900 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="space-y-3">
            <div className="h-4 bg-zinc-900 rounded animate-pulse" />
            <div className="h-4 bg-zinc-900 rounded animate-pulse w-5/6 mx-auto" />
            <div className="h-4 bg-zinc-900 rounded animate-pulse w-2/3 mx-auto" />
          </div>
          <div className="h-12 bg-zinc-900 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
