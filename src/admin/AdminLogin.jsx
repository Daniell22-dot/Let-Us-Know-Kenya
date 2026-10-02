import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, Globe, Shield, AlertCircle } from 'lucide-react'
import { login } from '../shared/utils/auth'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/admin/dashboard')
      } else {
        setError(result.error || 'Sign in failed.')
      }
    } catch (err) {
      setError('Could not reach the server. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-14 h-14 bg-[#00a84f] rounded-lg flex items-center justify-center shadow-lg">
              <Globe className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">LUK KENYA</h1>
              <p className="text-white/80 text-sm">Admin Portal</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2 rounded-lg border border-white/30 text-sm">
            <Shield size={14} className="text-white" />
            <span className="text-white">Secure Access Only</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Green Accent Line */}
          <div className="h-1 bg-[#00a84f]"></div>

          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#1e293b]">Welcome Back</h2>
              <p className="text-gray-600 mt-2 text-sm">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200 flex items-start gap-3">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#1e293b] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-[#00a84f] focus:ring-2 focus:ring-[#00a84f]/20 outline-none transition-all text-sm"
                    placeholder="admin@lukkenya.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e293b] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:border-[#00a84f] focus:ring-2 focus:ring-[#00a84f]/20 outline-none transition-all pr-12 text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00a84f] hover:bg-[#008a42] text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center text-gray-600 text-xs">
              <p>
                No account? Run <span className="font-mono">npm run create-admin</span> in
                the <span className="font-mono">server/</span> directory.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-white/80 text-xs mt-8">
          <p>© 2026 LUK Kenya Admin Portal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
