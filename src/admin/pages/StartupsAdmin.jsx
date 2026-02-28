import React, { useState } from 'react';
import { CheckCircle, XCircle, TrendingUp, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../shared/services/api';

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700'
};

const StartupsAdmin = () => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  React.useEffect(() => {
    fetchStartups();
  }, []);

  const fetchStartups = async () => {
    try {
      const data = await api.getStartups();
      setStartups(data);
    } catch (error) {
      console.error('Error fetching startups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve');
    try {
      const updated = await api.approveStartup(id);
      setStartups(prev => prev.map(s => s.id === id ? { ...s, status: 'approved' } : s));
    } catch {
      alert('Failed to approve startup.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id + '-reject');
    try {
      await api.rejectStartup(id);
      setStartups(prev => prev.map(s => s.id === id ? { ...s, status: 'rejected' } : s));
    } catch {
      alert('Failed to reject startup.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = startups.filter(s => s.status === 'pending' || !s.status).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1e293b]">Startup Submissions</h2>
        <div className="flex gap-3">
          {pendingCount > 0 && (
            <span className="px-4 py-2 bg-[#00a84f] text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {pendingCount} Pending
            </span>
          )}
          <button onClick={fetchStartups} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 flex items-center gap-2 text-gray-600">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center py-20 bg-white rounded-lg border border-gray-200">
            <div className="w-10 h-10 border-4 border-[#00a84f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : startups.length > 0 ? startups.map((startup) => {
          const status = startup.status || 'pending';
          return (
            <div key={startup.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#00a84f]/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-[#00a84f]" size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{startup.name}</h4>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 max-w-xl">{startup.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      {startup.category && <span>Category: {startup.category}</span>}
                      {startup.createdAt && <span>Submitted: {new Date(startup.createdAt).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(startup.id)}
                      disabled={actionLoading === startup.id + '-approve'}
                      className="px-5 py-2.5 text-sm font-bold text-[#00a84f] hover:bg-[#00a84f]/10 rounded-lg transition-all flex items-center gap-2 border border-[#00a84f]/20 disabled:opacity-50"
                    >
                      {actionLoading === startup.id + '-approve'
                        ? <div className="w-4 h-4 border-2 border-[#00a84f] border-t-transparent rounded-full animate-spin" />
                        : <CheckCircle size={18} />}
                      Approve
                    </button>
                  )}
                  {status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(startup.id)}
                      disabled={actionLoading === startup.id + '-reject'}
                      className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 border border-gray-200 disabled:opacity-50"
                    >
                      {actionLoading === startup.id + '-reject'
                        ? <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        : <XCircle size={18} />}
                      Reject
                    </button>
                  )}
                  {startup.website && (
                    <a href={startup.website} target="_blank" rel="noopener noreferrer"
                      className="p-2.5 text-gray-400 hover:text-[#00a84f] hover:bg-[#00a84f]/10 rounded-lg transition-all border border-gray-200">
                      <ExternalLink size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center text-gray-500">
            <TrendingUp size={48} className="mx-auto mb-4 text-gray-300 opacity-20" />
            <p className="text-lg font-medium">No startup submissions found.</p>
            <p className="text-sm">New submissions will appear here for review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartupsAdmin;
