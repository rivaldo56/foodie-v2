import { apiClient, apiRequest, ApiResponse } from '../lib/api';

export interface ClientOnboardingData {
    preferred_cuisines?: string[];
    allergies?: string[];
    budget_range?: string;
    occasion_types?: string[];
    dining_frequency?: string;
    location?: string;
    dietary_preferences?: string[];
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

    // Client Flows
    async saveClientData(data: ClientOnboardingData): Promise<ApiResponse<any>> {
        return apiRequest({
            url: '/users/onboarding/client/',
            method: 'PATCH', // RetrieveUpdateAPIView supports PATCH
            data,
        }, true);
    },

    // Chef Flows
    async saveChefData(data: ChefOnboardingData): Promise<ApiResponse<any>> {
        return apiRequest({
            url: '/chefs/onboarding/',
            method: 'PATCH',
            data,
        }, true);
    },

    // Complete Onboarding (Both roles)
    async completeOnboarding(): Promise<ApiResponse<{ message: string; next_screen: string }>> {
        return apiRequest({
            url: '/users/onboarding/complete/',
            method: 'POST',
        }, true);
    }
};
