import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react'
import { Search, Map, Users, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import ResourceCard from './components/ResourceCard.jsx'
import api from '../shared/services/api.js'
import { RESOURCE_CATEGORIES, buildCategoryOptions } from '../shared/data/constants.js'
import { toMapPoint } from '../shared/data/kenyaGeo.js'

// Leaflet is large, so the map only loads once the visitor scrolls this far.
const ResourcesMap = lazy(() => import('./components/ResourcesMap.jsx'))

const ALL = 'All'
const PAGE_SIZE = 24

/**
 * Public resources directory.
 *
 * Two problems this had to resolve:
 *
 * 1. It filtered the natural and human tabs on `resource.type === 'natural'`.
 *    That field actually holds descriptive subtypes such as "Forest", "Lake" and
 *    "Dam"; no row has ever equalled 'natural', so both tabs rendered empty even
 *    with the dataset loaded. Grouping is now decided by which canonical category
 *    list a row belongs to, and the grouping happens in the query.
 *
 * 2. It fetched every row at once. With the Kenya dataset seeded that was a
 *    single request carrying most of a megabyte of descriptions, which timed out
 *    against the managed database. The page now requests one page at a time and
 *    fetches a lightweight projection for the map.
 */
const ResourcesPage = () => {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [points, setPoints] = useState([])
  const [facets, setFacets] = useState({ regions: [], categories: [] })
  const [loading, setLoading] = useState(true)
  const [mapLoading, setMapLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('natural')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState(ALL)
  const [selectedCategory, setSelectedCategory] = useState(ALL)
  const [page, setPage] = useState(1)

  // Debounced so typing does not fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 350)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const query = useMemo(() => ({
    group: activeTab,
    search: debouncedSearch || undefined,
    region: selectedRegion !== ALL ? selectedRegion : undefined,
    category: selectedCategory !== ALL ? selectedCategory : undefined
  }), [activeTab, debouncedSearch, selectedRegion, selectedCategory])

  // Any filter change invalidates the current page number.
  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    let cancelled = false
    api.getResourceFacets()
      .then((data) => { if (!cancelled) setFacets(data || { regions: [], categories: [] }) })
      .catch(() => { if (!cancelled) setFacets({ regions: [], categories: [] }) })
    return () => { cancelled = true }
  }, [])

  // The card grid: one page at a time.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    api.getResources({ ...query, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return
        setItems(res?.data || [])
        setMeta(res?.meta || { total: 0, page: 1, pages: 1 })
      })
      .catch((err) => {
        if (cancelled) return
        setItems([])
        setError(err.message || 'Could not load resources.')
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [query, page])

  // The map needs every point at once, so it uses the trimmed projection.
  useEffect(() => {
    let cancelled = false
    setMapLoading(true)

    api.getResourcePoints(query)
      .then((data) => { if (!cancelled) setPoints(Array.isArray(data) ? data : []) })
      .catch(() => { if (!cancelled) setPoints([]) })
      .finally(() => { if (!cancelled) setMapLoading(false) })

    return () => { cancelled = true }
  }, [query])

  const regions = [ALL, ...facets.regions]
  const categories = buildCategoryOptions(facets.categories, RESOURCE_CATEGORIES[activeTab])
  const categoryCount = categories.length - 1

  /**
   * Export pulls the whole matching set in one deliberate request rather than
   * exporting only the page currently on screen.
   */
  const exportCsv = async () => {
    setExporting(true)
    setError('')
    try {
      const response = await api.getResources({ ...query, page: 1, limit: 500 })
      const rows = response?.data || []
      if (!rows.length) return

      const headers = [
        'Name', 'County', 'Category', 'Type', 'Conservation status',
        'Economic value', 'Tourism potential', 'Latitude', 'Longitude',
        'Location source', 'Description'
      ]

      const escapeCell = (value) => {
        const text = value === null || value === undefined ? '' : String(value)
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
      }

      const body = rows.map((resource) => {
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
      const csv = '\uFEFF' + [headers.map(escapeCell).join(','), ...body].join('\r\n')
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `luk-${activeTab}-resources.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.message || 'Export failed.')
    } finally {
      setExporting(false)
    }
  }

  const hasFilters = selectedRegion !== ALL || selectedCategory !== ALL || debouncedSearch

  const resetFilters = () => {
    setSelectedRegion(ALL)
    setSelectedCategory(ALL)
    setSearchTerm('')
  }

  return (
    <div className="animate-fade-in bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Kenya's Resources
            </h1>
            <p className="text-base text-white/90 mb-6">
              Explore Kenya's natural wealth and talented human resources. From scenic landscapes to innovative minds.
            </p>

            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={18} />
              <input
                type="search"
                placeholder={`Search ${activeTab} resources...`}
                aria-label="Search resources"
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
            {[
              { key: 'natural', label: 'Natural Resources', icon: Map, accent: '#00a84f' },
              { key: 'human', label: 'Human Resources', icon: Users, accent: '#c41e3a' }
            ].map((tab) => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 font-semibold text-sm flex items-center gap-2 transition-colors border-b-2 ${active
                    ? '' : 'text-gray-600 border-transparent'
                    }`}
                  style={active ? { color: tab.accent, borderColor: tab.accent } : undefined}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1e293b]">
                {loading ? <span className="inline-block w-12 h-7 bg-gray-200 animate-pulse rounded" /> : meta.total.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Resources</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#c41e3a]">{facets.regions.length}</div>
              <div className="text-gray-600 text-sm">Counties</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#00a84f]">{categoryCount}</div>
              <div className="text-gray-600 text-sm">Categories</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#1e293b]">
                {mapLoading ? <span className="inline-block w-12 h-7 bg-gray-200 animate-pulse rounded" /> : points.length.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Mapped</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              aria-label="Filter by county"
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === ALL ? 'All counties' : region}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by category"
              className="px-4 py-2 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#00a84f] outline-none text-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === ALL ? 'All categories' : category}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button onClick={resetFilters} className="text-sm text-[#00a84f] hover:underline font-medium">
                Clear
              </button>
            )}
          </div>

          <button
            onClick={exportCsv}
            disabled={exporting || loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a84f] text-white rounded-lg hover:bg-[#008a42] transition-colors text-sm font-semibold disabled:opacity-50"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? 'Preparing...' : 'Export CSV'}
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className={`w-12 h-12 border-4 ${activeTab === 'natural' ? 'border-[#00a84f]' : 'border-[#c41e3a]'} border-t-transparent rounded-full animate-spin`}></div>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} type={activeTab} />
              ))}
            </div>

            {meta.pages > 1 && (
              <nav className="flex items-center justify-center gap-2 mt-10" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-gray-600 px-3">
                  Page {meta.page} of {meta.pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                  disabled={page >= meta.pages}
                  className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Map className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {hasFilters ? 'No matching resources' : 'No resources listed yet'}
            </h3>
            <p className="text-gray-500">
              {hasFilters
                ? 'Try a different search term or clear the filters.'
                : 'Resource listings will appear here once published.'}
            </p>
            {hasFilters && (
              <button onClick={resetFilters} className="mt-4 text-sm font-semibold text-[#00a84f] hover:underline">
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Map */}
        <div className="mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#1e293b]">Resource Distribution Map</h3>
              <p className="mt-1 text-sm text-gray-600">
                {activeTab === 'natural'
                  ? "Where Kenya's natural resources sit. Markers show the county or landmark each resource is recorded against."
                  : "Where Kenya's human resource clusters sit. Markers show the county or landmark each resource is recorded against."}
              </p>
            </div>
          </div>

          <Suspense
            fallback={
              <div className="flex h-[460px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-500">Loading map&hellip;</span>
              </div>
            }
          >
            <ResourcesMap resources={points} loading={mapLoading} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ResourcesPage