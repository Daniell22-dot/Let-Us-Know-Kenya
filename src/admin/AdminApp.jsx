import React, { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import AdminSidebar from './components/AdminSidebar.jsx'
import DashboardStats from './components/DashboardStats.jsx'
import PodcastsAdmin from './pages/PodcastsAdmin.jsx'
import BlogAdmin from './pages/BlogAdmin.jsx'
import ResourcesAdmin from './pages/ResourcesAdmin.jsx'
import StartupsAdmin from './pages/StartupsAdmin.jsx'
import ResearchAdmin from './pages/ResearchAdmin.jsx'
import Analytics from './pages/Analytics.jsx'
import JobsAdmin from './pages/JobsAdmin.jsx'
import ReviewsAdmin from './pages/ReviewsAdmin.jsx'
import UsersAdmin from './pages/UsersAdmin.jsx'
import SubscribersAdmin from './pages/SubscribersAdmin.jsx'
import ActivityAdmin from './pages/ActivityAdmin.jsx'
import MarketAdmin from './pages/MarketAdmin.jsx'
import { logout, getCurrentUser } from '../shared/utils/auth'
import './styles/admin.css'

function AdminApp() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()
  const admin = getCurrentUser()

  const handleLogout = () => {
    logout()
    navigate('/admin', { replace: true })
  }

  const initial = (admin?.name || admin?.username || admin?.email || 'A').charAt(0).toUpperCase()

  return (
    <div className="admin-container">
      <AdminSidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        onLogout={handleLogout}
      />

      <div className={`admin-main ${isCollapsed ? 'collapsed' : ''}`}>
        <header className="admin-header">
          <div className="header-left">
            <h1 className="text-xl font-bold text-[#1e293b]">LUK Kenya Admin</h1>
            <span className="bg-[#00a84f] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md">
              Editor Dashboard
            </span>
          </div>
          <div className="header-right">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-[#1e293b] leading-tight">
                  {admin?.name || admin?.username || 'Administrator'}
                </div>
                <div className="text-xs text-gray-500">{admin?.role === 'admin' ? 'Administrator' : admin?.email}</div>
              </div>
              <div
                title={admin?.email || ''}
                className="w-10 h-10 bg-[#00a84f] rounded-lg flex items-center justify-center text-white font-bold shadow-md"
              >
                {initial}
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Routes>
            <Route path="/" element={<DashboardStats />} />
            <Route path="/podcasts" element={<PodcastsAdmin />} />
            <Route path="/blog" element={<BlogAdmin />} />
            <Route path="/resources" element={<ResourcesAdmin />} />
            <Route path="/startups" element={<StartupsAdmin />} />
            <Route path="/research" element={<ResearchAdmin />} />
            <Route path="/jobs" element={<JobsAdmin />} />
            <Route path="/reviews" element={<ReviewsAdmin />} />
            <Route path="/users" element={<UsersAdmin />} />
            <Route path="/subscribers" element={<SubscribersAdmin />} />
            <Route path="/activity" element={<ActivityAdmin />} />
            <Route path="/market" element={<MarketAdmin />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminApp