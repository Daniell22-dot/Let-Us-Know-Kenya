import React, { useState } from 'react'
import { Play, Pause, Headphones, Clock, Share2, Download, Heart, BookOpen } from 'lucide-react'
import { formatNumber } from '../../shared/utils/helpers'
import { usePodcastPlayer } from '../PodcastPlayerContext'
import api from '../../shared/services/api'
import { useAuth } from '../AuthContext'

const PodcastCard = ({ podcast, featured = false }) => {
  const { isAuthenticated } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { play, pause, currentPodcast, isPlaying } = usePodcastPlayer()

  const isThisPlaying = isPlaying && currentPodcast?.id === podcast.id

  const handlePlayPause = () => {
    if (isThisPlaying) {
      pause()
    } else {
      play(podcast)
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      alert("Please log in to save to your watchlist.")
      return
    }

    try {
      if (isBookmarked) {
        await api.removeFromWatchlist('podcast', podcast.id)
        setIsBookmarked(false)
      } else {
        await api.addToWatchlist('podcast', podcast.id)
        setIsBookmarked(true)
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update watchlist.")
    }
  }

  return (
    <div className={`bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 relative group ${featured ? 'md:col-span-2' : ''}`}>
      {/* Kenyan Flag Stripe Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#000000] via-[#bf2f38] to-[#00853e] z-10" />

      <div className={`p-6 ${featured ? 'md:flex items-start gap-6' : ''}`}>
        {/* Thumbnail */}
        <div className={`relative mb-4 ${featured ? 'md:w-64 md:mb-0' : ''}`}>
          <div className="relative h-48 rounded-xl overflow-hidden group">
            {podcast.thumbnail ? (
              <img
                src={podcast.thumbnail}
                alt={podcast.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#c41e3a] flex items-center justify-center">
                <Headphones size={48} className="text-white/40" />
              </div>
            )}

            {/* Play Button Overlay */}
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors"
            >
              <div className={`w-16 h-16 bg-gradient-to-r from-[#bf2f38] to-[#00853e] rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl ${isThisPlaying ? 'ring-4 ring-white/30' : ''}`}>
                {isThisPlaying ? (
                  <Pause size={28} className="text-white" />
                ) : (
                  <Play size={28} className="text-white ml-1" />
                )}
              </div>
            </button>

            {isThisPlaying && (
              <div className="absolute top-3 right-3 bg-[#00a84f] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Playing
              </div>
            )}
          </div>

          {/* Category Badge */}
          <span className="absolute top-4 left-4 bg-[#000000] text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md z-10">
            {podcast.category}
          </span>
        </div>

        {/* Content */}
        <div className={`flex-1 ${featured ? 'md:pl-6' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`font-bold text-gray-900 mb-1 group-hover:text-[#bf2f38] transition-colors ${featured ? 'text-2xl' : 'text-xl'}`}>
                {podcast.title}
              </h3>
              <p className="text-[#00853e] font-medium flex items-center gap-2">
                <Headphones size={16} />
                {podcast.host}
              </p>
            </div>
            {podcast.featured && (
              <span className="bg-gradient-to-r from-[#bf2f38] to-[#00853e] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                Featured
              </span>
            )}
          </div>

          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{podcast.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {(podcast.tags || []).map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-[#bf2f38]/10 hover:text-[#bf2f38] transition-colors cursor-default">
                #{tag}
              </span>
            ))}
          </div>

          {/* Stats & Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={16} className="text-[#00853e]" />
                <span className="text-sm font-medium">{podcast.length}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Headphones size={16} className="text-[#bf2f38]" />
                <span className="text-sm font-medium">{formatNumber(podcast.plays)} plays</span>
              </div>
              <div className="text-sm text-gray-500">{podcast.date}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isBookmarked ? 'text-[#00853e]' : 'text-gray-500'}`}
                title={isBookmarked ? "Remove from watchlist" : "Save to watchlist"}
              >
                <BookOpen size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors hover:text-[#00853e]">
                <Share2 size={18} />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors hover:text-[#000000]">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PodcastCard