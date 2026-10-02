import React, { useState, Suspense, lazy } from 'react'
import { Search, Filter, Map, Users, Grid, List, Download, Share2 } from 'lucide-react'
import ResourceCard from './components/ResourceCard.jsx'

// Leaflet is large, so the map only loads once the visitor scrolls this far.
const ResourcesMap = lazy(() => import('./components/ResourcesMap.jsx'))
import api from '../shared/services/api.js'
import { RESOURCE_CATEGORIES, buildCategoryOptions, uniqueStrings } from '../shared/data/constants.js'
import { toMapPoint } from '../shared/data/kenyaGeo.js'

const ResourcesPage = () => {
  const [naturalResources, setNaturalResources] = React.useState([])
  const [humanResources, setHumanResources] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = useState('natural')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedCategory, setSelectedCategory] = useState('All')

  React.useEffect(() => {
    const fetchResources = async () => {
      try {
        const data = await api.getResources()
        setNaturalResources(data.filter(r => r.type === 'natural'))
        setHumanResources(data.filter(r => r.type === 'human'))
      } catch (error) {
        console.error('Error fetching resources:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchResources()
  }, [])

  const resources = activeTab === 'natural' ? naturalResources : humanResources

  const regions = ['All', ...uniqueStrings(resources.map(r => r.region))]
  const categories = buildCategoryOptions(resources.map(r => r.category), RESOURCE_CATEGORIES[activeTab])

  const filteredResources = resources
    .filter(resource =>
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.detail.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(resource =>
      selectedRegion === 'All' || resource.region === selectedRegion
    )
    .filter(resource =>
      selectedCategory === 'All' || resource.category === selectedCategory
    )

  const exportCsv = () => {
    if (!filteredResources.length) return

    const headers = [
      'Name', 'Region', 'Category', 'Type', 'Conservation status',
      'Economic value', 'Tourism potential', 'Latitude', 'Longitude',
      'Location source', 'Description'
    ]

    const escapeCell = (value) => {
      const text = value === null || value === undefined ? '' : String(value)
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
    }

    const rows = filteredResources.map(resource => {
      const point = toMapPoint(resource)
      return [
        resource.name, resource.region, resource.category, resource.type,
        resource.conservationStatus, resource.economicValue,
        resource.tourismPotential, point.lat ?? '', point.lng ?? '',
        point.kind === 'exact' ? 'recorded coordinates'
          : point.kind === 'unresolved' ? 'not mapped' : `${point.kind} centroid`,
        resource.description
      ].map(escapeCell).join(',')
    })

    // A BOM keeps Excel from mangling the UTF-8 in descriptions.
    const csv = '\uFEFF' + [headers.map(escapeCell).join(','), ...rows].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `luk-${activeTab}-resources.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const stats = {
    natural: {
      total: naturalResources.length,
      featured: naturalResources.filter(r => r.featured).length,
      regions: Array.from(new Set(naturalResources.map(r => r.region))).length
    },
    human: {
      total: humanResources.length,
      categories: uniqueStrings(humanResources.map(r => r.category)).length,
      regions: Array.from(new Set(humanResources.map(r => r.region))).length
    }
  }

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      {/* Hero Section - Professional Red/Black Gradient */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Kenya's Resources
            </h1>
            <p className="text-base text-white/90 mb-8">
              Explore Kenya's vast natural wealth and talented human resources. From scenic landscapes to innovative minds.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <input
                type="text"
                placeholder={`Search ${activeTab} resources...`}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00a84f] transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[65px] z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('natural')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'natural'
                ? 'text-[#00a84f] border-[#00a84f]'
                : 'text-gray-600 hover:text-[#00a84f] border-transparent'
                }`}
            >
              <Map size={18} />
              Natural Resources
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {stats.natural.total}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('human')}
              className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'human'
                ? 'text-[#c41e3a] border-[#c41e3a]'
                : 'text-gray-600 hover:text-[#c41e3a] border-transparent'
                }`}
            >
              <Users size={18} />
              Human Resources
              <span className="ml-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {stats.human.total}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1e293b]">{filteredResources.length}</div>
              <div className="text-gray-600 text-sm">Resources</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#c41e3a]">{stats[activeTab].regions}</div>
              <div className="text-gray-600 text-sm">Regions</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#00a84f]">{categories.length - 1}</div>
              <div className="text-gray-600 text-sm">Categories</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1e293b]">{stats[activeTab].featured || stats[activeTab].categories}</div>
              <div className="text-gray-600 text-sm">{activeTab === 'natural' ? 'Featured' : 'Skill Areas'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Filters & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#00a84f] text-white rounded-lg hover:bg-[#008a42] transition-colors text-sm font-semibold">
              <Download size={16} />
              Export Data
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 text-sm font-semibold">
              <Share2 size={16} />
              Share
            </button>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className={`w-12 h-12 border-4 ${activeTab === 'natural' ? 'border-[#00a84f]' : 'border-[#c41e3a]'} border-t-transparent rounded-full animate-spin`}></div>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                type={activeTab}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Map className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Map/Data Visualization */}
        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#1e293b]">Resource Distribution Map</h3>
              <p className="mt-1 text-sm text-gray-600">
                {activeTab === 'natural'
                  ? 'Where Kenya\'s natural resources sit. Markers show the county or landmark each resource is recorded against.'
                  : 'Where Kenya\'s human resource clusters sit. Markers show the county or landmark each resource is recorded against.'}
              </p>
            </div>
            <button
              onClick={exportCsv}
              disabled={!filteredResources.length}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-[#1e293b] transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              Download {activeTab === 'natural' ? 'natural' : 'human'} resources (CSV)
            </button>
          </div>

          <Suspense
            fallback={
              <div className="flex h-[460px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">Loading map&hellip;</span>
              </div>
            }
          >
            <ResourcesMap resources={filteredResources} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ResourcesPage
