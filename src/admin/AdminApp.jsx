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
import './styles/admin.css'

function AdminApp() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('luk_admin_token')
    navigate('/admin')
  }

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
            <h1 className="text-xl font-bold text-[#1e293b]">
              LUK Kenya Admin
            </h1>
            <span className="bg-[#00a84f] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md">
              Editor Dashboard
            </span>
          </div>
          <div className="header-right">
            <div className="flex items-center gap-3">
              <span className="admin-email">admin@lukkenya.com</span>
              <div className="w-10 h-10 bg-[#00a84f] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                A
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
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default AdminApp