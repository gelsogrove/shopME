import axios from "axios"

// Create an axios instance with custom config
export const api = axios.create({
  baseURL: "",
  withCredentials: true,
})

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)

// Check if the user is authenticated
export async function checkAuth(): Promise<boolean> {
  try {
    await api.get("/api/auth/me")
    return true
  } catch (error) {
    return false
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
