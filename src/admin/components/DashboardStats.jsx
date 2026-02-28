import React, { useState, useEffect } from 'react';
import { Users, Headphones, BookOpen, TrendingUp, ArrowUpRight, Briefcase } from 'lucide-react';
import api from '../../shared/services/api';

const DashboardStats = () => {
  const [counts, setCounts] = useState({ blogs: 0, podcasts: 0, startups: 0, resources: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [blogs, podcasts, startups, resources] = await Promise.all([
          api.getBlogs().catch(() => []),
          api.getPodcasts().catch(() => []),
          api.getStartups().catch(() => []),
          api.getResources().catch(() => [])
        ]);

        setCounts({
          blogs: blogs.length,
          podcasts: podcasts.length,
          startups: startups.length,
          resources: resources.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    {
      label: 'Blog Articles',
      value: counts.blogs,
      change: '+12.5%',
      icon: <BookOpen />,
      color: 'from-[#000000] to-[#1a1a1a]'
    },
    {
      label: 'Podcasts',
      value: counts.podcasts,
      change: '+8.2%',
      icon: <Headphones />,
      color: 'from-[#bf2f38] to-[#a02830]'
    },
    {
      label: 'Startups',
      value: counts.startups,
      change: '+15.3%',
      icon: <Briefcase />,
      color: 'from-[#00853e] to-[#006b31]'
    },
    {
      label: 'Resources',
      value: counts.resources,
      change: '+5.7%',
      icon: <TrendingUp />,
      color: 'from-[#000000] to-[#00853e]'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1e293b]">
          Dashboard Overview
        </h2>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00a84f]">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white shadow-md`}>
                {stat.icon}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-[#00a84f] bg-[#00a84f]/10 px-2 py-1 rounded-full">
                {stat.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-gray-500 text-sm font-medium relative z-10">{stat.label}</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1 relative z-10">
              {loading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                stat.value.toLocaleString()
              )}
            </h3>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 h-80 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[#00a84f]/10 rounded-lg flex items-center justify-center mb-4">
          <TrendingUp className="text-[#00a84f]" size={36} />
        </div>
        <h4 className="text-gray-700 font-semibold text-lg mb-2">Analytics Chart</h4>
        <p className="text-gray-400 text-sm max-w-xs text-center">
          Detailed analytics visualization will appear here once data integration is complete.
        </p>

        {/* Mini Chart Preview */}
        <div className="flex items-end gap-3 mt-6">
          {[45, 60, 35, 70, 55, 80, 65].map((height, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="w-3 bg-[#00a84f] rounded-t"
                style={{ height: `${height / 2}px` }}
              ></div>
              <span className="text-xs text-gray-400">M{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;