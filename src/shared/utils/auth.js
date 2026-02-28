export const checkAuth = () => {
  const token = localStorage.getItem('luk_admin_token')
  return !!token
}

export const login = (email, password) => {
  // In production, this would be an API call
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  if (email === adminEmail && password === adminPassword) {
    const token = 'luk_admin_' + Date.now()
    localStorage.setItem('luk_admin_token', token)
    return { success: true, token }
  }
  return { success: false, error: 'Invalid credentials' }
}

export const logout = () => {
  localStorage.removeItem('luk_admin_token')
  window.location.href = '/admin'
}

export const getCurrentUser = () => {
  const token = localStorage.getItem('luk_admin_token')
  if (token) {
    return {
      email: import.meta.env.VITE_ADMIN_EMAIL,
      name: 'Admin User',
      role: 'admin'
    }
  }
  return null
}