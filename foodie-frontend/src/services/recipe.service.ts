import { apiRequest, ApiResponse } from '../lib/api';
import { Recipe, Category } from '../types/recipe';

export const recipeService = {
  getAll: async (params?: any): Promise<ApiResponse<Recipe[]>> => {
    const response = await apiRequest({
        url: '/recipes/',
        method: 'GET',
        params
    });

    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return {
            data: (response.data as any).results,
            status: response.status,
        };
    }

    return response as unknown as ApiResponse<Recipe[]>;
  },
  getById: async (id: string): Promise<ApiResponse<Recipe>> => {
    return apiRequest({
        url: `/recipes/${id}/`,
        method: 'GET'
    });
  },
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await apiRequest({
        url: '/categories/',
        method: 'GET'
    });

    if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return {
            data: (response.data as any).results,
            status: response.status,
        };
    }
    
    return response as unknown as ApiResponse<Category[]>;
  },
  save: async (id: number): Promise<ApiResponse<{status: string, is_saved: boolean}>> => {
    return apiRequest({
        url: `/recipes/${id}/save/`,
        method: 'POST'
    }, true);
  },
  request: async (id: number, action: 'would_order' | 'request_chef'): Promise<ApiResponse<{status: string}>> => {
    return apiRequest({
        url: `/recipes/${id}/request_action/`,
        method: 'POST',
        data: { action }
    }, true);
  }
};
