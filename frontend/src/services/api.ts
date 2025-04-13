import axios from "axios";

// Create an axios instance with custom config
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
})

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || {});
    
    // Aggiungi il token se disponibile
    const user = localStorage.getItem("user")
    if (user) {
      try {
        const userData = JSON.parse(user)
        if (userData.token) {
          config.headers.Authorization = `Bearer ${userData.token}`
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage")
      }
    }
    return config
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response
  },
  (error) => {
    console.error("API Response Error:", error.response || error);
    
    // Gestisci gli errori di autenticazione (401)
    if (error.response && error.response.status === 401) {
      // Reindirizza alla pagina di login se non autenticato
      if (window.location.pathname !== "/auth/login") {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        window.location.href = "/auth/login"
      }
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
