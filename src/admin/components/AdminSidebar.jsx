import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import KenyaMapLogo from './KenyaMapLogo'
import {
  LayoutDashboard, Headphones, BookOpen, Map, Users,
  TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight,
  Briefcase, BarChart, PlusCircle, FileText, Image
} from 'lucide-react'

const AdminSidebar = ({ isCollapsed, toggleSidebar, onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/dashboard/podcasts', label: 'Podcasts', icon: <Headphones size={20} /> },
    { path: '/admin/dashboard/blog', label: 'Blog Posts', icon: <BookOpen size={20} /> },
    { path: '/admin/dashboard/resources', label: 'Resources', icon: <Map size={20} /> },
    { path: '/admin/dashboard/startups', label: 'Startups', icon: <Briefcase size={20} /> },
    { path: '/admin/dashboard/research', label: 'Research', icon: <FileText size={20} /> },
    { path: '/admin/dashboard/analytics', label: 'Analytics', icon: <BarChart size={20} /> },
  ]

  const quickActions = [
    { label: 'New Post', icon: <PlusCircle size={16} />, onClick: () => navigate('/admin/dashboard/blog?new=true') },
    { label: 'Upload Media', icon: <Image size={16} />, onClick: () => alert('Upload Modal coming soon!') },
    { label: 'Generate Report', icon: <FileText size={16} />, onClick: () => alert('Generating PDF Report...') },
  ]

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Green Accent Stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#00a84f]"></div>

      <div className="sidebar-inner">
        {/* Logo */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-white p-0.5">
                <img src="/Kenyan_logo.jpeg" alt="LUK Kenya Logo" className="w-full h-full object-cover rounded-md" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-widest">ADMIN</h2>
                <div className="h-1 w-full bg-[#00a84f] rounded-full mt-1"></div>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="mb-8 flex justify-center">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-white p-0.5">
                <img src="/Kenyan_logo.jpeg" alt="LUK Kenya Logo" className="w-full h-full object-cover rounded-md" />
              </div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-8 w-7 h-7 bg-[#00a84f] rounded-full flex items-center justify-center text-white hover:shadow-lg transform hover:scale-110 transition-all z-10"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Content Management
              </h3>
            )}

            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? 'bg-[#00a84f] text-white font-semibold shadow-md'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                      <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                      {!isCollapsed && <span>{item.label}</span>}
                      {isActive && !isCollapsed && (
                        <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Quick Actions */}
          {!isCollapsed && (
            <div className="nav-section mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Quick Actions
              </h3>
              <div className="space-y-2 px-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 text-gray-300 rounded-lg hover:bg-[#00a84f]/20 hover:text-white transition-all text-sm group"
                  >
                    <span className="group-hover:text-[#00a84f]">{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom mt-auto">
          {!isCollapsed && (
            <div className="px-4 py-3 bg-white/5 rounded-lg mb-4 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Last Login</div>
              <div className="text-sm text-white flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00a84f] rounded-full animate-pulse"></span>
                Today, 14:30
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-500/20 hover:text-red-100 rounded-lg transition-all w-full group"
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar