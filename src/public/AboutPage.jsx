import React from 'react'
import {
  Globe, Target, Users, Award, TrendingUp, Heart,
  BarChart, Lightbulb, Shield, Mail, Phone, MapPin,
  Facebook, Twitter, Instagram, Linkedin, Youtube
} from 'lucide-react'

const AboutPage = () => {
  const team = [
    {
      name: 'George Mageto',
      role: 'Founder & CEO',
      bio: 'Digital marketing expert with 10+ years experience in Kenyan media.',
      image: '/api/placeholder/96/96'
    },
    {
      name: 'Sarah Wanjiku',
      role: 'Content Director',
      bio: 'Former journalist passionate about Kenyan stories and heritage.',
      image: '/api/placeholder/96/96'
    },
    {
      name: 'Daniel Manyasa',
      role: 'Tech Lead',
      bio: 'Software engineer focused on building platforms for Kenyan innovators.',
      image: '/api/placeholder/96/96'
    }
  ]

  const values = [
    {
      icon: <Heart size={24} />,
      title: 'Authenticity',
      description: 'We showcase real stories from real Kenyans, keeping narratives genuine and relatable.'
    },
    {
      icon: <Lightbulb size={24} />,
      title: 'Innovation',
      description: 'Embracing digital solutions to connect resources with opportunities effectively.'
    },
    {
      icon: <Users size={24} />,
      title: 'Community',
      description: 'Building a network where every Kenyan can contribute, learn, and grow together.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Integrity',
      description: 'Maintaining transparency and ethical standards in all our operations.'
    }
  ]

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      {/* Hero Section - Professional Red/Black Gradient */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <Globe size={32} className="text-white" />
              <h1 className="text-3xl md:text-4xl font-bold">Our Story</h1>
            </div>
            <p className="text-base text-white/90 mb-8">
              We are a social media-driven platform dedicated to discovering, showcasing,
              and connecting Kenya's untapped human and natural resources.
            </p>
            <div className="inline-flex items-center gap-2 bg-white/20 px-5 py-2.5 rounded-lg border border-white/30 text-sm">
              <Target size={16} />
              <span className="font-medium">Founded 2026 • Based in Nyeri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-lg p-8 shadow-md border-l-4 border-[#c41e3a]">
              <div className="flex items-center gap-3 mb-5">
                <Target size={28} className="text-[#c41e3a]" />
                <h2 className="text-2xl font-bold text-[#1e293b]">Our Mission</h2>
              </div>
              <p className="text-gray-700 text-sm mb-4">
                To explore and showcase Kenya's diverse talents, resources, and economic history
                through social media, fostering a culture of knowledge sharing, empowerment,
                and national pride.
              </p>
              <p className="text-gray-600 text-sm">
                We promote the holistic well-being of our communities while creating
                sustainable value for future generations.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-md border-l-4 border-[#00a84f]">
              <div className="flex items-center gap-3 mb-5">
                <Globe size={28} className="text-[#00a84f]" />
                <h2 className="text-2xl font-bold text-[#1e293b]">Our Vision</h2>
              </div>
              <p className="text-gray-700 text-sm mb-4">
                To be the leading platform that connects Kenyans to each other and to
                the wealth of talents, resources, and historical narratives within the country.
              </p>
              <p className="text-gray-600 text-sm">
                Building what will stand for our children and future generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#1e293b]">
              Why LUK Kenya Exists
            </h2>
            <p className="text-base text-gray-600">Addressing key challenges in Kenya's digital landscape</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-[#1e293b]/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <BarChart size={24} className="text-[#1e293b]" />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b] mb-3">33% GDP Contribution</h3>
              <p className="text-gray-600 text-sm">
                7.4 million SMEs contribute significantly but lack affordable marketing solutions.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-[#c41e3a]/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={24} className="text-[#c41e3a]" />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b] mb-3">80% Video Traffic</h3>
              <p className="text-gray-600 text-sm">
                Leveraging the most effective format to reach 75% of connected Kenyans.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 hover:shadow-md transition-all">
              <div className="w-14 h-14 bg-[#00a84f]/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Lightbulb size={24} className="text-[#00a84f]" />
              </div>
              <h3 className="text-lg font-bold text-[#1e293b] mb-3">Untold Stories</h3>
              <p className="text-gray-600 text-sm">
                Millions of Kenyan stories remain untold. We provide the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">Our Values</h2>
            <p className="text-base text-gray-600">The principles that guide everything we do</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all">
                <div className="text-[#00a84f] mb-4">{value.icon}</div>
                <h3 className="text-lg font-bold text-[#1e293b] mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-4">Meet Our Team</h2>
            <p className="text-base text-gray-600">The passionate individuals behind LUK Kenya</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="rounded-lg p-8 shadow-md border border-gray-200 hover:shadow-lg transition-all text-center bg-gray-50">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-20 h-20 rounded-full mx-auto mb-6 object-cover border-2 border-[#00a84f]"
                />
                <h3 className="text-lg font-bold text-[#1e293b] mb-2">{member.name}</h3>
                <p className="text-[#c41e3a] font-semibold text-sm mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA - Professional Red/Black Gradient */}
      <section className="py-16 bg-gradient-to-r from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="mx-auto mb-5" size={40} />
            <h2 className="text-3xl md:text-4xl font-bold mb-5">Partner With Us</h2>
            <p className="text-base text-white/90 mb-10">
              Whether you're an SME, NGO, investor, or content creator,
              let's collaborate to showcase Kenya's potential.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12 mb-10">
              <div className="flex flex-col items-center gap-3 p-6 bg-white/15 rounded-lg border border-white/20">
                <Mail size={20} className="text-white" />
                <div className="font-semibold text-sm">Email</div>
                <div className="text-white/80 text-[11px] break-all">manyasadaniel630@gmail.com</div>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 bg-white/15 rounded-lg border border-white/20">
                <Phone size={20} className="text-white" />
                <div className="font-semibold text-sm">Phone</div>
                <div className="text-white/80 text-[11px]">+254 112219135</div>
              </div>
              <div className="flex flex-col items-center gap-3 p-6 bg-white/15 rounded-lg border border-white/20">
                <MapPin size={20} className="text-white" />
                <div className="font-semibold text-sm">Location</div>
                <div className="text-white/80 text-[11px]">Nyeri, Kenya</div>
              </div>
            </div>

            <div className="flex justify-center gap-3 flex-wrap">
              {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-2.5 bg-white/15 rounded-lg hover:bg-white/25 transition-colors border border-white/20"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
