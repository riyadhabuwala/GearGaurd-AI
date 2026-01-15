import axios from 'axios'
import { getToken } from '../utils/authStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Line-by-line explanation
// import axios from 'axios'

// Brings in Axios: the HTTP client library used to call your backend APIs.
// import { getToken } from '../utils/authStorage'

// Imports a helper that reads the JWT token from browser storage
// (localStorage).
// This is how the frontend remembers you are logged in across refreshes.
// const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// import.meta.env is how Vite exposes environment variables to the frontend.
// If you set VITE_API_BASE_URL, we use it.
// If not set, we default to http://localhost:5000 (your backend dev server).
// export const http = axios.create({ ... })

// Creates a dedicated Axios instance.
// Why not axios.get(...) everywhere?
// Because we want one shared place to set baseURL and headers (and later error handling).
// baseURL,

// Sets the base URL for every request made using http.
// Example: http.get('/api/equipment') becomes:
// ${baseURL}/api/equipment
// headers: { 'Content-Type': 'application/json' }

// Sets default headers for requests.
// Tells the backend: “I’m sending JSON bodies.”
// http.interceptors.request.use((config) => { ... })

// Axios “interceptor” runs before every request.
// This is where we auto-attach the JWT token to all calls.
// const token = getToken()

// Reads the saved JWT from storage (localStorage).
// if (token) { ... }

// Only attach auth header if we actually have a token.
// If not logged in, calls remain unauthenticated.
// config.headers = config.headers ?? {}

// Ensures config.headers exists.
// ?? means “if left side is null/undefined, use right side”.
// config.headers.Authorization = \Bearer ${token}``

// Adds the standard JWT header format used by most APIs:
// Authorization: Bearer <JWT>
// Your backend can now verify the token and allow/deny access.
// return config

// Must return the config so Axios can continue sending the request.