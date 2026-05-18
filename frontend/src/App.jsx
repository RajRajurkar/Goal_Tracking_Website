import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth & Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import CreateGoal from './pages/employee/CreateGoal';
import MyGoals from './pages/employee/MyGoals';
import EmployeeCheckIn from './pages/employee/CheckIn';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import Approvals from './pages/manager/Approvals';
import TeamGoals from './pages/manager/TeamGoals';
import ManagerCheckIns from './pages/manager/CheckIns';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import CycleManagement from './pages/admin/CycleManagement';
import Reports from './pages/admin/Reports';
import Analytics from './pages/admin/Analytics';
import AuditLogs from './pages/admin/AuditLogs';
import Escalations from './pages/admin/Escalations';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Employee Routes */}
          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/create-goal"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <CreateGoal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/goals"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyGoals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/checkin"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeCheckIn />
              </ProtectedRoute>
            }
          />

          {/* Manager Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/approvals"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <Approvals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/team-goals"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <TeamGoals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/checkins"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerCheckIns />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/reports"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/cycles"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CycleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/escalations"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Escalations />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;