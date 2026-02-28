import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, Globe } from 'lucide-react';
import api from '../../shared/services/api';

const ResearchAdmin = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: 'Spatial Ecology',
        abstract: '',
        authors: '',
        datePublished: new Date().toISOString().split('T')[0],
        thumbnail: '',
        documentUrl: '',
        status: 'published'
    });

    const categories = ['Spatial Ecology', 'Biodiversity', 'Climate Change', 'Urban Planning', 'Agriculture'];

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            ...project,
            datePublished: project.datePublished ? new Date(project.datePublished).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this research project?')) {
            try {
                await api.deleteProject(id);
                fetchProjects();
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProject) {
                await api.updateProject(editingProject.id, formData);
            } else {
                await api.createProject(formData);
            }
            setShowModal(false);
            fetchProjects();
            resetForm();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project');
        }
    };

    const resetForm = () => {
        setEditingProject(null);
        setFormData({
            title: '',
            category: 'Spatial Ecology',
            abstract: '',
            authors: '',
            datePublished: new Date().toISOString().split('T')[0],
            thumbnail: '',
            documentUrl: '',
            status: 'published'
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#1e293b]">Research Projects</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage academic and field research publications</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    Add Project
                </button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <div className="loading-spinner"></div>
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Project Details</th>
                                <th>Category</th>
                                <th>Authors</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-[#00a84f]/10 flex items-center justify-center text-[#00a84f]">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[#1e293b]">{project.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[300px]">{project.abstract}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{project.category}</span>
                                    </td>
                                    <td>
                                        <span className="text-sm text-gray-600 font-medium">{project.authors || 'Unknown'}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${project.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(project)}
                                                className="p-2 text-gray-400 hover:text-[#00a84f] hover:bg-[#00a84f]/10 rounded-lg transition-colors"
                                                title="Edit Project"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete Project"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-gray-500">
                                        No research projects found. Add your first study!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="modal-overlay absolute inset-0" onClick={() => setShowModal(false)}></div>
                    <div className="modal-content relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl p-6">
                        <h3 className="text-2xl font-bold text-[#1e293b] mb-6">
                            {editingProject ? 'Edit Project' : 'New Research Project'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="form-label">Project Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        required
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g. Kenya Butterfly Urban Adaptation Study"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Category</label>
                                    <select name="category" value={formData.category} onChange={handleInputChange} className="form-select">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="form-label">Authors</label>
                                    <input
                                        type="text"
                                        name="authors"
                                        value={formData.authors}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="e.g. John Doe, Jane Smith"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Date Published</label>
                                    <input
                                        type="date"
                                        name="datePublished"
                                        value={formData.datePublished}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className="form-select">
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="form-label">Thumbnail / Featured Image URL</label>
                                    <input
                                        type="url"
                                        name="thumbnail"
                                        value={formData.thumbnail}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="https://example.com/image.jpg"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="form-label">Abstract / Summary *</label>
                                    <textarea
                                        name="abstract"
                                        required
                                        value={formData.abstract}
                                        onChange={handleInputChange}
                                        className="form-input min-h-[120px] resize-y"
                                        placeholder="Brief summary of the research methodology and findings..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingProject ? 'Update Project' : 'Save Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResearchAdmin;
