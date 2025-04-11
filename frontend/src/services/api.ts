import axios from "axios"

// Create an axios instance with custom config
export const api = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true // Enable sending cookies with requests
})

console.log("API configured with withCredentials:", api.defaults.withCredentials)

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    // Log request configuration for debugging
    console.log("Request config:", {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers,
      data: config.data
    })
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log("Response:", {
      status: response.status,
      data: response.data,
      headers: response.headers
    })
    return response
  },
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    })

    if (error.response?.status === 401) {
      // Clear any stored user data
      localStorage.removeItem("user")
      // Only redirect to login if we're not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/auth/login"
      }
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

// API endpoints
export const auth = {
  login: (credentials: { email: string; password: string }) =>
    api.post("/api/auth/login", credentials),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout")
}

export const workspaces = {
  list: () => api.get("/api/workspaces"),
  get: (id: string) => api.get(`/api/workspaces/${id}`),
  create: (data: any) => api.post("/api/workspaces", data),
  update: (id: string, data: any) => api.put(`/api/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/api/workspaces/${id}`)
}

export const products = {
  list: (workspaceId: string) => api.get(`/api/workspaces/${workspaceId}/products`),
  get: (workspaceId: string, id: string) => api.get(`/api/workspaces/${workspaceId}/products/${id}`),
  create: (workspaceId: string, data: any) => api.post(`/api/workspaces/${workspaceId}/products`, data),
  update: (workspaceId: string, id: string, data: any) => api.put(`/api/workspaces/${workspaceId}/products/${id}`, data),
  delete: (workspaceId: string, id: string) => api.delete(`/api/workspaces/${workspaceId}/products/${id}`)
}
