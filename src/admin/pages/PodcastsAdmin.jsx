import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Headphones, Play, X, Save, AlertTriangle } from 'lucide-react';
import api from '../../shared/services/api';

const CATEGORIES = ['Business', 'Technology', 'Environment', 'Culture', 'Innovation', 'Artificial Intelligence', 'Education', 'Health', 'Sports'];
const STATUSES = ['published', 'draft', 'pending'];

const emptyForm = () => ({ title: '', host: '', description: '', length: '', category: '', audioUrl: '', thumbnail: '', tags: '', status: 'draft', featured: false });

const PodcastsAdmin = () => {
  const [podcasts, setPodcasts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const data = await api.getPodcasts();
      setPodcasts(data);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingPodcast(null);
    setForm(emptyForm());
    setError('');
    setShowModal(true);
  };

  const openEdit = (podcast) => {
    setEditingPodcast(podcast);
    setForm({
      title: podcast.title || '',
      host: podcast.host || '',
      description: podcast.description || '',
      length: podcast.length || '',
      category: podcast.category || '',
      audioUrl: podcast.audioUrl || '',
      thumbnail: podcast.thumbnail || '',
      tags: Array.isArray(podcast.tags) ? podcast.tags.join(', ') : (podcast.tags || ''),
      status: podcast.status || 'draft',
      featured: podcast.featured || false
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.host.trim()) { setError('Host is required.'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      };
      if (editingPodcast) {
        const updated = await api.updatePodcast(editingPodcast.id, payload);
        setPodcasts(prev => prev.map(p => p.id === editingPodcast.id ? updated : p));
      } else {
        const created = await api.createPodcast(payload);
        setPodcasts(prev => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deletePodcast(id);
      setPodcasts(prev => prev.filter(p => p.id !== id));
      setDeleteConfirm(null);
    } catch {
      alert('Failed to delete podcast.');
    }
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#1e293b]">Manage Podcasts</h2>
        <button onClick={openNew} className="bg-[#00a84f] text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2">
          <Plus size={20} /> New Podcast
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="h-1 bg-[#00a84f]" />
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Podcast Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Host</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Plays</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Length</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                <div className="flex justify-center items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#00a84f] border-t-transparent rounded-full animate-spin" />
                  Fetching podcasts...
                </div>
              </td></tr>
            ) : podcasts.length > 0 ? podcasts.map((podcast) => (
              <tr key={podcast.id} className="hover:bg-[#00a84f]/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      {podcast.thumbnail
                        ? <img src={podcast.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-gray-200" />
                        : <div className="w-10 h-10 rounded-lg bg-[#00a84f]/10 flex items-center justify-center"><Headphones size={16} className="text-[#00a84f]" /></div>
                      }
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00a84f] rounded-full flex items-center justify-center">
                        <Play size={8} className="text-white" />
                      </div>
                    </div>
                    <span className="font-medium text-gray-900">{podcast.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{podcast.host}</td>
                <td className="px-6 py-4"><span className="font-medium text-[#00a84f]">{podcast.plays?.toLocaleString() || 0}</span></td>
                <td className="px-6 py-4 text-gray-600">{podcast.length}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${podcast.status === 'published' ? 'bg-green-100 text-green-700' : podcast.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>{podcast.status}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => openEdit(podcast)} className="p-2 text-gray-400 hover:text-[#00a84f] hover:bg-[#00a84f]/10 rounded-lg transition-all"><Edit2 size={18} /></button>
                  <button onClick={() => setDeleteConfirm(podcast.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No podcasts found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-bold text-[#1e293b]">{editingPodcast ? 'Edit Podcast' : 'New Podcast'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Title *</label>
                  <input {...field('title')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="Podcast title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Host *</label>
                  <input {...field('host')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="Host name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select {...field('category')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                  <input {...field('length')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="e.g. 45 min" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select {...field('status')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Audio URL</label>
                  <input {...field('audioUrl')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Thumbnail URL</label>
                  <input {...field('thumbnail')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tags (comma-separated)</label>
                  <input {...field('tags')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="kenya, business, tech" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea {...field('description')} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none resize-none" placeholder="Episode description..." />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="feat" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="accent-[#00a84f]" />
                  <label htmlFor="feat" className="text-sm text-gray-700">Featured episode</label>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#00a84f] text-white rounded-lg text-sm font-semibold hover:bg-[#00953f] flex items-center gap-2 disabled:opacity-60">
                  <Save size={15} /> {saving ? 'Saving...' : (editingPodcast ? 'Update Podcast' : 'Create Podcast')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete Podcast</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodcastsAdmin;
