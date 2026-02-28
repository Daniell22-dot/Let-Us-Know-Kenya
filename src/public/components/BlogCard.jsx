import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, User, Eye, ThumbsUp, ThumbsDown, MessageCircle, BookOpen, ArrowRight } from 'lucide-react'
import { truncateText, getCategoryColor } from '../../shared/utils/helpers'
import api from '../../shared/services/api'
import { useAuth } from '../AuthContext'

const BlogCard = ({ post, featured = false }) => {
  const { isAuthenticated } = useAuth()
  const [upvotes, setUpvotes] = useState(post.upvotes || 0)
  const [downvotes, setDownvotes] = useState(post.downvotes || 0)
  const [voted, setVoted] = useState(null)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleVote = async (type) => {
    if (voted === type) return // prevent double voting
    try {
      const result = await api.voteBlog(post.id, type)
      setUpvotes(result.upvotes)
      setDownvotes(result.downvotes)
      setVoted(type)
    } catch {
      // optimistic fallback
      if (type === 'up') setUpvotes(v => v + 1)
      else setDownvotes(v => v + 1)
      setVoted(type)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert("Please log in to save to your watchlist.")
      return
    }

    try {
      if (isBookmarked) {
        await api.removeFromWatchlist('blog', post.id)
        setIsBookmarked(false)
      } else {
        await api.addToWatchlist('blog', post.id)
        setIsBookmarked(true)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update watchlist.")
    }
  }

  return (
    <article className={`bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full relative group ${featured ? 'md:col-span-2' : ''}`}>
      {/* Kenyan Flag Stripe Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#000000] via-[#bf2f38] to-[#00853e]" />

      {/* Image */}
      <div className={`relative ${featured ? 'h-64 md:h-80' : 'h-48'} overflow-hidden`}>
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4">
            <Link
              to={`/blog/${post.id}`}
              className="bg-gradient-to-r from-[#bf2f38] to-[#00853e] text-white px-6 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:shadow-lg transform hover:-translate-y-1 transition-all"
            >
              Read Article
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white text-[#bf2f38] shadow-md border-l-2 border-[#00853e]">
            {post.category}
          </span>
        </div>

        {post.featured && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#000000] to-[#bf2f38] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-sm">
          <div className="flex items-center gap-1 text-gray-500">
            <Calendar size={14} className="text-[#bf2f38]" />
            {post.date}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Clock size={14} className="text-[#00853e]" />
            {post.readTime}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <User size={14} className="text-[#000000]" />
            <span className="truncate max-w-[100px]">{post.author}</span>
          </div>
        </div>

        <h3 className={`font-bold text-gray-900 mb-3 group-hover:text-[#bf2f38] transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
          <Link to={`/blog/${post.id}`}>{post.title}</Link>
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(post.tags || []).slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-[#bf2f38]/10 hover:text-[#bf2f38] transition-colors cursor-default">
              #{tag}
            </span>
          ))}
          {(post.tags || []).length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">+{post.tags.length - 3}</span>
          )}
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Upvote */}
            <button
              onClick={() => handleVote('up')}
              className={`flex items-center gap-1.5 transition-all rounded-lg px-2 py-1 text-sm font-medium ${voted === 'up' ? 'text-[#00853e] bg-[#00853e]/10' : 'text-gray-500 hover:text-[#00853e] hover:bg-[#00853e]/10'}`}
              title="Upvote"
            >
              <ThumbsUp size={15} fill={voted === 'up' ? 'currentColor' : 'none'} />
              <span>{upvotes}</span>
            </button>

            {/* Downvote */}
            <button
              onClick={() => handleVote('down')}
              className={`flex items-center gap-1.5 transition-all rounded-lg px-2 py-1 text-sm font-medium ${voted === 'down' ? 'text-[#bf2f38] bg-[#bf2f38]/10' : 'text-gray-500 hover:text-[#bf2f38] hover:bg-[#bf2f38]/10'}`}
              title="Downvote"
            >
              <ThumbsDown size={15} fill={voted === 'down' ? 'currentColor' : 'none'} />
              <span>{downvotes}</span>
            </button>

            <div className="flex items-center gap-1.5 text-gray-500">
              <MessageCircle size={16} />
              <span className="text-sm font-medium">{post.comments || 0}</span>
            </div>

            <div className="flex items-center gap-1.5 text-gray-500">
              <Eye size={16} />
              <span className="text-sm font-medium">{post.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isBookmarked ? 'text-[#00853e]' : 'text-gray-500'}`}
              title={isBookmarked ? "Remove from watchlist" : "Save to watchlist"}
            >
              <BookOpen size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            <Link
              to={`/blog/${post.id}`}
              className="text-[#bf2f38] hover:text-[#00853e] font-semibold text-sm flex items-center gap-1 transition-colors"
            >
              Read more
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard