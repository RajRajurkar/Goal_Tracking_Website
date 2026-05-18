import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  Target,
  CheckSquare,
  FileText,
  Users,
  Settings,
  BarChart3,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const employeeLinks = [
    { path: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employee/goals', icon: Target, label: 'My Goals' },
    { path: '/employee/create-goal', icon: Target, label: 'Create Goal' },
    { path: '/employee/checkin', icon: CheckSquare, label: 'Check-In' },
  ];

  const managerLinks = [
    { path: '/manager/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/manager/approvals', icon: CheckSquare, label: 'Approvals' },
    { path: '/manager/team-goals', icon: Target, label: 'Team Goals' },
    { path: '/manager/checkins', icon: Calendar, label: 'Check-Ins' },
    { path: '/manager/reports', icon: FileText, label: 'Reports' },
  ];

  const adminLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/cycles', icon: Calendar, label: 'Cycle Management' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
    { path: '/admin/escalations', icon: AlertCircle, label: 'Escalations' },
  ];

  const getLinks = () => {
    switch (user?.role) {
      case 'ADMIN':
        return adminLinks;
      case 'MANAGER':
        return managerLinks;
      case 'EMPLOYEE':
        return employeeLinks;
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out z-30',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button onClick={onClose} className="text-gray-600">
              <X size={24} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon size={20} className="mr-3" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={20} className="mr-3" />
              Settings
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;