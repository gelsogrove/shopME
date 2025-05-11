import axios from "axios";
import { toast } from "react-hot-toast";

// Create an axios instance with custom config
export const api = axios.create({
  baseURL: "/api",  // Set standard /api prefix for all API calls
  withCredentials: true, // Importante: invia i cookie con le richieste
})

// Add a request interceptor to handle authentication
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || {});
    // Non aggiungere token manualmente - il server usa cookie HTTP-only
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
    
    // Handle authentication errors (401)
    if (error.response && error.response.status === 401) {
      // Special case for settings page
      const isSettingsPage = window.location.pathname.includes('/settings');
      
      if (isSettingsPage) {
        // Per la pagina settings, mostra solo il toast senza redirect immediato
        toast.error("Sessione scaduta. Effettua nuovamente il login.");
        
        // Redirect dopo un ritardo per permettere all'utente di vedere il toast
        setTimeout(() => {
          sessionStorage.removeItem("currentWorkspace");
          window.location.href = "/auth/login";
        }, 2000);
      } else if (window.location.pathname === "/auth/login") {
        // Se già nella pagina di login, ricarica semplicemente la pagina
        sessionStorage.removeItem("currentWorkspace");
        window.location.reload();
      } else {
        // Per altre pagine, mostra toast e redirect
        toast.error("Sessione scaduta. Effettua nuovamente il login.");
        setTimeout(() => {
          sessionStorage.removeItem("currentWorkspace");
          window.location.href = "/auth/login";
        }, 2000);
      }
    }
    
    return Promise.reject(error)
  }
)

// API endpoints
export const auth = {
  login: async (credentials: { email: string; password: string }) => {
    // Pulisci la sessionStorage prima del login
    sessionStorage.removeItem("currentWorkspace");
    
    // Ora tenta il login con stato pulito
    return api.post("/auth/login", credentials);
  },
  logout: () => api.post("/auth/logout")
}

export const workspaces = {
  list: () => api.get("/workspaces"),
  get: (id: string) => api.get(`/workspaces/${id}`),
  create: (data: any) => api.post("/workspaces", data),
  update: (id: string, data: any) => api.put(`/workspaces/${id}`, data),
  delete: (id: string) => api.delete(`/workspaces/${id}`)
}

export const products = {
  list: (workspaceId: string) => api.get(`/workspaces/${workspaceId}/products?workspaceId=${workspaceId}`),
  get: (workspaceId: string, id: string) => api.get(`/workspaces/${workspaceId}/products/${id}?workspaceId=${workspaceId}`),
  create: (workspaceId: string, data: any) => api.post(`/workspaces/${workspaceId}/products?workspaceId=${workspaceId}`, data),
  update: (workspaceId: string, id: string, data: any) => api.put(`/workspaces/${workspaceId}/products/${id}?workspaceId=${workspaceId}`, data),
  delete: (workspaceId: string, id: string) => api.delete(`/workspaces/${workspaceId}/products/${id}?workspaceId=${workspaceId}`)
}
