import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Link } from 'react-router-dom';
import { Target, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" />;
    if (user?.role === 'MANAGER') return <Navigate to="/manager/dashboard" />;
    return <Navigate to="/employee/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-primary-200 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <Target size={32} className="text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Goal Tracker Portal</h1>
          <p className="text-primary-100">Sign in to manage your goals</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your.email@company.com"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />

            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-primary-100 text-sm mt-6">
          © 2026 Goal Tracker Portal. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;