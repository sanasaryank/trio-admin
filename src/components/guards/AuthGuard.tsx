import { Navigate } from 'react-router-dom';
import { authAPI } from '@/api/mock';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Component to protect routes that require authentication
 */
export const AuthGuard = ({ children }: AuthGuardProps) => {
  if (!authAPI.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};
