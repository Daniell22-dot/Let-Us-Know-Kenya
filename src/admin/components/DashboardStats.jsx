import React, { useEffect, useState } from 'react';
import {
    BookOpen, Headphones, Briefcase, Map, FolderKanban, Star,
    Users, Mail, AlertTriangle, ArrowUpRight, LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../shared/services/api';

/**
 * Dashboard overview.
 *
 * The previous version displayed hardcoded growth figures ("+12.5%", "+8.2%")
 * and a decorative bar chart that were not connected to any data. Those numbers
 * looked like real metrics to anyone reading the screen, which is worse than
 * showing nothing. Everything here is now counted from the live API, and the
 * chart is replaced by a queue of items that genuinely need an admin decision.
 */

const StatCard = ({ label, value, icon: Icon, to, tone = 'from-[#1e293b] to-[#0f172a]' }) => (
    <Link
        to={to}
        className="bg-white p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-[#00a84f]/40 transition-all group"
    >
        <div className="flex items-center justify-between">
            <div className={`w-11 h-11 bg-gradient-to-br ${tone} rounded-lg flex items-center justify-center text-white shadow-md`}>
                <Icon size={20} />
            </div>
            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-[#00a84f] transition-colors" />
        </div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-4">{label}</p>
        <p className="text-3xl font-bold text-[#1e293b] mt-0.5">{value.toLocaleString()}</p>
    </Link>
);

const QueueItem = ({ count, label, to, tone = 'amber' }) => {
    if (!count) return null;
    const tones = {
        amber: 'border-amber-200 bg-amber-50 text-amber-800',
        red: 'border-red-200 bg-red-50 text-red-700'
    };
    return (
        <Link to={to} className={`flex items-center justify-between gap-3 border rounded-lg px-4 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 ${tones[tone]}`}>
            <span>{count} {label}</span>
            <ArrowUpRight size={15} />
        </Link>
    );
};

const DashboardStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        // Each fetch is allowed to fail on its own so one unreachable endpoint
        // cannot blank the whole dashboard.
        const safe = (promise) => promise.then((d) => (Array.isArray(d) ? d : [])).catch(() => []);

        (async () => {
            const [blogs, podcasts, resources, startups, jobs, projects, reviews, subscribers] = await Promise.all([
                safe(api.getBlogs()),
                safe(api.getPodcasts()),
                safe(api.getResources()),
                safe(api.getStartups()),
                safe(api.getJobs()),
                safe(api.getProjects()),
                safe(api.getReviews()),
                safe(api.getSubscribers())
            ]);

            if (cancelled) return;

            setStats({
                blogs, podcasts, resources, startups, jobs, projects, reviews, subscribers
            });
            setLoading(false);
        })();

        return () => { cancelled = true; };
    }, []);

    const cards = [
        { label: 'Blog posts', value: stats?.blogs.length, icon: BookOpen, to: '/admin/dashboard/blog' },
        { label: 'Podcasts', value: stats?.podcasts.length, icon: Headphones, to: '/admin/dashboard/podcasts' },
        { label: 'Resources', value: stats?.resources.length, icon: Map, to: '/admin/dashboard/resources' },
        { label: 'Startups', value: stats?.startups.length, icon: Briefcase, to: '/admin/dashboard/startups', tone: 'from-[#00a84f] to-[#007a38]' },
        { label: 'Projects', value: stats?.projects.length, icon: FolderKanban, to: '/admin/dashboard/projects' },
        { label: 'Jobs', value: stats?.jobs.length, icon: Briefcase, to: '/admin/dashboard/jobs', tone: 'from-[#c41e3a] to-[#9c1729]' },
        { label: 'Reviews', value: stats?.reviews.length, icon: Star, to: '/admin/dashboard/reviews', tone: 'from-[#c41e3a] to-[#9c1729]' },
        { label: 'Subscribers', value: stats?.subscribers.length, icon: Mail, to: '/admin/dashboard/subscribers', tone: 'from-[#00a84f] to-[#007a38]' }
    ].filter((c) => c.value !== undefined);

    // Items genuinely awaiting an admin decision.
    const pendingBlogs = (stats?.blogs || []).filter((b) => b.status === 'pending' || b.status === 'draft').length;
    const pendingStartups = (stats?.startups || []).filter((s) => s.status === 'pending').length;
    const pendingProjects = (stats?.projects || []).filter((p) => p.status === 'pending').length;
    const queue = pendingBlogs + pendingStartups + pendingProjects;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-3">
                    <LayoutDashboard size={24} className="text-[#00a84f]" />
                    Dashboard Overview
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Live counts across every content type, plus anything waiting for review.
                </p>
            </div>

            {loading ? (
                <div className="h-40 flex items-center justify-center text-gray-400">
                    <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00a84f] rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {cards.map((card) => (
                            <StatCard key={card.label} {...card} />
                        ))}
                    </div>

                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle size={18} className={queue ? 'text-amber-500' : 'text-[#00a84f]'} />
                            <h3 className="font-bold text-[#1e293b]">Needs attention</h3>
                        </div>
                        {queue === 0 ? (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#00a84f]" />
                                Nothing is waiting for review. All content is published.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <QueueItem count={pendingBlogs} label="blog posts awaiting publish" to="/admin/dashboard/blog" />
                                <QueueItem count={pendingStartups} label="startups awaiting approval" to="/admin/dashboard/startups" />
                                <QueueItem count={pendingProjects} label="projects awaiting publish" to="/admin/dashboard/projects" />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardStats;