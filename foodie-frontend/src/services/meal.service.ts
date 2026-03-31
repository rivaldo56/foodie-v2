import api from '@/lib/api';

export interface Meal {
  id: string | number;
  chef?: number;
  chef_name?: string;
  name: string;
  description: string | null;
  category: string;
  price_per_serving: string | number;
  preparation_time: number;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_dairy_free: boolean;
  allergens: string[];
  is_available: boolean;
  image: string | null;
  ingredients: string[];
  delivery_available: boolean;
  pickup_available: boolean;
  meal_prep_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuMeal extends Meal {
  order_index: number;
  course_type: 'starter' | 'main' | 'dessert';
}

export const mealService = {
  async getMeals() {
    return api.get<Meal[]>('/bookings/menu-items/discovery/');
  },

  async getMealById(id: string | number) {
    return api.get<Meal>(`/bookings/menu-items/${id}/`);
  },

  async createMeal(meal: Partial<Meal>) {
    return api.post<Meal>('/bookings/menu-items/create/', meal);
  },

  async updateMeal(id: string | number, updates: Partial<Meal>) {
    return api.patch<Meal>(`/bookings/menu-items/${id}/update/`, updates);
  },

  async deleteMeal(id: string | number) {
    return api.delete(`/bookings/menu-items/${id}/delete/`);
  },

  async uploadMealImage(file: File, mealId: string | number) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.patch<Meal>(`/bookings/menu-items/${mealId}/update/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.image;
  },

  async getMealsByCategory(category: string) {
    return api.get<Meal[]>(`/bookings/menu-items/discovery/?category=${category}`);
  },

  async getChefMeals(chefId: string | number) {
    return api.get<Meal[]>(`/bookings/chef/${chefId}/menu-items/`);
  },

  async getMenuMeals(bookingId: string | number) {
    // In Django, menu items are linked to bookings via BookingMenuItem
    return api.get<any[]>(`/bookings/${bookingId}/menu-items/`);
  },

  async assignMealsToBooking(bookingId: string | number, mealDetails: { menu_item_id: number; quantity: number; special_instructions?: string }[]) {
    // Django has an endpoint to add menu items to a booking
    const promises = mealDetails.map(detail => 
      api.post(`/bookings/${bookingId}/menu-items/add/`, detail)
    );
    return Promise.all(promises);
  }
};
