import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for HttpOnly cookies
});

// Request interceptor to ensure trailing slashes and attach tokens (fallback)
api.interceptors.request.use(
  (config) => {
    // 1. Ensure trailing slash (except for files or URLs already having it)
    if (config.url && !config.url.endsWith('/') && !config.url.includes('.')) {
      config.url += '/';
    }

    // 2. Fallback: If access token exists in localStorage (legacy support), attach it.
    // In the new flow, the browser handles HttpOnly cookies automatically.
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear legacy storage upon unauthorized error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);



/**
 * Generic API request helper to standardize error handling and typing.
 * Used by most services and hooks.
 */
export async function apiRequest<T>(
    config: { url: string; method: string; data?: any; params?: any; [key: string]: any },
    authRequired: boolean = true
): Promise<ApiResponse<T>> {
    try {
        const response = await api({
            ...config,
        });
        return { data: response.data, error: null };
    } catch (error: any) {
        console.error(`[API ERROR] ${config.method} ${config.url}:`, error.response?.data || error.message);
        
        // Handle unauthorized redirections or token refreshes here if needed
        
        const message = error.response?.data?.detail 
            || (error.response?.data ? Object.values(error.response.data).flat().join(' ') : null)
            || error.message;
            
        return { data: null, error: message };
    }
}


export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

export default api;

