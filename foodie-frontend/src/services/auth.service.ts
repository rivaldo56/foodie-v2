import api from '../lib/api';
import { ApiResponse } from '../lib/api';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    password2: string;
    full_name: string;
    role?: 'client' | 'chef' | 'admin';
    phone_number?: string;
}

export interface User {
    id: string;
    email: string;
    username: string;
    full_name: string;
    role: 'client' | 'chef' | 'admin';
    phone_number?: string;
    profile_picture?: string;
    onboarding_status?: string;
}

// Helper to reliably extract user role
export const getUserRole = (role: any): 'client' | 'chef' | 'admin' => {
    if (role === 'admin' || role === 'chef' || role === 'client') return role;
    return 'client';
};

// Helper to map Django user to our User interface
export const mapUser = (data: any): User => {
    return {
        id: String(data.id),
        email: data.email || '',
        username: data.username || '',
        full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Foodie User',
        role: getUserRole(data.role),
        phone_number: data.phone_number,
        profile_picture: data.profile_picture,
        onboarding_status: data.onboarding_status
    };
};

export const authService = {
    async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
        const response = await api.post('/users/login/', credentials);
        const { token, user } = response.data;
        
        if (typeof window !== 'undefined') {
            localStorage.setItem('foodie_token', token);
            document.cookie = `foodie_token=${token}; path=/; max-age=86400; SameSite=Lax`;
        }
        
        return {
            token,
            user: mapUser(user)
        };
    },

    async register(data: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> {
        const nameParts = data.full_name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const registrationData = {
            email: data.email,
            username: data.username || data.email.split('@')[0],
            password: data.password,
            password_confirm: data.password2,
            first_name: firstName,
            last_name: lastName,
            role: data.role || 'client',
            phone_number: data.phone_number || ''
        };

        try {
            const response = await api.post('/users/register/', registrationData);
            const { token, user } = response.data;
            
            if (typeof window !== 'undefined') {
                localStorage.setItem('foodie_token', token);
                document.cookie = `foodie_token=${token}; path=/; max-age=86400; SameSite=Lax`;
            }

            return {
                data: {
                    token,
                    user: mapUser(user)
                },
                status: 201
            };
        } catch (error: any) {
            return {
                error: error.response?.data?.message || error.response?.data?.detail || 'Registration failed',
                status: error.response?.status || 400
            };
        }
    },

    async getCurrentUser(): Promise<ApiResponse<User>> {
        try {
            const response = await api.get('/users/profile/');
            return {
                data: mapUser(response.data),
                status: 200
            };
        } catch (error: any) {
            return {
                error: error.response?.data?.detail || 'Not authenticated',
                status: error.response?.status || 401
            };
        }
    },

    async logout(): Promise<void> {
        try {
            await api.post('/users/logout/');
        } finally {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('foodie_token');
            }
        }
    },

    async updateProfile(formData: FormData): Promise<ApiResponse<User>> {
        try {
            // Django profile update expects JSON or Multipart
            // If formData is used for image upload, it should be sent as multipart
            const response = await api.patch('/users/profile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return {
                data: mapUser(response.data),
                status: 200
            };
        } catch (error: any) {
            return { error: error.response?.data?.detail || 'Update failed', status: 400 };
        }
    }
};

export const {
    login,
    register,
    getCurrentUser,
    logout,
    updateProfile
} = authService;
