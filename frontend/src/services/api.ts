import axios from "axios"

// Create an axios instance with custom config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
})

console.log("API configured with withCredentials:", api.defaults.withCredentials)

// Add a request interceptor (non serve più aggiungere il token)
api.interceptors.request.use((config) => {
  console.log("Request config:", config.url, config.withCredentials)
  return config
})

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log("Response cookies:", document.cookie)
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Reindirizza all'endpoint di login in caso di errore 401
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  }
)

// Check if the user is authenticated
export const checkAuth = async () => {
  try {
    const response = await api.get('/api/auth/me')
    return response.data
  } catch (error) {
    console.error("Auth check failed:", error)
    return null
  }
}
