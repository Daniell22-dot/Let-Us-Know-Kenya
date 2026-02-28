import React from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSection from './components/HeroSection.jsx'
import ResourceCard from './components/ResourceCard.jsx'
import PodcastCard from './components/PodcastCard.jsx'
import BlogCard from './components/BlogCard.jsx'
import { CardSkeleton } from './components/SkeletonLoaders.jsx'
import {
  ArrowRight, Play, BookOpen, Map, Users, TrendingUp,
  Globe, Coffee, Mountain, Wifi, Award, Sparkles
} from 'lucide-react'
import api from '../shared/services/api.js'
import SubmitStartupModal from './components/SubmitStartupModal.jsx'

const HomePage = () => {
  const [podcasts, setPodcasts] = React.useState([])
  const [blogPosts, setBlogPosts] = React.useState([])
  const [resources, setResources] = React.useState([])
  const [startups, setStartups] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [podData, blogData, resData, startupData] = await Promise.all([
          api.getPodcasts(),
          api.getBlogs(),
          api.getResources(),
          api.getStartups()
        ])
        setPodcasts(podData)
        setBlogPosts(blogData)
        setResources(resData)
        setStartups(startupData)
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const featuredPodcasts = podcasts.filter(p => p.featured)
  const featuredBlogs = blogPosts.filter(p => p.featured)
  const featuredNatural = resources.filter(r => r.featured && r.type === 'natural')
  const featuredHuman = resources.filter(r => r.type === 'human').slice(0, 2)

  return (
    <div className="animate-fade-in">
      <Helmet>
        <title>Let Us Know Kenya | Home</title>
        <meta name="description" content="Discover stories, podcasts, and resources that define modern Kenya. Join Let Us Know Kenya." />
        <meta property="og:title" content="Let Us Know Kenya" />
        <meta property="og:description" content="Discover stories, podcasts, and resources that define modern Kenya." />
        <meta property="og:type" content="website" />
      </Helmet>

      <HeroSection />

      {/* Featured Podcasts */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 text-[#1e293b]">
                Featured Podcasts
              </h2>
              <p className="text-sm text-gray-600">Listen to stories that define modern Kenya</p>
            </div>
            <Link
              to="/podcasts"
              className="bg-[#00a84f] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#008a42] transition-all inline-flex items-center gap-2"
            >
              All Podcasts
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : featuredPodcasts.length > 0 ? (
              featuredPodcasts.map(podcast => (
                <PodcastCard key={podcast.id} podcast={podcast} featured />
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-500 py-10">No podcasts found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Natural Resources */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 text-[#1e293b]">Natural Resources</h2>
              <p className="text-sm text-gray-600">Discover Kenya's untapped natural wealth</p>
            </div>
            <Link
              to="/resources?type=natural"
              className="bg-[#00a84f] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#008a42] transition-all inline-flex items-center gap-2"
            >
              <Map size={16} />
              Explore All
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : featuredNatural.length > 0 ? (
              featuredNatural.map(resource => (
                <ResourceCard key={resource.id} resource={resource} type="natural" />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10">No natural resources found.</p>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <Coffee className="mx-auto mb-2 text-[#1e293b]" size={20} />
              <div className="text-xl font-bold text-[#1e293b]">#1</div>
              <div className="text-xs text-gray-600 mt-1">Tea Producer in Africa</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <Mountain className="mx-auto mb-2 text-[#00a84f]" size={20} />
              <div className="text-xl font-bold text-[#00a84f]">25+</div>
              <div className="text-xs text-gray-600 mt-1">National Parks</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <Wifi className="mx-auto mb-2 text-[#00a84f]" size={20} />
              <div className="text-xl font-bold text-[#00a84f]">47%</div>
              <div className="text-xs text-gray-600 mt-1">Green Energy</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
              <Globe className="mx-auto mb-2 text-[#1e293b]" size={20} />
              <div className="text-xl font-bold text-[#1e293b]">7</div>
              <div className="text-xs text-gray-600 mt-1">UNESCO Sites</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 text-[#1e293b]">Latest Insights</h2>
              <p className="text-sm text-gray-600">Articles and stories from our community</p>
            </div>
            <Link
              to="/blog"
              className="bg-[#00a84f] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#008a42] transition-all inline-flex items-center gap-2"
            >
              <BookOpen size={16} />
              Read All
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : featuredBlogs.length > 0 ? (
              featuredBlogs.map(post => (
                <BlogCard key={post.id} post={post} />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500 py-10">No articles found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Human Resources */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1 text-[#1e293b]">Human Resources</h2>
              <p className="text-sm text-gray-600">Meet Kenya's talented innovators and creators</p>
            </div>
            <Link
              to="/resources?type=human"
              className="bg-[#00a84f] text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-[#008a42] transition-all inline-flex items-center gap-2"
            >
              <Users size={16} />
              Meet More
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {loading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : featuredHuman.length > 0 ? (
              featuredHuman.map(resource => (
                <ResourceCard key={resource.id} resource={resource} type="human" />
              ))
            ) : (
              <p className="col-span-2 text-center text-gray-500 py-10">No human resources found.</p>
            )}
          </div>
        </div>
      </section>

      {/* Startups CTA - Green Professional */}
      <section className="py-14 bg-gradient-to-r from-[#1e293b] to-[#00a84f] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <Sparkles className="mx-auto mb-4" size={32} />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Showcase Your Startup
            </h2>
            <p className="text-base text-white/90 mb-8">
              Are you building the next big thing in Kenya? Get featured on LUK Kenya and connect with investors, customers, and talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="bg-white text-[#00a84f] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-all"
              >
                Submit Your Startup
              </button>
              <Link
                to="/startups"
                className="bg-white/20 hover:bg-white/30 px-6 py-2.5 rounded-lg font-semibold text-sm border border-white/30 transition-all text-center flex items-center justify-center"
              >
                View Startups
              </Link>
            </div>
          </div>
        </div>

        <SubmitStartupModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        />
      </section>

      {/* Stats Banner - Green */}
      <section className="py-10 bg-[#00a84f]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">7.4M</div>
              <div className="text-white/90 font-medium text-sm mt-1">SMEs in Kenya</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">33%</div>
              <div className="text-white/90 font-medium text-sm mt-1">GDP Contribution</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">80%</div>
              <div className="text-white/90 font-medium text-sm mt-1">Video Traffic</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">15-20%</div>
              <div className="text-white/90 font-medium text-sm mt-1">Digital Growth</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
