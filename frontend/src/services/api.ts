import axios from "axios"

// Create an axios instance with custom config
export const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add the auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login on auth error
      localStorage.clear()
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  }
)
