import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../shared/services/api';
import { Search, BookOpen, Headphones, FileText, Map } from 'lucide-react';

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState({ blogs: [], podcasts: [], resources: [], projects: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) return;

        const fetchResults = async () => {
            setLoading(true);
            try {
                const data = await api.searchAll(query);
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    // calculate total results
    const totalResults = results.blogs.length + results.podcasts.length + results.resources.length + results.projects.length;

    if (!query) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                <Search size={48} className="text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800">Search Let Us Know Kenya</h1>
                <p className="text-gray-500 mt-2">Enter a search term above to find blogs, podcasts, and more.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-3xl font-bold text-[#1e293b]">Search Results</h1>
                    <p className="text-gray-600 mt-2 text-lg">
                        Showing results for <span className="font-bold text-[#00a84f]">"{query}"</span>
                    </p>
                    <div className="mt-2 text-sm text-gray-500 font-medium">Found {totalResults} matches</div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 border-4 border-[#00a84f] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <Search size={48} className="mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">No results found</h2>
                        <p className="text-gray-500 mt-2 max-w-md mx-auto">
                            We couldn't find anything matching your search. Try adjusting your keywords.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {/* Blogs */}
                        {results.blogs.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <BookOpen className="text-[#bf2f38]" />
                                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-[#bf2f38] pb-1 inline-block">Blogs</h2>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.blogs.map(blog => (
                                        <Link key={blog.id} to={`/blog/${blog.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 group transition-all">
                                            {blog.image && <img src={blog.image} alt={blog.title} className="w-full h-32 object-cover" />}
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 group-hover:text-[#bf2f38] line-clamp-2">{blog.title}</h3>
                                                <p className="text-sm text-gray-500 mt-2 line-clamp-2">{blog.excerpt}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Podcasts */}
                        {results.podcasts.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Headphones className="text-[#00a84f]" />
                                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-[#00a84f] pb-1 inline-block">Podcasts</h2>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {results.podcasts.map(podcast => (
                                        <div key={podcast.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 flex gap-4 transition-all">
                                            {podcast.thumbnail && <img src={podcast.thumbnail} alt={podcast.title} className="w-20 h-20 rounded-lg object-cover" />}
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 line-clamp-2">{podcast.title}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{podcast.host}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Resources */}
                        {results.resources.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Map className="text-[#000000]" />
                                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-[#000000] pb-1 inline-block">Resources</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {results.resources.map(resource => (
                                        <Link key={resource.id} to="/resources" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all">
                                            <h3 className="font-bold text-gray-900">{resource.name}</h3>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-1">{resource.description}</p>
                                            <div className="mt-2 text-xs font-semibold px-2 py-1 bg-gray-100 rounded inline-block uppercase">{resource.type}</div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects / Research */}
                        {results.projects.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="text-blue-600" />
                                    <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-blue-600 pb-1 inline-block">Research Projects</h2>
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {results.projects.map(project => (
                                        <Link key={project.id} to="/research" className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 transition-all flex h-full">
                                            {project.featuredImage && <img src={project.featuredImage} alt={project.title} className="w-32 object-cover hidden sm:block" />}
                                            <div className="p-4 flex-1">
                                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 mb-2">{project.title}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-2">{project.abstract}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchResultsPage;
