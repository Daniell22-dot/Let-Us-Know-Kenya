export const podcasts = [
  {
    id: 1,
    title: "The SME Hustle: Kenya's Silent GDP Contributors",
    host: "Kiptoo Korir",
    length: "45 min",
    tags: ["Business", "Entrepreneurship", "SMEs"],
    description: "Exploring how Kenya's 7.4 million SMEs contribute 33% to the GDP yet struggle with marketing reach.",
    audioUrl: "https://example.com/sme-hustle.mp3",
    status: 'published',
    date: '2025-12-15',
    plays: 2450,
    thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    featured: true,
    category: "Business"
  },
  {
    id: 2,
    title: "Natural Wealth: Kenya's Untapped Resources",
    host: "Sarah Wanjiku",
    length: "30 min",
    tags: ["Environment", "Resources", "Conservation"],
    description: "From the tea estates of Kericho to geothermal energy, discover Kenya's natural wealth.",
    audioUrl: "https://example.com/natural-wealth.mp3",
    status: 'published',
    date: '2025-12-10',
    plays: 1875,
    thumbnail: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800",
    featured: true,
    category: "Environment"
  },
  {
    id: 3,
    title: "Tech Revolution: Nairobi's Silicon Savannah",
    host: "David Ochieng",
    length: "52 min",
    tags: ["Technology", "Innovation", "Startups"],
    description: "How Kenyan tech startups are solving local problems with global impact.",
    audioUrl: "https://example.com/tech-revolution.mp3",
    status: 'published',
    date: '2025-12-05',
    plays: 3120,
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    featured: false,
    category: "Technology"
  },
  {
    id: 4,
    title: "Cultural Heritage: Preserving Kenyan Traditions",
    host: "Amina Mohammed",
    length: "38 min",
    tags: ["Culture", "Heritage", "Traditions"],
    description: "The importance of preserving cultural traditions in modern Kenya.",
    audioUrl: "https://example.com/cultural-heritage.mp3",
    status: 'published',
    date: '2025-11-28',
    plays: 1890,
    thumbnail: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800",
    featured: true,
    category: "Culture"
  }
]

export const blogPosts = [
  {
    id: 1,
    title: "Future of Digital Marketing in Kenya",
    category: "Innovation",
    author: "James Mwangi",
    authorRole: "Digital Marketing Expert",
    content: "Digital marketing in Kenya is evolving at an unprecedented pace. With over 75% of Kenyans having internet access and mobile phones being the primary device, the landscape has shifted dramatically...",
    excerpt: "Exploring how digital marketing is transforming Kenyan businesses and what the future holds.",
    date: "Dec 20, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800",
    tags: ["Marketing", "Technology", "Business", "Digital"],
    status: 'published',
    views: 3200,
    likes: 156,
    comments: 24,
    featured: true
  },
  {
    id: 2,
    title: "Sustainable Tourism: Kenya's Next Frontier",
    category: "Tourism",
    author: "Grace Wangari",
    authorRole: "Tourism Consultant",
    content: "Sustainable tourism is no longer an option but a necessity for Kenya. With our rich natural heritage, we have an opportunity to lead in eco-tourism...",
    excerpt: "How Kenya can lead in sustainable tourism while preserving natural resources.",
    date: "Dec 15, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800",
    tags: ["Tourism", "Sustainability", "Environment"],
    status: 'published',
    views: 2100,
    likes: 98,
    comments: 18,
    featured: true
  },
  {
    id: 3,
    title: "AgriTech Revolution: Feeding Africa",
    category: "Agriculture",
    author: "Peter Kamau",
    authorRole: "Agricultural Engineer",
    content: "Kenyan farmers are embracing technology at an unprecedented rate. From mobile apps that provide weather forecasts to IoT sensors that monitor soil moisture...",
    excerpt: "How technology is transforming agriculture in Kenya.",
    date: "Dec 10, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800",
    tags: ["Agriculture", "Technology", "Innovation"],
    status: 'published',
    views: 1850,
    likes: 87,
    comments: 15,
    featured: false
  }
]

export const naturalResources = [
  {
    id: 1,
    name: "Tea Estates of Kericho",
    region: "Rift Valley",
    type: "agriculture",
    detail: "Largest tea producing region in Africa",
    description: "The rolling hills of Kericho are covered with lush green tea plantations that produce some of the world's finest tea. This region contributes significantly to Kenya's economy and provides employment to thousands of local communities.",
    coordinates: { lat: -0.367, lng: 35.283 },
    images: [
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"
    ],
    status: 'published',
    featured: true,
    category: "Agriculture",
    economicValue: "High",
    conservationStatus: "Protected",
    tourismPotential: "High"
  },
  {
    id: 2,
    name: "Lake Nakuru National Park",
    region: "Nakuru",
    type: "wildlife",
    detail: "Flamingo sanctuary and wildlife reserve",
    description: "Famous for its millions of flamingos that turn the lake shores pink, Lake Nakuru National Park is a UNESCO World Heritage Site and home to diverse wildlife including rhinos, lions, and giraffes.",
    coordinates: { lat: -0.367, lng: 36.083 },
    images: [
      "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600",
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600"
    ],
    status: 'published',
    featured: true,
    category: "Wildlife",
    economicValue: "Very High",
    conservationStatus: "Protected",
    tourismPotential: "Very High"
  },
  {
    id: 3,
    name: "Olkaria Geothermal Plant",
    region: "Naivasha",
    type: "energy",
    detail: "Largest geothermal plant in Africa",
    description: "Harnessing the power of the Earth's heat, Olkaria is a testament to Kenya's commitment to renewable energy and sustainable development.",
    coordinates: { lat: -0.900, lng: 36.300 },
    images: [
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600"
    ],
    status: 'published',
    featured: false,
    category: "Energy",
    economicValue: "High",
    conservationStatus: "Industrial",
    tourismPotential: "Medium"
  }
]

export const humanResources = [
  {
    id: 1,
    name: "Tech Innovators Hub - Nairobi",
    region: "Nairobi",
    type: "talent",
    detail: "Young tech entrepreneurs and developers",
    description: "Nairobi's thriving tech scene, often called 'Silicon Savannah', is home to innovative startups and talented developers creating solutions for local and global challenges.",
    skills: ["Programming", "AI", "Blockchain", "Mobile Apps"],
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600"
    ],
    status: 'published',
    category: "Technology",
    expertiseLevel: "World Class",
    innovationScore: 95,
    opportunities: "High"
  },
  {
    id: 2,
    name: "Maasai Cultural Guides",
    region: "Narok",
    type: "culture",
    detail: "Traditional knowledge and cultural preservation",
    description: "The Maasai community preserves centuries-old traditions while sharing their knowledge and culture with visitors from around the world.",
    skills: ["Cultural Preservation", "Tour Guiding", "Traditional Medicine"],
    images: [
      "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600"
    ],
    status: 'published',
    category: "Culture",
    expertiseLevel: "Expert",
    innovationScore: 85,
    opportunities: "Medium"
  },
  {
    id: 3,
    name: "Coastal Artisans - Mombasa",
    region: "Mombasa",
    type: "craftsmanship",
    detail: "Traditional woodcarving and craftsmanship",
    description: "Skilled artisans along the Kenyan coast create beautiful woodcarvings, furniture, and traditional crafts using techniques passed down through generations.",
    skills: ["Woodcarving", "Carpentry", "Design", "Traditional Crafts"],
    images: [
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600"
    ],
    status: 'published',
    category: "Arts",
    expertiseLevel: "Master",
    innovationScore: 80,
    opportunities: "High"
  }
]

export const startups = [
  {
    id: 1,
    name: "AgriTech Solutions Kenya",
    founder: "Mary Auma",
    description: "Revolutionizing farming with IoT sensors and mobile technology to increase crop yields and reduce water usage.",
    sector: "Agriculture Technology",
    stage: "Seed",
    location: "Kisumu",
    status: 'published',
    logo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200",
    funding: "$500,000",
    employees: 15,
    founded: 2023,
    website: "https://agritech-ke.com",
    tags: ["Agriculture", "IoT", "Sustainability"]
  },
  {
    id: 2,
    name: "EduLearn Africa",
    founder: "John Kariuki",
    description: "Mobile learning platform providing affordable education to rural communities across Kenya.",
    sector: "Education Technology",
    stage: "Series A",
    location: "Nairobi",
    status: 'published',
    logo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
    funding: "$1.2M",
    employees: 28,
    founded: 2022,
    website: "https://edulearn.africa",
    tags: ["Education", "EdTech", "Mobile"]
  },
  {
    id: 3,
    name: "CleanEnergy Pro",
    founder: "Susan Njoroge",
    description: "Affordable solar solutions for off-grid communities and small businesses.",
    sector: "Clean Energy",
    stage: "Early",
    location: "Nakuru",
    status: 'published',
    logo: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=200",
    funding: "$300,000",
    employees: 12,
    founded: 2024,
    website: "https://cleanenergypro.co.ke",
    tags: ["Solar", "Energy", "Sustainability"]
  }
]

export const jobs = [
  {
    id: 1,
    title: "Digital Marketing Specialist",
    company: "LUK Kenya",
    location: "Nairobi, Remote",
    type: "Full-time",
    salary: "Ksh 120,000 - 150,000",
    description: "Manage digital campaigns and social media for showcasing Kenyan resources.",
    status: 'published',
    posted: "2025-12-20",
    applicants: 24,
    category: "Marketing"
  },
  {
    id: 2,
    title: "Content Creator - Natural Resources",
    company: "LUK Kenya",
    location: "Nairobi",
    type: "Contract",
    salary: "Ksh 80,000 - 100,000",
    description: "Create engaging content about Kenya's natural resources and scenic locations.",
    status: 'published',
    posted: "2025-12-18",
    applicants: 18,
    category: "Content"
  }
]