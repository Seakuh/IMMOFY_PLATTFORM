import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Mail, Lock, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isAlternativeLogin, setIsAlternativeLogin] = useState(false);

  const { login, alternativeLogin, loading, error, isAuthenticated, clearError } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      if (isAlternativeLogin) {
        await alternativeLogin({
          username: formData.email,
          password: formData.password,
        });
      } else {
        await login({
          email: formData.email,
          password: formData.password,
        });
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/logo.png" alt="immofy Logo" className="w-10 h-10" />
            <h2 className="text-3xl font-bold text-gray-900">immofy</h2>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error.message}</span>
            </div>
          )}

          {/* Login Type Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              type="button"
              onClick={() => setIsAlternativeLogin(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !isAlternativeLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email Login
            </button>
            <button
              type="button"
              onClick={() => setIsAlternativeLogin(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAlternativeLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Username Login
            </button>
          </div>

          <div className="space-y-4">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {isAlternativeLogin ? 'Username' : 'Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type={isAlternativeLogin ? "text" : "email"}
                  autoComplete={isAlternativeLogin ? "username" : "email"}
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={isAlternativeLogin ? "Enter your username" : "Enter your email"}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 font-medium"
            >
              Forgot your password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn size={20} />
            )}
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>

          {/* Register Link */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}