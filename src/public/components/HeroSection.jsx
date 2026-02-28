import React from 'react'
import { Link } from 'react-router-dom'
import { Play, ArrowRight, Globe, TrendingUp, Users, Sparkles } from 'lucide-react'

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden text-white py-16 md:py-24">
      {/* Professional Green Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] to-[#00a84f]"></div>

      {/* Subtle Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00a84f]"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-lg mb-6 border border-white/20">
            <Sparkles size={16} className="text-white" />
            <span className="text-xs font-medium">Discover Kenya's Untapped Resources</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
            The Voice of{' '}
            <span className="text-[#00a84f]">
              Kenyan
            </span>
            <br />
            Innovation
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-white/80 mb-10 max-w-3xl mx-auto">
            Discovering, showcasing, and connecting Kenya's untapped human and natural resources through digital storytelling.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16">
            <Link
              to="/resources"
              className="bg-white text-[#1e293b] px-6 py-2.5 rounded-lg font-semibold text-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all inline-flex items-center justify-center gap-2 group"
            >
              Start Exploring
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/podcasts"
              className="bg-white/20 hover:bg-white/30 border border-white/30 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all inline-flex items-center justify-center gap-2 group"
            >
              <Play size={16} className="group-hover:scale-110 transition-transform" />
              Listen Now
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="text-center p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
              <TrendingUp className="mx-auto mb-2 text-white" size={20} />
              <div className="text-2xl font-bold text-white">33%</div>
              <div className="text-xs text-white/70 mt-1">GDP from SMEs</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
              <Globe className="mx-auto mb-2 text-white" size={20} />
              <div className="text-2xl font-bold text-white">75%</div>
              <div className="text-xs text-white/70 mt-1">Internet Access</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
              <Play className="mx-auto mb-2 text-white" size={20} />
              <div className="text-2xl font-bold text-white">80%</div>
              <div className="text-xs text-white/70 mt-1">Video Traffic</div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-lg border border-white/20 hover:bg-white/15 transition-all">
              <Users className="mx-auto mb-2 text-white" size={20} />
              <div className="text-2xl font-bold text-white">7.4M</div>
              <div className="text-xs text-white/70 mt-1">SMEs in Kenya</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection