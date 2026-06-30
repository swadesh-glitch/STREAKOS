import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertCircle, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface AuthPageProps {
  isSignup?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ isSignup = false }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Eye toggle state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password match state — only show indicator when confirmPassword has content
  const passwordsMatch = isSignup && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = isSignup && confirmPassword.length > 0 && password !== confirmPassword;

  // Validate form fields
  const validateForm = () => {
    if (isSignup && !name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-zinc-100 font-sans selection:bg-accent selection:text-background">
      
      {/* Form Side */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:max-w-2xl bg-zinc-950/40 relative z-10">
        
        {/* Header Logo */}
        <div className="flex items-center space-x-2.5">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-accent/10 border border-accent/20">
              <Flame className="w-5 h-5 text-accent fill-accent/10" />
            </div>
            <span className="font-display font-bold text-lg tracking-wider text-white uppercase">
              Streak<span className="text-accent">OS</span>
            </span>
          </Link>
        </div>

        {/* Auth Box */}
        <div className="w-full max-w-md mx-auto my-auto py-12 space-y-8">
          <div className="space-y-3">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
              {isSignup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-zinc-400 text-sm font-light">
              {isSignup 
                ? 'Join StreakOS to start building consistency and gamify your rituals.' 
                : 'Enter your credentials to access your habit tracking dashboard.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10 transition-all duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password — signup only */}
            {isSignup && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <motion.input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    animate={
                      passwordsMismatch
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : { x: 0 }
                    }
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-zinc-600 focus:outline-none transition-all duration-200 ${
                      passwordsMatch
                        ? 'border-accent/60 focus:border-accent focus:ring-2 focus:ring-accent/15'
                        : passwordsMismatch
                        ? 'border-rose-500/60 focus:border-rose-500/80 focus:ring-2 focus:ring-rose-500/10'
                        : 'border-white/[0.06] focus:border-accent/40 focus:ring-2 focus:ring-accent/10'
                    }`}
                    required
                  />

                  {/* Eye toggle */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  {/* Match / Mismatch icon */}
                  <AnimatePresence mode="wait">
                    {passwordsMatch && (
                      <motion.span
                        key="match"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      </motion.span>
                    )}
                    {passwordsMismatch && (
                      <motion.span
                        key="mismatch"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      >
                        <XCircle className="w-4 h-4 text-rose-500" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Match status text */}
                <AnimatePresence>
                  {(passwordsMatch || passwordsMismatch) && (
                    <motion.p
                      key={passwordsMatch ? 'ok' : 'bad'}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        passwordsMatch ? 'text-accent' : 'text-rose-400'
                      }`}
                    >
                      {passwordsMatch ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Passwords match — you're good to go!
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Passwords don't match yet
                        </>
                      )}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (isSignup && confirmPassword.length > 0 && !passwordsMatch)}
              className="w-full py-3.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="text-center text-sm font-light text-zinc-400 pt-2">
            {isSignup ? (
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-medium hover:underline">
                  Sign In
                </Link>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <Link to="/signup" className="text-accent font-medium hover:underline">
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs font-light text-zinc-600 text-center">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>

      {/* Decorative Blob Side (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-zinc-950 to-background border-l border-white/[0.04] relative items-center justify-center p-12 overflow-hidden">
        {/* Glowing Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-96 h-96 bg-accent/5 rounded-full filter blur-[80px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute w-[450px] h-[450px] bg-emerald-500/[0.03] rounded-full filter blur-[100px]"
        />

        {/* Editorial Quote mockup */}
        <div className="relative max-w-lg space-y-6 text-left border border-white/[0.06] bg-zinc-950/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center space-x-2 text-zinc-400">
            <Flame className="w-5 h-5 text-accent" />
            <span className="text-xs uppercase tracking-wider font-semibold">StreakOS Rituals</span>
          </div>
          <p className="text-xl font-light leading-relaxed text-zinc-200 italic">
            "First we make our habits, then our habits make us. Consistency is the ultimate power multiplier."
          </p>
          <div className="border-t border-white/[0.06] pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Editorial Team</p>
              <p className="text-xs text-zinc-500 font-light">StreakOS Philosophy</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium border border-accent/20">
                Lvl 99 Core
              </span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
