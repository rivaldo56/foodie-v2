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
    // 1. Ensure trailing slash (except for files or URLs already having it or query params)
    if (config.url && !config.url.endsWith('/') && !config.url.includes('.') && !config.url.includes('?')) {
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
    config: { url: string; method?: string; data?: any; params?: any; [key: string]: any },
    authRequired: boolean = true
): Promise<ApiResponse<T>> {
    try {
        const response = await api({
            method: config.method || 'GET',
            ...config,
        });

        return { data: response.data, error: null, status: response.status };
    } catch (error: any) {
        console.error(`[API ERROR] ${config.method} ${config.url}:`, error.response?.data || error.message);
        
        // Handle unauthorized redirections or token refreshes here if needed
        
        const message = error.response?.data?.detail 
            || (error.response?.data ? Object.values(error.response.data).flat().join(' ') : null)
            || error.message;
            
        return { data: null, error: message, status: error.response?.status };
    }
}



export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status?: number;
};

// --- Mock Data ---

export const mockMeals = [
  {
    id: 1,
    name: 'Grilled Tilapia with Kachumbari',
    description: 'Fresh Lake Victoria tilapia marinated in lime and cilantro, served with spicy tomato-onion salsa.',
    price: 1200,
    category: 'Seafood',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    chef: 1,
    chef_name: 'Chef Mutua',
    location: 'Nairobi',
  },
  {
    id: 2,
    name: 'Swahili Coconut Curry',
    description: 'Creamy coconut milk curry with braised beef and traditional coastal spices.',
    price: 950,
    category: 'Swahili',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1455619411447-36e100c1736a',
    chef: 2,
    chef_name: 'Chef Aisha',
    location: 'Mombasa',
  },
  {
    id: 3,
    name: 'Organic Kale & Quinoa Bowl',
    description: 'Local sukuma wiki infused with lemon-tahini dressing and ancient grains.',
    price: 800,
    category: 'Vegan',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    chef: 1,
    chef_name: 'Chef Mutua',
    location: 'Nairobi',
  }
];

export const mockChefs = [
  {
    id: 1,
    user: { full_name: 'Chef Mutua' },
    bio: 'Master of contemporary Kenyan fusion with 12 years of experience in luxury safari lodges.',
    specialties: ['Fusion', 'Organic'],
    average_rating: 4.9,
    profile_picture: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548',
    cuisine_types: ['Fusion', 'Kenyan'],
    location: 'Nairobi',
  },
  {
    id: 2,
    user: { full_name: 'Chef Aisha' },
    bio: 'Coastal spice specialist bringing the flavors of Old Town Mombasa to your private dinner table.',
    specialties: ['Swahili', 'Seafood'],
    average_rating: 4.8,
    profile_picture: 'https://images.unsplash.com/photo-1595273670150-db0a3d39d444',
    cuisine_types: ['Coast', 'Arabian'],
    location: 'Mombasa',
  }
];

export default api;


