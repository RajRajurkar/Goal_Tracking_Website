import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Briefcase, Building, LogOut, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      return toast.error('New passwords do not match');
    }
    if (passwords.new_password.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      toast.success('Password updated successfully');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile & Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-primary-50 px-8 py-8 border-b border-gray-100">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {user?.name}
              </h2>
              <p className="text-primary-600 font-medium">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                <User size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg mr-4">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg mr-4">
                <Building size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Department</p>
                <p className="font-medium text-gray-900">{user?.department_id ? `Department #${user?.department_id}` : 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg mr-4">
                <Briefcase size={20} />
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="font-medium text-gray-900">{user?.role}</p>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-100" />

          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Lock size={20} className="mr-2 text-gray-500" />
            Security Settings
          </h3>
          
          <form onSubmit={handlePasswordChange} className="max-w-md space-y-4 mb-8">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current_password}
              onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
              required
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
              required
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm_password}
              onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
              required
              placeholder="Confirm new password"
            />
            <Button type="submit" loading={loading} className="w-full">
              Update Password
            </Button>
          </form>
          
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-medium"
            >
              <LogOut size={18} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default Settings;
