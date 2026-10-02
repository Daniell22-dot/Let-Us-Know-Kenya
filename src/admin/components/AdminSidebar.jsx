import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import KenyaMapLogo from './KenyaMapLogo';
import {
    LayoutDashboard, Headphones, BookOpen, Map, Briefcase, FileText,
    FolderKanban, Star, Users, Mail, History, TrendingUp, BarChart,
    LogOut, ChevronLeft, ChevronRight, PlusCircle
} from 'lucide-react';

const GROUPS = [
    {
        label: 'Overview',
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> }
        ]
    },
    {
        label: 'Content',
        items: [
            { path: '/admin/dashboard/blog', label: 'Blog Posts', icon: <BookOpen size={20} /> },
            { path: '/admin/dashboard/podcasts', label: 'Podcasts', icon: <Headphones size={20} /> },
            { path: '/admin/dashboard/research', label: 'Research Projects', icon: <FolderKanban size={20} /> }
        ]
    },
    {
        label: 'Opportunities',
        items: [
            { path: '/admin/dashboard/startups', label: 'Startups', icon: <Briefcase size={20} /> },
            { path: '/admin/dashboard/jobs', label: 'Jobs', icon: <FileText size={20} /> },
            { path: '/admin/dashboard/resources', label: 'Resources', icon: <Map size={20} /> }
        ]
    },
    {
        label: 'Audience',
        items: [
            { path: '/admin/dashboard/reviews', label: 'Reviews', icon: <Star size={20} /> },
            { path: '/admin/dashboard/subscribers', label: 'Subscribers', icon: <Mail size={20} /> },
            { path: '/admin/dashboard/users', label: 'Users', icon: <Users size={20} /> },
            { path: '/admin/dashboard/activity', label: 'Activity Log', icon: <History size={20} /> }
        ]
    },
    {
        label: 'Insights',
        items: [
            { path: '/admin/dashboard/market', label: 'Market Data', icon: <TrendingUp size={20} /> },
            { path: '/admin/dashboard/analytics', label: 'Analytics', icon: <BarChart size={20} /> }
        ]
    }
];

const AdminSidebar = ({ isCollapsed, toggleSidebar, onLogout }) => {
    const location = useLocation();

    // Exact match for the index route, prefix match for the rest, so a section
    // stays highlighted while you are inside it.
    const isActive = (path) =>
        path === '/admin/dashboard'
            ? location.pathname === path
            : location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#00a84f]"></div>

            <div className="sidebar-inner">
                <div className="sidebar-header">
                    {!isCollapsed && (
                        <div className="flex items-center gap-3 mb-6">
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
                        <div className="mb-6 flex justify-center">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center shadow-md bg-white p-0.5">
                                <img src="/Kenyan_logo.jpeg" alt="LUK Kenya Logo" className="w-full h-full object-cover rounded-md" />
                            </div>
                        </div>
                    )}

                    <button
                        onClick={toggleSidebar}
                        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        className="absolute -right-3 top-8 w-7 h-7 bg-[#00a84f] rounded-full flex items-center justify-center text-white hover:shadow-lg transform hover:scale-110 transition-all z-10"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {GROUPS.map((group) => (
                        <div key={group.label} className="nav-section">
                            {!isCollapsed && (
                                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4">
                                    {group.label}
                                </h3>
                            )}
                            {!isCollapsed && <div className="mb-3" />}
                            <ul className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.path);
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                title={isCollapsed ? item.label : undefined}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${active
                                                    ? 'bg-[#00a84f] text-white font-semibold shadow-md'
                                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                                    }`}
                                            >
                                                <span className="shrink-0">{item.icon}</span>
                                                {!isCollapsed && <span className="text-sm">{item.label}</span>}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}

                    {!isCollapsed && (
                        <div className="nav-section mt-6">
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-4">Quick Actions</h3>
                            <div className="px-4 pb-2">
                                <Link
                                    to="/admin/dashboard/blog?new=true"
                                    className="flex items-center gap-3 px-4 py-2.5 bg-white/5 text-gray-300 rounded-lg hover:bg-[#00a84f]/20 hover:text-white transition-all text-sm"
                                >
                                    <PlusCircle size={16} className="text-[#00a84f]" />
                                    <span>New Blog Post</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>

                <div className="sidebar-bottom mt-auto">
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
    );
};

export default AdminSidebar;