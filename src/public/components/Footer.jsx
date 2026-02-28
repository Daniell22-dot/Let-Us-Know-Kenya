import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Heart, Send } from 'lucide-react'
import api from '../../shared/services/api'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState({ loading: false, type: '', message: '' })

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus({ loading: true, type: '', message: '' })
    try {
      const response = await api.subscribeToNewsletter(email)
      setStatus({ loading: false, type: 'success', message: response.message || 'Subscribed successfully!' })
      setEmail('')
    } catch (error) {
      setStatus({ loading: false, type: 'error', message: error.message || 'Subscription failed. Please try again.' })
    }
  }

  return (
    <footer className="bg-[#1e293b] text-white mt-12 relative">
      {/* Green Stripe Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#00a84f]"></div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-[#00a84f] rounded-lg flex items-center justify-center shadow-md">
                <Globe className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold">LET US KNOW KENYA</h2>
                <p className="text-[#00a84f] font-medium text-sm">Discover • Showcase • Connect</p>
              </div>
            </div>
            <p className="text-gray-400 max-w-lg mb-6 leading-relaxed text-sm">
              A social media-driven platform dedicated to discovering, showcasing, and connecting Kenya's untapped human and natural resources. We build what will stand for our children and future generations.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-2.5 bg-white/10 rounded-lg hover:bg-[#00a84f] transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1 border-gray-700/50 pt-6 md:pt-0">
            <h3 className="text-base font-bold mb-4 relative inline-block">
              Newsletter
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#00a84f] rounded-full"></span>
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Get the latest insights, resources, and updates delivered straight to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00a84f] transition-colors pr-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status.loading}
                required
              />
              <button
                type="submit"
                disabled={status.loading}
                className="absolute right-2 top-2 bottom-2 text-[#00a84f] hover:text-white transition-colors disabled:opacity-50"
              >
                {status.loading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <Send size={18} />}
              </button>
            </form>
            {status.message && (
              <p className={`text-xs mt-2 ${status.type === 'success' ? 'text-[#00a84f]' : 'text-red-400'}`}>
                {status.message}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-5 relative inline-block">
              Explore
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#00a84f] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/podcasts", label: "Podcasts" },
                { to: "/blog", label: "Blog & Articles" },
                { to: "/resources?type=natural", label: "Natural Resources" },
                { to: "/resources?type=human", label: "Human Resources" },
                { to: "/about", label: "About Us" }
              ].map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.to}
                    className="text-gray-400 hover:text-[#00a84f] transition-colors text-sm flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-[#00a84f] rounded-full group-hover:w-1.5 transition-all"></span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-bold mb-5 relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-10 h-0.5 bg-[#00a84f] rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400 group hover:text-[#00a84f] transition-colors text-sm">
                <Mail size={16} className="text-[#00a84f] group-hover:scale-110 transition-transform flex-shrink-0" />
                <span>manyasadaniel630@gmail.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400 group hover:text-[#00a84f] transition-colors text-sm">
                <Phone size={16} className="text-[#00a84f] group-hover:scale-110 transition-transform flex-shrink-0" />
                <span>+254 112219135</span>
              </li>
              <li className="flex items-start gap-3 text-gray-400 group hover:text-[#00a84f] transition-colors text-sm">
                <MapPin size={16} className="text-[#00a84f] group-hover:scale-110 transition-transform mt-0.5 flex-shrink-0" />
                <span>Nyeri, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-xs">
              &copy; {currentYear} LET US KNOW KENYA. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-4 md:mt-0 flex items-center gap-2">
              Made with <Heart size={12} className="text-[#00a84f] animate-pulse" /> in{" "}
              <span className="font-bold text-[#00a84f]">Kenya</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
