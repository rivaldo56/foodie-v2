import api, { apiRequest, ApiResponse } from '../lib/api';

export interface ClientOnboardingData {
    preferred_cuisines?: string[];
    allergies?: string[];
    budget_range?: string;
    occasion_types?: string[];
    dining_frequency?: string;
    location?: string;
    dietary_preferences?: string[];
    allergies_details?: string;
}

export interface ChefOnboardingData {
    culinary_paths?: string[];
    specialties?: any[]; // Allow JSON objects for specialties
    experience_level?: string;
    portfolio_media?: string[];
    availability_options?: string[];
    pricing_tier?: string;
    certifications?: string[];
    identity_verification_status?: string;
}

export interface OnboardingStatus {
    onboarding_status: 'not_started' | 'in_progress' | 'complete';
    role: string;
}

export const onboardingService = {
    // Check current status
    async getStatus(): Promise<ApiResponse<OnboardingStatus>> {
        return apiRequest({
            url: '/users/onboarding/status/',
            method: 'GET',
        }, true);
    },

    async saveClientData(data: ClientOnboardingData): Promise<ApiResponse<any>> {
        return apiRequest({
            url: '/users/onboarding/client/',
            method: 'PATCH',
            data,
        }, true);
    },

    async getClientData(): Promise<ApiResponse<ClientOnboardingData>> {
        return apiRequest({
            url: '/users/onboarding/client/',
            method: 'GET',
        }, true);
    },


    async saveChefData(data: ChefOnboardingData): Promise<ApiResponse<any>> {
        return apiRequest({
            url: '/chefs/onboarding/',
            method: 'PATCH',
            data,
        }, true);
    },

    async getChefData(): Promise<ApiResponse<ChefOnboardingData>> {
        return apiRequest({
            url: '/chefs/onboarding/',
            method: 'GET',
        }, true);
    },


    // Complete Onboarding (Both roles)
    async completeOnboarding(): Promise<ApiResponse<{ message: string; next_screen: string }>> {
        return apiRequest({
            url: '/users/onboarding/complete/',
            method: 'POST',
        }, true);
    },

    // File Upload
    async uploadFile(file: File, type: 'portfolio' | 'certifications'): Promise<ApiResponse<{ url: string; path: string }>> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        return apiRequest({
            url: '/chefs/upload/',
            method: 'POST',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }, true);
    }
};

