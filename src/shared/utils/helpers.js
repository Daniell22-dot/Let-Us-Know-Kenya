export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString('en-US', options)
}

export const truncateText = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export const getCategoryColor = (category) => {
  const colors = {
    Business: 'bg-blue-100 text-blue-800',
    Technology: 'bg-purple-100 text-purple-800',
    Environment: 'bg-green-100 text-green-800',
    Culture: 'bg-yellow-100 text-yellow-800',
    Agriculture: 'bg-amber-100 text-amber-800',
    Tourism: 'bg-cyan-100 text-cyan-800',
    Innovation: 'bg-pink-100 text-pink-800',
    Education: 'bg-indigo-100 text-indigo-800',
    Marketing: 'bg-red-100 text-red-800',
    Wildlife: 'bg-emerald-100 text-emerald-800',
    Energy: 'bg-orange-100 text-orange-800',
    Arts: 'bg-fuchsia-100 text-fuchsia-800'
  }
  return colors[category] || 'bg-gray-100 text-gray-800'
}