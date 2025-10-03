// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthGuard } from './components/common/AuthGuard';
import { BackofficeGuard } from './components/common/BackofficeGuard';
import { BackofficeRedirect } from './components/common/BackofficeRedirect';
import { Layout } from './components/common/Layout';
import { PublicLayout } from './components/common/PublicLayout';
import { BackofficeLayout } from './components/common/BackofficeLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { LandingPageNew } from './pages/LandingPageNew';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramDetailsPage } from './pages/ProgramDetailsPage';

// User Dashboard Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { CreateProgramPage } from './pages/CreateProgramPage';
import { SettingsPage } from './pages/SettingsPage';

// Backoffice Pages
// import { BackofficeDashboard } from './pages/backoffice/BackofficeDashboard';
import { UserManagement } from './pages/backoffice/UserManagement';
import { SystemConfiguration } from './pages/backoffice/SystemConfiguration';
import { ProgramManagement } from './pages/backoffice/ProgramManagement';
import { Analytics } from './pages/backoffice/Analytics';
import { CompanyManagement } from './pages/backoffice/CompanyManagement';
import { ApplicationManagement } from './pages/backoffice/ApplicationManagement';
import ApplicationReview from './pages/backoffice/ApplicationReview';
import { OrganizationManagement } from './pages/backoffice/OrganizationManagement';
import { AdminDashboard } from './pages/backoffice/AdminDashboard';
import { SuperadminDashboard } from './pages/backoffice/SuperadminDashboard';
import { ConfigSuperadmin } from './pages/backoffice/ConfigSuperadmin';

import { NotFoundPage } from './pages/NotFoundPage';
import { UserRole } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-secondary-50">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
              },
            }}
          />

          <Routes>
            {/* Routes publiques du frontoffice */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/new" element={<LandingPageNew />} />
            <Route path="/home" element={<PublicLayout><HomePage /></PublicLayout>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/programs" element={<ProgramsPage />} />
            <Route path="/programs/:id" element={<ProgramDetailsPage />} />

            {/* Routes protégées utilisateurs */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/my-applications"
              element={
                <AuthGuard>
                  <Layout>
                    <ApplicationsPage />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGuard>
                  <Layout>
                    <SettingsPage />
                  </Layout>
                </AuthGuard>
              }
            />
            <Route
              path="/create-program"
              element={
                <AuthGuard requiredRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <CreateProgramPage />
                  </Layout>
                </AuthGuard>
              }
            />

            {/* Routes backoffice */}
            <Route
              path="/backoffice"
              element={
                <BackofficeGuard>
                  <BackofficeLayout>
                    <BackofficeRedirect />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/admin"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ADMIN, UserRole.ANALYST, UserRole.ORGANIZATION]}>
                  <BackofficeLayout>
                    <AdminDashboard />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/superadmin"
              element={
                <BackofficeGuard requiredRoles={[UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <SuperadminDashboard />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/users"
              element={
                <BackofficeGuard requiredRoles={[UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <UserManagement />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/settings"
              element={
                <BackofficeGuard requiredRoles={[UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <SystemConfiguration />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/programs"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ADMIN, UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <ProgramManagement />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/analytics"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ADMIN, UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <Analytics />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/companies"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ANALYST, UserRole.ADMIN, UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <CompanyManagement />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/applications"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ANALYST, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ORGANIZATION]}>
                  <BackofficeLayout>
                    <ApplicationManagement />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/applications/:id"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ANALYST, UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.ORGANIZATION]}>
                  <BackofficeLayout>
                    <ApplicationReview />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/organizations"
              element={
                <BackofficeGuard requiredRoles={[UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <OrganizationManagement />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />
            <Route
              path="/backoffice/config_superadmin"
              element={
                <BackofficeGuard requiredRoles={[UserRole.SUPERADMIN]}>
                  <BackofficeLayout>
                    <ConfigSuperadmin />
                  </BackofficeLayout>
                </BackofficeGuard>
              }
            />

            {/* Route 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
