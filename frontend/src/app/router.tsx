import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { PlantsPage } from '../pages/PlantsPage';
import { PlantDetailsPage } from '../pages/PlantDetailsPage';
import { DiagnosisPage } from '../pages/DiagnosisPage';
import { CarePage } from '../pages/CarePage';
import { HistoryPage } from '../pages/HistoryPage';
import { LoginPage } from '../pages/LoginPage';
import { SettingsPage } from '../pages/SettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'plants', element: <PlantsPage /> },
      { path: 'plants/:id', element: <PlantDetailsPage /> },
      { path: 'diagnosis', element: <DiagnosisPage /> },
      { path: 'care', element: <CarePage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
]);
