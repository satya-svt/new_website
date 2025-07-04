import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Phone,
  MessageSquare
} from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'forgot'
type AuthMethod = 'email' | 'phone'

export default function AuthPage() {
  const navigate = useNavigate()
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('')
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpCode, setOtpCode] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/form')
      }
    }
    checkAuth()

    // Listen for auth state changes (important for OAuth redirects)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/form')
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (authMode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        if (authMethod === 'email') {
          const { error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password
          })

          if (error) throw error

          setMessage('Check your email for verification link!')
          setMessageType('success')
        } else {
          // Phone signup
          const { error } = await supabase.auth.signUp({
            phone: formData.phone,
            password: formData.password
          })

          if (error) throw error

          setMessage('Check your phone for verification code!')
          setMessageType('success')
          setShowOtpInput(true)
        }
      } else if (authMode === 'login') {
        if (authMethod === 'email') {
          const { error } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          })

          if (error) throw error

          navigate('/form')
        } else {
          // Phone login
          const { error } = await supabase.auth.signInWithPassword({
            phone: formData.phone,
            password: formData.password
          })

          if (error) throw error

          navigate('/form')
        }
      } else if (authMode === 'forgot') {
        if (authMethod === 'email') {
          const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: `${window.location.origin}/reset-password`
          })

          if (error) throw error

          setMessage('Password reset email sent!')
          setMessageType('success')
        } else {
          setMessage('Phone password reset not supported. Please use email reset.')
          setMessageType('error')
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'An error occurred')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: formData.phone,
        token: otpCode,
        type: 'sms'
      })

      if (error) throw error

      setMessage('Phone verified successfully!')
      setMessageType('success')
      setShowOtpInput(false)
      navigate('/form')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'OTP verification failed')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthLogin = async (provider: 'google') => {
    setLoading(true)
    setMessage('')

    console.log('Starting Google OAuth flow...')

    try {
      // Get the current origin (Bolt project URL)
      const currentOrigin = window.location.origin
      const redirectUrl = `${currentOrigin}/form`

      // Use Supabase OAuth with proper redirect URL
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      })

      if (error) throw error

    } catch (error) {
      console.error('OAuth Error:', error)
      setMessage(error instanceof Error ? error.message : 'OAuth login failed')
      setMessageType('error')
      setLoading(false)
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  }

  // If showing OTP input, render OTP verification form
  if (showOtpInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial="initial"
          animate="in"
          variants={pageVariants}
          transition={pageTransition}
          className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
        >
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-white mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Verify Your Phone
            </motion.h1>
            <motion.p
              className="text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Enter the verification code sent to {formData.phone}
            </motion.p>
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center space-x-2 p-3 rounded-lg mb-6 ${messageType === 'success'
                  ? 'text-green-400 bg-green-900/20 border border-green-500/20'
                  : 'text-red-400 bg-red-900/20 border border-red-500/20'
                }`}
            >
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </motion.div>
          )}

          <form onSubmit={handleOtpVerification} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="otpCode" className="block text-sm font-medium text-gray-300 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="otpCode"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              whileHover={{ scale: loading || otpCode.length !== 6 ? 1 : 1.02 }}
              whileTap={{ scale: loading || otpCode.length !== 6 ? 1 : 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => {
                setShowOtpInput(false)
                setOtpCode('')
                setMessage('')
              }}
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Back to Sign Up
            </button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {authMode === 'login' ? 'Welcome Back' :
              authMode === 'signup' ? 'Create Account' :
                'Reset Password'}
          </motion.h1>
          <motion.p
            className="text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {authMode === 'login' ? 'Sign in to continue to FEED' :
              authMode === 'signup' ? 'Join us to get started' :
                'Enter your email to reset password'}
          </motion.p>
        </div>

        {/* Auth Method Toggle */}
        {authMode !== 'forgot' && (
          <motion.div
            className="flex bg-white/5 rounded-lg p-1 mb-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
          >
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${authMethod === 'email'
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${authMethod === 'phone'
                  ? 'bg-gray-700 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center space-x-2 p-3 rounded-lg mb-6 ${messageType === 'success'
                  ? 'text-green-400 bg-green-900/20 border border-green-500/20'
                  : 'text-red-400 bg-red-900/20 border border-red-500/20'
                }`}
            >
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Email or Phone Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor={authMethod} className="block text-sm font-medium text-gray-300 mb-2">
              {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            <div className="relative">
              {authMethod === 'email' ? (
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              ) : (
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              )}
              <input
                type={authMethod === 'email' ? 'email' : 'tel'}
                id={authMethod}
                value={authMethod === 'email' ? formData.email : formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [authMethod]: e.target.value
                }))}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                placeholder={authMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                required
              />
            </div>
          </motion.div>

          {authMode !== 'forgot' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>
          )}

          {authMode === 'signup' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-800 hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl group"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>
                  {authMode === 'login' ? `Sign In with ${authMethod === 'email' ? 'Email' : 'Phone'}` :
                    authMode === 'signup' ? `Create Account with ${authMethod === 'email' ? 'Email' : 'Phone'}` :
                      'Send Reset Email'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </motion.button>
        </form>

        {/* OAuth Google Button */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-black via-gray-900 to-black text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <motion.button
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              className="w-full inline-flex justify-center items-center gap-3 py-3 px-4 border border-white/20 rounded-lg bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span>Continue with Google</span>
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="mt-8 text-center space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {authMode === 'login' && (
            <>
              <button
                onClick={() => setAuthMode('forgot')}
                className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
              >
                Forgot Password?
              </button>
              <div>
                <span className="text-gray-400 text-sm">Don't have an account? </span>
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-white hover:text-gray-300 text-sm font-medium transition-colors duration-300"
                >
                  Sign up
                </button>
              </div>
            </>
          )}

          {authMode === 'signup' && (
            <div>
              <span className="text-gray-400 text-sm">Already have an account? </span>
              <button
                onClick={() => setAuthMode('login')}
                className="text-white hover:text-gray-300 text-sm font-medium transition-colors duration-300"
              >
                Sign in
              </button>
            </div>
          )}

          {authMode === 'forgot' && (
            <button
              onClick={() => setAuthMode('login')}
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Back to Sign In
            </button>
          )}

          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <Link
              to="/admin"
              className="text-gray-400 hover:text-white text-sm transition-colors duration-300"
            >
              Admin Access
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}