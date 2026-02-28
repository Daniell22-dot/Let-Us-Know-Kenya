import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Search, Filter, Play, Headphones, Clock, TrendingUp, Download, Share2 } from 'lucide-react'
import PodcastCard from './components/PodcastCard.jsx'
import { CardSkeleton } from './components/SkeletonLoaders.jsx'
import api from '../shared/services/api.js'
import { formatNumber } from '../shared/utils/helpers'

const PodcastPage = () => {
  const [podcasts, setPodcasts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('latest')

  React.useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const data = await api.getPodcasts()
        setPodcasts(data)
      } catch (error) {
        console.error('Error fetching podcasts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPodcasts()
  }, [])

  const categories = ['All', 'Business', 'Technology', 'Environment', 'Culture', 'Innovation', 'Artificial Intelligence', 'Education', 'Health']

  const filteredPodcasts = podcasts
    .filter(podcast =>
      podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      podcast.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      podcast.host.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(podcast =>
      selectedCategory === 'All' || podcast.category === selectedCategory
    )
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'popular') return b.plays - a.plays
      return 0
    })

  const totalPlays = podcasts.reduce((sum, podcast) => sum + podcast.plays, 0)
  const totalDuration = podcasts.reduce((sum, podcast) => {
    const mins = parseInt(podcast.length)
    return sum + (isNaN(mins) ? 0 : mins)
  }, 0)

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      <Helmet>
        <title>Let Us Know Kenya | Podcasts & Audio</title>
        <meta name="description" content="Listen to the interviews, stories, and discussions that define the modern Kenyan brand." />
        <meta property="og:title" content="LUK Unplugged - Podcasts by Let Us Know Kenya" />
        <meta property="og:description" content="Listen to the interviews, stories, and discussions that define the modern Kenyan brand." />
        <meta property="og:type" content="music.playlist" />
      </Helmet>

      {/* Hero Section - Professional Red/Black Gradient */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <Headphones size={28} />
              <h1 className="text-3xl md:text-4xl font-bold">LUK Unplugged</h1>
            </div>
            <p className="text-base text-white/90 mb-8">
              Listen to the interviews, stories, and discussions that define the modern Kenyan brand. From SME success stories to environmental conservation.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <input
                type="text"
                placeholder="Search podcasts by title, host, or topic..."
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
              <div className="text-2xl font-bold text-[#1e293b]">{podcasts.length}</div>
              <div className="text-gray-600 text-sm">Total Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#00a84f]">{formatNumber(totalPlays)}</div>
              <div className="text-gray-600 text-sm">Total Plays</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#c41e3a]">{totalDuration}+</div>
              <div className="text-gray-600 text-sm">Hours of Content</div>
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
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedCategory === category
                  ? 'bg-[#00a84f] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <select
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Podcast Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredPodcasts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPodcasts.map(podcast => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Headphones className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No podcasts found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Featured Episode */}
        {!loading && podcasts.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-[#1e293b] via-[#c41e3a] to-[#1e293b] rounded-lg p-8 text-white">
            <div className="md:flex items-center gap-8">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <div className="relative">
                  <img
                    src={podcasts[0].thumbnail}
                    alt={podcasts[0].title}
                    className="w-full rounded-lg border-2 border-white/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg flex items-end p-6">
                    <div className="flex items-center gap-2 text-white">
                      <TrendingUp size={18} />
                      <span className="font-bold text-sm">Most Played</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="md:w-2/3">
                <h3 className="text-2xl font-bold mb-3">{podcasts[0].title}</h3>
                <p className="text-white/90 mb-5 text-sm">{podcasts[0].description}</p>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm">
                    <Headphones size={14} />
                    <span>{formatNumber(podcasts[0].plays)} plays</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg text-sm">
                    <Clock size={14} />
                    <span>{podcasts[0].length}</span>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button className="bg-white text-[#c41e3a] px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm">
                    <Play size={16} />
                    Play Now
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 border border-white/30 text-sm">
                    <Download size={16} />
                    Download
                  </button>
                  <button className="bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2 border border-white/30 text-sm">
                    <Share2 size={16} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PodcastPage
