import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Mail, Crown, Zap, Star, AlertCircle, CheckCircle, UserPlus, ArrowLeft, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/features/auth/store";

export default function Register() {
  const [step, setStep] = useState<'package' | 'registration' | 'success'>('package');
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'premium' | 'pro'>('basic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNewUserProcess, setIsNewUserProcess] = useState(false);
  const [prompt, setPrompt] = useState('');

  const { register, newUserProcess, loading, error, isAuthenticated, clearError } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const packages = [
    {
      id: 'basic' as const,
      name: 'Basic',
      price: 'Free',
      icon: Star,
      features: [
        'Browse listings',
        'Basic search filters',
        'Save favorites',
        'Basic profile'
      ],
      recommended: false,
    },
    {
      id: 'premium' as const,
      name: 'Premium',
      price: '€9.99/month',
      icon: Crown,
      features: [
        'Everything in Basic',
        'Advanced search filters',
        'Priority support',
        'Enhanced profile',
        'Message history',
        'Swipe mode'
      ],
      recommended: true,
    },
    {
      id: 'pro' as const,
      name: 'Pro',
      price: '€19.99/month',
      icon: Zap,
      features: [
        'Everything in Premium',
        'Unlimited listings',
        'Analytics dashboard',
        'API access',
        'Custom branding',
        'Dedicated support'
      ],
      recommended: false,
    },
  ];

  const handlePackageSelect = (packageId: typeof selectedPackage) => {
    setSelectedPackage(packageId);
    clearError();
  };

  const handleContinueToRegistration = () => {
    setStep('registration');
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim()) {
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      // TODO: Set local error state for password mismatch
      alert('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      if (isNewUserProcess && prompt.trim()) {
        await newUserProcess({
          email,
          prompt,
          packageId: selectedPackage,
        });
      } else {
        await register({
          email,
          password,
          confirmPassword,
          name: name.trim() || undefined,
          package: selectedPackage,
        });
      }
      // Redirect to home after successful registration
      navigate('/', {
        state: { message: 'Registration successful! Welcome to immofy.' },
        replace: true
      });
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleToggleNewUserProcess = () => {
    setIsNewUserProcess(!isNewUserProcess);
    setPrompt('');
    clearError();
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <div className="flex justify-start mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </button>
          </div>
          
          <div className="text-center">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
              <p className="text-gray-600 mb-6">
                We've sent you an email to complete your registration. Please check your inbox and follow the instructions.
              </p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                >
                  Go to Login
                </Link>
                <Link
                  to="/"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors inline-block"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'registration') {
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
              Complete Your Registration
            </h1>
            <p className="text-gray-600">
              Selected: <span className="font-medium">{packages.find(p => p.id === selectedPackage)?.name}</span> Package
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleRegistration} className="mt-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error.message}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) clearError();
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) clearError();
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) clearError();
                    }}
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
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) clearError();
                    }}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} className="text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* New User Process Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  id="newUserProcess"
                  type="checkbox"
                  checked={isNewUserProcess}
                  onChange={handleToggleNewUserProcess}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="newUserProcess" className="text-sm text-gray-700">
                  I'm looking for housing (add search preferences)
                </label>
              </div>

              {/* Prompt Field (conditional) */}
              {isNewUserProcess && (
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
                    What are you looking for?
                  </label>
                  <textarea
                    id="prompt"
                    name="prompt"
                    rows={3}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., I'm looking for a 2-room apartment in Berlin with balcony..."
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim() || password !== confirmPassword}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus size={20} />
              )}
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            </button>

            {/* Back Button */}
            <button
              type="button"
              onClick={() => setStep('package')}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Package Selection
            </button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Package selection step
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="flex justify-start mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <img src="/logo.png" alt="immofy Logo" className="w-10 h-10" />
            <h2 className="text-3xl font-bold text-gray-900">immofy</h2>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select the plan that best fits your needs. You can upgrade or downgrade at any time.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error.message}</span>
            </div>
          </div>
        )}

        {/* Package Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedPackage === pkg.id;
            
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
                } ${pkg.recommended ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                {pkg.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      Recommended
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <Icon size={32} className={`mx-auto mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                  <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{pkg.price}</p>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="text-center">
                  <div className={`w-4 h-4 rounded-full border-2 mx-auto ${
                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinueToRegistration}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continue with {packages.find(p => p.id === selectedPackage)?.name}
          </button>
          
          <div className="mt-4">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}