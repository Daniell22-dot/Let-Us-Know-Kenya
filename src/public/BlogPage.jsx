import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Calendar, User, TrendingUp, Clock, BookOpen, Filter } from 'lucide-react'
import BlogCard from './components/BlogCard.jsx'
import { CardSkeleton } from './components/SkeletonLoaders.jsx'
import api from '../shared/services/api.js'

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [loading, setLoading] = useState(true)

  React.useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await api.getBlogs()
        setBlogPosts(data)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const categories = ['All', 'Innovation', 'Tourism', 'Agriculture', 'Technology', 'Business', 'Culture', 'Artificial Intelligence', 'Environment', 'Health']

  const filteredPosts = blogPosts
    .filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(post =>
      selectedCategory === 'All' || post.category === selectedCategory
    )
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'popular') return b.views - a.views
      if (sortBy === 'trending') return b.likes - a.likes
      return 0
    })

  const totalViews = blogPosts.reduce((sum, post) => sum + post.views, 0)
  const totalLikes = blogPosts.reduce((sum, post) => sum + post.likes, 0)

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      <Helmet>
        <title>Let Us Know Kenya | Insights & Articles</title>
        <meta name="description" content="Deep dives, analysis, and stories about Kenya's resources, innovations, and opportunities." />
        <meta property="og:title" content="LUK Insights - Let Us Know Kenya" />
        <meta property="og:description" content="Deep dives, analysis, and stories about Kenya's resources, innovations, and opportunities." />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Hero Section - Professional Red/Black Gradient */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <BookOpen size={28} />
              <h1 className="text-3xl md:text-4xl font-bold">LUK Insights</h1>
            </div>
            <p className="text-base text-white/90 mb-8">
              Deep dives, analysis, and stories about Kenya's resources, innovations, and opportunities. Written by experts and community members.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <input
                type="text"
                placeholder="Search articles, topics, or authors..."
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a84f] transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1e293b]">{blogPosts.length}</div>
              <div className="text-gray-600 text-sm">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00a84f]">{totalViews}</div>
              <div className="text-gray-600 text-sm">Total Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c41e3a]">{totalLikes}</div>
              <div className="text-gray-600 text-sm">Total Likes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1e293b]">{categories.length - 1}</div>
              <div className="text-gray-600 text-sm">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex flex-wrap gap-3">
            <select
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogPage
