import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Headphones, BookOpen, Map, Users, Home, Search, FlaskConical, User, LogOut, TrendingUp } from 'lucide-react'
import { useAuth } from '../AuthContext';
import AuthModal from './AuthModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMenuOpen(false)
      setSearchQuery('')
    }
  }

  const navItems = [
    { path: '/', label: 'Home', icon: <Home size={16} /> },
    { path: '/podcasts', label: 'Podcasts', icon: <Headphones size={16} /> },
    { path: '/blog', label: 'Blog', icon: <BookOpen size={16} /> },
    { path: '/resources', label: 'Resources', icon: <Map size={16} /> },
    { path: '/market', label: 'Market', icon: <TrendingUp size={16} /> },
    { path: '/research', label: 'Research', icon: <FlaskConical size={16} /> },
    { path: '/about', label: 'About', icon: <Users size={16} /> }
  ]

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Green Stripe Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#00a84f]"></div>

        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <img src="/Kenyan_logo.jpeg" alt="LUK Kenya Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#1e293b] tracking-tight">
                  LET US KNOW
                </h1>
                <p className="text-xs text-[#00a84f] font-bold">KENYA</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-8">
              <div className="flex items-center gap-6">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1.5 font-medium text-sm transition-all relative group ${location.pathname === item.path
                      ? 'text-[#00a84f]'
                      : 'text-gray-600 hover:text-[#00a84f]'
                      }`}
                  >
                    {item.icon}
                    {item.label}
                    {location.pathname === item.path && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#00a84f]"></span>
                    )}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search LUK..."
                    className="w-32 lg:w-48 px-3 py-1.5 pr-8 bg-gray-100 rounded-lg border border-transparent focus:border-[#00a84f] focus:bg-white outline-none transition-all text-sm"
                  />
                  <button type="submit" className="absolute right-2 text-gray-500 hover:text-[#00a84f] transition-colors" title="Search">
                    <Search size={16} />
                  </button>
                </form>

                {isAuthenticated ? (
                  <div className="flex items-center gap-3 group relative">
                    <div className="w-8 h-8 rounded-full bg-[#00a84f]/10 text-[#00a84f] flex items-center justify-center font-bold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    {/* Hover dropdown for user */}
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                      <div className="px-4 py-2 border-b border-gray-50 mb-1">
                        <p className="font-bold text-xs text-[#1e293b] truncate">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/watchlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#00a84f] flex items-center gap-2">
                        <BookOpen size={14} /> My Watchlist
                      </Link>
                      <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="flex items-center gap-2 bg-[#1e293b] text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0f172a] transform hover:-translate-y-0.5 transition-all shadow-sm"
                  >
                    <User size={16} />
                    Sign In
                  </button>
                )}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-[#1e293b]"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-fade-in">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${location.pathname === item.path
                      ? 'bg-[#00a84f] text-white font-semibold'
                      : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 px-4">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search LUK..."
                    className="w-full px-4 py-2.5 pl-10 bg-gray-100 rounded-lg border-2 border-transparent focus:border-[#00a84f] focus:bg-white outline-none transition-all text-sm"
                  />
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                </form>
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </>
  )
}

export default Header
