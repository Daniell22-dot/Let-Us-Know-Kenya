import React from 'react';
import { BarChart, TrendingUp, Users, MousePointer, ArrowUpRight } from 'lucide-react';

const Analytics = () => {
  const stats = [
    { label: 'Page Views', value: '45.2K', change: '+12.5%', icon: <TrendingUp size={20} /> },
    { label: 'Unique Visitors', value: '12.8K', change: '+8.2%', icon: <Users size={20} /> },
    { label: 'Avg. Session', value: '4m 32s', change: '+3.1%', icon: <MousePointer size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1e293b]">
          Platform Analytics
        </h2>
        <div className="flex gap-2">
          <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#00a84f] focus:border-transparent">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 12 Months</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#00a84f]/10 rounded-lg">
                <span className="text-[#00a84f]">{stat.icon}</span>
              </div>
              <span className="flex items-center text-xs font-medium text-[#00a84f] bg-[#00a84f]/10 px-2 py-1 rounded-full border border-[#00a84f]/20">
                {stat.change} <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm h-96 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-[#00a84f]/10 rounded-lg flex items-center justify-center mb-4">
          <BarChart className="text-[#00a84f]" size={32} />
        </div>
        <h4 className="text-gray-600 font-medium">Traffic Overview</h4>
        <p className="text-gray-400 text-sm max-w-xs mt-2">
          Detailed traffic charts will appear here once the data integration is complete.
        </p>

        {/* Mini Chart Decoration */}
        <div className="flex gap-2 mt-6">
          {[30, 45, 25, 60, 40, 55, 70].map((height, i) => (
            <div key={i} className="w-2 bg-[#00a84f] rounded-t" style={{ height: `${height / 2}px` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;