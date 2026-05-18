import { Link } from 'react-router-dom';
import { Target, TrendingUp, Users, Shield, Zap, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../components/common/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-md">
                <Target className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
                Goal Tracker
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/login">
                <Button className="shadow-lg shadow-primary-500/30">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-50 via-white to-white" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6 border border-primary-100">
              <Sparkles size={16} />
              <span>Now with AI-Powered Goal Suggestions</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Align Your Team's Focus with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">Precision</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Empower your workforce to set, track, and achieve meaningful goals. Real-time insights, smart predictions, and seamless collaboration all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto flex items-center gap-2 shadow-xl shadow-primary-500/20 text-lg px-8">
                  Start Tracking Now
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <a href="#features" className="text-gray-600 hover:text-primary-600 font-medium px-6 py-3 transition-colors">
                Explore Features
              </a>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50" />
      </div>

      {/* Features Grid */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to drive performance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Built for modern teams who want to move fast and stay aligned.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="text-amber-500" size={24} />}
              title="AI-Powered Insights"
              description="Our built-in AI analyzes your goals, checks SMART criteria, and predicts year-end performance based on your current trajectory."
            />
            <FeatureCard 
              icon={<TrendingUp className="text-success-500" size={24} />}
              title="Real-time Tracking"
              description="Update progress instantly. Dynamic dashboards show you exactly where you stand with beautiful, easy-to-read charts."
            />
            <FeatureCard 
              icon={<Users className="text-primary-500" size={24} />}
              title="Manager Overviews"
              description="Managers get a birds-eye view of team performance, pending approvals, and comprehensive reports at the click of a button."
            />
            <FeatureCard 
              icon={<Shield className="text-indigo-500" size={24} />}
              title="Secure Workflows"
              description="Role-based access ensures that employees, managers, and admins only see the data they are authorized to interact with."
            />
            <FeatureCard 
              icon={<CheckCircle className="text-emerald-500" size={24} />}
              title="Quarterly Check-ins"
              description="Structured check-ins keep everyone accountable. Log achievements, calculate scores, and stay on track every single quarter."
            />
            <FeatureCard 
              icon={<Target className="text-rose-500" size={24} />}
              title="Organization Alignment"
              description="Link individual goals directly to high-level company thrust areas to ensure everyone is rowing in the same direction."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to transform your performance management?</h2>
          <p className="text-primary-200 mb-10 text-lg">Join thousands of employees already using Goal Tracker to achieve their best work.</p>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="px-10 py-4 text-lg bg-white text-primary-900 hover:bg-gray-50">
              Sign In to Your Workspace
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="text-primary-500" size={24} />
            <span className="text-xl font-bold text-white">Goal Tracker</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 Goal Tracker Inc. All rights reserved. Built for high-performing teams.
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 border border-gray-100">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

// Simple Sparkles icon since it wasn't imported from lucide-react initially
const Sparkles = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export default Landing;
