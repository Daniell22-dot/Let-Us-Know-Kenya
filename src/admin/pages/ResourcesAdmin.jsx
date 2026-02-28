import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MapPin, Coffee, Users, Mountain, Wifi, X, Save, AlertTriangle } from 'lucide-react';
import api from '../../shared/services/api';

const RESOURCE_TYPES = ['natural', 'human'];
const NAT_CATEGORIES = ['agriculture', 'wildlife', 'energy', 'water', 'forest', 'mineral'];
const HUM_CATEGORIES = ['talent', 'education', 'healthcare', 'tourism', 'technology'];
const REGIONS = ['Nairobi', 'Coast', 'Rift Valley', 'Western', 'Nyanza', 'Central', 'Eastern', 'North Eastern'];

const emptyForm = () => ({ name: '', type: 'natural', region: '', category: '', description: '', economicValue: '', conservationStatus: '', tourismPotential: '' });

const getCategoryIcon = (cat) => {
  const icons = { agriculture: <Coffee size={20} />, wildlife: <Mountain size={20} />, energy: <Wifi size={20} />, talent: <Users size={20} /> };
  return icons[cat?.toLowerCase()] || <MapPin size={20} />;
};

const ResourcesAdmin = () => {
  const [naturalResources, setNaturalResources] = React.useState([]);
  const [humanResources, setHumanResources] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = useState('natural');
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');

  React.useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const data = await api.getResources();
      setNaturalResources(data.filter(r => r.type === 'natural'));
      setHumanResources(data.filter(r => r.type === 'human'));
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const listData = activeTab === 'natural' ? naturalResources : humanResources;
  const setListData = activeTab === 'natural' ? setNaturalResources : setHumanResources;

  const openNew = () => {
    setEditingResource(null);
    setForm({ ...emptyForm(), type: activeTab });
    setError('');
    setShowModal(true);
  };

  const openEdit = (resource) => {
    setEditingResource(resource);
    setForm({
      name: resource.name || '',
      type: resource.type || 'natural',
      region: resource.region || '',
      category: resource.category || '',
      description: resource.description || '',
      economicValue: resource.economicValue || '',
      conservationStatus: resource.conservationStatus || '',
      tourismPotential: resource.tourismPotential || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    try {
      if (editingResource) {
        const updated = await api.updateResource(editingResource.id, form);
        if (updated.type === 'natural') {
          setNaturalResources(prev => prev.map(r => r.id === editingResource.id ? updated : r));
          setHumanResources(prev => prev.filter(r => r.id !== editingResource.id));
        } else {
          setHumanResources(prev => prev.map(r => r.id === editingResource.id ? updated : r));
          setNaturalResources(prev => prev.filter(r => r.id !== editingResource.id));
        }
      } else {
        const created = await api.createResource(form);
        if (created.type === 'natural') setNaturalResources(prev => [created, ...prev]);
        else setHumanResources(prev => [created, ...prev]);
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
      await api.deleteResource(id);
      setNaturalResources(prev => prev.filter(r => r.id !== id));
      setHumanResources(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
    } catch {
      alert('Failed to delete resource.');
    }
  };

  const field = (key) => ({ value: form[key], onChange: e => setForm(f => ({ ...f, [key]: e.target.value })) });
  const cats = form.type === 'natural' ? NAT_CATEGORIES : HUM_CATEGORIES;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {['natural', 'human'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-[#00a84f] text-white shadow-md' : 'text-gray-500 hover:text-[#00a84f]'}`}>
              {tab === 'natural' ? 'Natural Resources' : 'Human Resources'}
            </button>
          ))}
        </div>
        <button onClick={openNew} className="bg-[#00a84f] text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2">
          <Plus size={20} /> Add Resource
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="h-1 bg-[#00a84f]" />
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="flex justify-center items-center gap-2">
                <div className="w-5 h-5 border-2 border-[#00a84f] border-t-transparent rounded-full animate-spin" />
                Fetching resources...
              </div>
            </div>
          ) : listData.length > 0 ? listData.map((resource) => (
            <div key={resource.id} className="p-6 flex items-center justify-between hover:bg-[#00a84f]/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-[#00a84f]/10">
                  <span className="text-[#00a84f]">
                    {activeTab === 'natural' ? getCategoryIcon(resource.category) : <Users size={24} />}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{resource.name}</h4>
                  <div className="flex items-center gap-3 text-sm mt-1">
                    <span className="flex items-center gap-1 text-[#00a84f]"><MapPin size={14} /> {resource.region}</span>
                    <span className="text-gray-300">•</span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-[#00a84f]/10 text-[#00a84f]">{resource.category}</span>
                  </div>
                  {resource.description && <p className="text-gray-500 text-sm mt-1 max-w-md line-clamp-1">{resource.description}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(resource)} className="p-2 text-gray-400 hover:text-[#00a84f] hover:bg-[#00a84f]/10 border border-gray-200 rounded-lg transition-all"><Edit2 size={18} /></button>
                <button onClick={() => setDeleteConfirm(resource.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 rounded-lg transition-all"><Trash2 size={18} /></button>
              </div>
            </div>
          )) : (
            <div className="p-12 text-center text-gray-500">No {activeTab} resources found.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-bold text-[#1e293b]">{editingResource ? 'Edit Resource' : 'Add Resource'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                  <input {...field('name')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="Resource name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                  <select {...field('type')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none">
                    {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                  <select {...field('category')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none">
                    <option value="">Select category</option>
                    {cats.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Region</label>
                  <select {...field('region')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none">
                    <option value="">Select region</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Economic Value</label>
                  <input {...field('economicValue')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="e.g. High" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Conservation Status</label>
                  <input {...field('conservationStatus')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="e.g. Protected" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Tourism Potential</label>
                  <input {...field('tourismPotential')} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none" placeholder="e.g. High" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea {...field('description')} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#00a84f] outline-none resize-none" placeholder="Resource description..." />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 bg-[#00a84f] text-white rounded-lg text-sm font-semibold hover:bg-[#00953f] flex items-center gap-2 disabled:opacity-60">
                  <Save size={15} /> {saving ? 'Saving...' : (editingResource ? 'Update Resource' : 'Add Resource')}
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
                <h3 className="font-bold text-gray-900">Delete Resource</h3>
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

export default ResourcesAdmin;
