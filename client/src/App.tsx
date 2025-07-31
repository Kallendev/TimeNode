import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/components/dashboard/EmployeeDashboard';
import { useAuth } from '@/hooks/useAuth';

const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardRouter />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Admin Only Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <div className="text-white">Employee Management (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <Layout>
                  <div className="text-white">Reports (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Employee Routes */}
          <Route
            path="/time-tracker"
            element={
              <ProtectedRoute requiredRole="employee">
                <Layout>
                  <DashboardRouter />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <ProtectedRoute requiredRole="employee">
                <Layout>
                  <div className="text-white">Time History (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Settings Route */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-white">Settings (Coming Soon)</div>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;