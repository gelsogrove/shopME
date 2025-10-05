import { logger } from "@/lib/logger"
import axios from "axios"
import { toast } from "../lib/toast"

// Create an axios instance with custom config
export const api = axios.create({
  baseURL: "/api", // Set standard /api prefix for all API calls
  withCredentials: true, // Importante: invia i cookie con le richieste
})

// Helper function to get current workspace ID from local storage
const getCurrentWorkspaceId = (): string | null => {
  const workspaceData = localStorage.getItem("currentWorkspace")
  if (workspaceData) {
    try {
      const workspace = JSON.parse(workspaceData)
      return workspace.id
    } catch (e) {
      logger.error("Error parsing workspace data:", e)
    }
  }
  return null
}

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    logger.info(
      `📤 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        data: config.data || {},
        headers: config.headers,
        baseURL: config.baseURL
      }
    )

    // Note: JWT token is sent automatically via HTTP-only cookies
    // No need to manually add Authorization header
    logger.info(`🔐 Using HTTP-only cookie for authentication`)

    // Add x-workspace-id header if not already present and we have a workspace ID
    if (!config.headers["x-workspace-id"]) {
      const workspaceId = getCurrentWorkspaceId()
      if (workspaceId) {
        logger.info(`🔧 Adding x-workspace-id header: ${workspaceId}`)
        config.headers["x-workspace-id"] = workspaceId
      } else {
        logger.warn(`⚠️ No workspace ID found in localStorage for request to ${config.url}`)
      }
    }

    logger.info(`📋 Final request headers:`, config.headers)
    return config
  },
  (error) => {
    logger.error("❌ API Request Error:", error)
    return Promise.reject(error)
  }
)

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    logger.info(
      `📥 API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`,
      {
        data: response.data,
        status: response.status,
        headers: response.headers
      }
    )
    return response
  },
  (error) => {
    logger.error("❌ API Response Error:", {
      error: error.response || error,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
      message: error.message
    })

    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Special case for settings page
      const isSettingsPage = window.location.pathname.includes("/settings")

      if (isSettingsPage) {
        // Per la pagina settings, mostra solo il toast senza redirect immediato
        toast.error("Sessione scaduta. Effettua nuovamente il login.")

        // Redirect dopo un ritardo per permettere all'utente di vedere il toast
        setTimeout(() => {
          sessionStorage.removeItem("currentWorkspace")
          window.location.href = "/auth/login"
        }, 2000)
      } else if (window.location.pathname === "/auth/login") {
        // Se già nella pagina di login, ricarica semplicemente la pagina
        sessionStorage.removeItem("currentWorkspace")
        window.location.reload()
      } else {
        // Per altre pagine, mostra toast e redirect
        toast.error("Sessione scaduta. Effettua nuovamente il login.")
        setTimeout(() => {
          sessionStorage.removeItem("currentWorkspace")
          window.location.href = "/auth/login"
        }, 2000)
      }
    }

    return Promise.reject(error)
  }
)

// API endpoints
export const auth = {
  login: async (credentials: { email: string; password: string }) => {
    // Pulisci la sessionStorage prima del login
    sessionStorage.removeItem("currentWorkspace")

    // Ora tenta il login con stato pulito
    return api.post("/auth/login", credentials)
  },
  logout: () => api.post("/auth/logout"),
}

export const workspaces = {
  list: () => api.get("/workspaces"),
  get: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: any) => api.post("/workspaces", data),
  update: (id: string, data: any) => api.put(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`),
}

export const products = {
  list: (workspaceId: string) =>
    api.get(`/workspaces/${workspaceId}/products?workspaceId=${workspaceId}`),
  get: (workspaceId: string, id: string) =>
    api.get(
      `/workspaces/${workspaceId}/products/${id}?workspaceId=${workspaceId}`
    ),
  create: (workspaceId: string, data: any) =>
    api.post(
      `/workspaces/${workspaceId}/products?workspaceId=${workspaceId}`,
      data
    ),
  update: (workspaceId: string, id: string, data: any) =>
    api.put(
      `/workspaces/${workspaceId}/products/${id}?workspaceId=${workspaceId}`,
      data
    ),
  delete: (workspaceId: string, id: string) =>
    api.delete(
      `/workspaces/${workspaceId}/products/${id}?workspaceId=${workspaceId}`
    ),
}
