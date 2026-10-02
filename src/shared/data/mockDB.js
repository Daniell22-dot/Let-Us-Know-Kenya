// Mock database with CRUD operations
class MockDB {
  constructor() {
    this.data = {
      podcasts: JSON.parse(localStorage.getItem('luk_podcasts')) || [],
      blogPosts: JSON.parse(localStorage.getItem('luk_blogPosts')) || [],
      naturalResources: JSON.parse(localStorage.getItem('luk_naturalResources')) || [],
      humanResources: JSON.parse(localStorage.getItem('luk_humanResources')) || [],
      startups: JSON.parse(localStorage.getItem('luk_startups')) || [],
      jobs: JSON.parse(localStorage.getItem('luk_jobs')) || [],
      users: JSON.parse(localStorage.getItem('luk_users')) || []
    }
    
    // Initialize with sample data if empty
    if (this.data.podcasts.length === 0) {
      const { podcasts, blogPosts, naturalResources, humanResources, startups, jobs } = require('./sampleData')
      this.data.podcasts = podcasts
      this.data.blogPosts = blogPosts
      this.data.naturalResources = naturalResources
      this.data.humanResources = humanResources
      this.data.startups = startups
      this.data.jobs = jobs
      this.saveAll()
    }
  }

  saveAll() {
    Object.keys(this.data).forEach(key => {
      localStorage.setItem(`luk_${key}`, JSON.stringify(this.data[key]))
    })
  }

  // Podcast CRUD
  getPodcasts() {
    return this.data.podcasts
  }

  addPodcast(podcast) {
    const newPodcast = {
      id: Date.now(),
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      plays: 0,
      ...podcast
    }
    this.data.podcasts.push(newPodcast)
    this.saveAll()
    return newPodcast
  }

  updatePodcast(id, updates) {
    const index = this.data.podcasts.findIndex(p => p.id === id)
    if (index !== -1) {
      this.data.podcasts[index] = { ...this.data.podcasts[index], ...updates }
      this.saveAll()
      return this.data.podcasts[index]
    }
    return null
  }

  deletePodcast(id) {
    this.data.podcasts = this.data.podcasts.filter(p => p.id !== id)
    this.saveAll()
  }

  // Blog CRUD
  getBlogPosts() {
    return this.data.blogPosts
  }

  addBlogPost(post) {
    const newPost = {
      id: Date.now(),
      status: 'draft',
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      views: 0,
      likes: 0,
      comments: 0,
      ...post
    }
    this.data.blogPosts.push(newPost)
    this.saveAll()
    return newPost
  }

  updateBlogPost(id, updates) {
    const index = this.data.blogPosts.findIndex(p => p.id === id)
    if (index !== -1) {
      this.data.blogPosts[index] = { ...this.data.blogPosts[index], ...updates }
      this.saveAll()
      return this.data.blogPosts[index]
    }
    return null
  }

  deleteBlogPost(id) {
    this.data.blogPosts = this.data.blogPosts.filter(p => p.id !== id)
    this.saveAll()
  }

  // Natural Resources CRUD
  getNaturalResources() {
    return this.data.naturalResources
  }

  addNaturalResource(resource) {
    const newResource = {
      id: Date.now(),
      status: 'draft',
      ...resource
    }
    this.data.naturalResources.push(newResource)
    this.saveAll()
    return newResource
  }

  updateNaturalResource(id, updates) {
    const index = this.data.naturalResources.findIndex(r => r.id === id)
    if (index !== -1) {
      this.data.naturalResources[index] = { ...this.data.naturalResources[index], ...updates }
      this.saveAll()
      return this.data.naturalResources[index]
    }
    return null
  }

  deleteNaturalResource(id) {
    this.data.naturalResources = this.data.naturalResources.filter(r => r.id !== id)
    this.saveAll()
  }

  // Human Resources CRUD
  getHumanResources() {
    return this.data.humanResources
  }

  addHumanResource(resource) {
    const newResource = {
      id: Date.now(),
      status: 'draft',
      ...resource
    }
    this.data.humanResources.push(newResource)
    this.saveAll()
    return newResource
  }

  updateHumanResource(id, updates) {
    const index = this.data.humanResources.findIndex(r => r.id === id)
    if (index !== -1) {
      this.data.humanResources[index] = { ...this.data.humanResources[index], ...updates }
      this.saveAll()
      return this.data.humanResources[index]
    }
    return null
  }

  deleteHumanResource(id) {
    this.data.humanResources = this.data.humanResources.filter(r => r.id !== id)
    this.saveAll()
  }

  // Authentication
  authenticate(email, password) {
    const user = this.data.users.find(u => u.email === email && u.password === password)
    return user || null
  }

  // Analytics
  getAnalytics() {
    const totalPodcasts = this.data.podcasts.length
    const totalBlogs = this.data.blogPosts.length
    const totalNatural = this.data.naturalResources.length
    const totalHuman = this.data.humanResources.length
    const totalStartups = this.data.startups.length
    const totalJobs = this.data.jobs.length

    const publishedPodcasts = this.data.podcasts.filter(p => p.status === 'published').length
    const publishedBlogs = this.data.blogPosts.filter(p => p.status === 'published').length
    const publishedNatural = this.data.naturalResources.filter(r => r.status === 'published').length
    const publishedHuman = this.data.humanResources.filter(r => r.status === 'published').length

    const totalViews = this.data.blogPosts.reduce((sum, post) => sum + (post.views || 0), 0)
    const totalPlays = this.data.podcasts.reduce((sum, podcast) => sum + (podcast.plays || 0), 0)

    return {
      totalContent: totalPodcasts + totalBlogs + totalNatural + totalHuman + totalStartups + totalJobs,
      publishedContent: publishedPodcasts + publishedBlogs + publishedNatural + publishedHuman,
      pendingContent: (totalPodcasts - publishedPodcasts) + (totalBlogs - publishedBlogs) + 
                     (totalNatural - publishedNatural) + (totalHuman - publishedHuman),
      totalViews,
      totalPlays,
      podcasts: totalPodcasts,
      blogPosts: totalBlogs,
      naturalResources: totalNatural,
      humanResources: totalHuman,
      startups: totalStartups,
      jobs: totalJobs
    }
  }
}

export const mockDB = new MockDB()