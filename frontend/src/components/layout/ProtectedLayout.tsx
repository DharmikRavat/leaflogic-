import { Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { api } from '../../services/api';

export function ProtectedLayout() {
  return api.isAuthenticated() ? <AppLayout /> : <Navigate to="/login" replace />;
}