import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthState } from '../services/AuthState';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Importações Lazy para otimização de bundle (Code Splitting)
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })));
const Pets = lazy(() => import('../pages/Pets').then(m => ({ default: m.Pets })));
const PetDetails = lazy(() => import('../pages/PetDetails').then(m => ({ default: m.PetDetails })));
const PetForm = lazy(() => import('../pages/PetForm').then(m => ({ default: m.PetForm })));
const Tutors = lazy(() => import('../pages/Tutors').then(m => ({ default: m.Tutors })));
const TutorDetails = lazy(() => import('../pages/TutorDetails').then(m => ({ default: m.TutorDetails })));
const TutorForm = lazy(() => import('../pages/TutorForm').then(m => ({ default: m.TutorForm })));

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <span className="text-gray-400 text-sm font-medium animate-pulse">Carregando...</span>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const isAuthorized = isAuthenticated || !!AuthState.getToken();

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

export function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const isAuthorized = isAuthenticated || !!AuthState.getToken();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthorized ? <Login /> : <Navigate to="/pets" replace />} 
        />

        <Route element={<ProtectedLayout />}>
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/novo" element={<PetForm />} />
          <Route path="/pets/:id" element={<PetDetails />} />

          <Route path="/tutores" element={<Tutors />} />
          <Route path="/tutores/novo" element={<TutorForm />} />
          <Route path="/tutores/:id" element={<TutorDetails />} />
          
          <Route path="/" element={<Navigate to="/pets" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/pets" replace />} />
      </Routes>
    </Suspense>
  );
}