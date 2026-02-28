import React, { useState } from 'react'
import { Map, Users, Mountain, Coffee, Wifi, Building, Award, Heart } from 'lucide-react'
import { getCategoryColor } from '../../shared/utils/helpers'

const ResourceCard = ({ resource, type = 'natural' }) => {
  const [isSaved, setIsSaved] = useState(false)

  const getIcon = () => {
    const icons = {
      natural: {
        agriculture: <Coffee size={20} className="text-[#00853e]" />,
        wildlife: <Mountain size={20} className="text-[#bf2f38]" />,
        energy: <Wifi size={20} className="text-[#000000]" />,
        tourism: <Map size={20} className="text-[#00853e]" />
      },
      human: {
        talent: <Users size={20} className="text-[#bf2f38]" />,
        culture: <Award size={20} className="text-[#00853e]" />,
        craftsmanship: <Building size={20} className="text-[#000000]" />
      }
    }

    return icons[type]?.[resource.category?.toLowerCase()] || <Map size={20} className="text-[#bf2f38]" />
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 h-full relative group">
      {/* Kenyan Flag Stripe Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#000000] via-[#bf2f38] to-[#00853e]"></div>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={resource.images?.[0] || resource.thumbnail || "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600"}
          alt={resource.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* Category Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase bg-white shadow-md border-l-2 border-[#bf2f38]`}>
            {resource.category}
          </span>
        </div>

        {resource.featured && (
          <div className="absolute top-4 right-4 bg-gradient-to-r from-[#bf2f38] to-[#00853e] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span className="text-sm font-semibold uppercase tracking-wider text-[#000000]">
              {resource.region}
            </span>
          </div>
          {resource.economicValue && (
            <span className="text-xs font-bold px-2 py-1 bg-[#00853e]/10 text-[#00853e] rounded-full border border-[#00853e]/20">
              {resource.economicValue}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-[#bf2f38] transition-colors">
          {resource.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {resource.detail || resource.description}
        </p>

        {/* Tags */}
        {resource.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-[#bf2f38]/10 hover:text-[#bf2f38] transition-colors cursor-default"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            {resource.innovationScore && (
              <div className="text-center">
                <div className="text-lg font-bold text-[#bf2f38]">{resource.innovationScore}%</div>
                <div className="text-xs text-gray-500">Innovation</div>
              </div>
            )}
            {resource.opportunities && (
              <div className="text-center">
                <div className="text-lg font-bold text-[#00853e]">{resource.opportunities}</div>
                <div className="text-xs text-gray-500">Opportunities</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSaved(!isSaved)}
            className={`flex items-center gap-2 transition-all ${isSaved ? 'text-[#bf2f38]' : 'text-gray-400 hover:text-[#bf2f38]'
              }`}
          >
            <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
            <span className="text-sm font-semibold">{isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResourceCard