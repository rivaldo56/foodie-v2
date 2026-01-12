
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  image: string; // URL from Cloudinary (or serialized ImageField)
  ingredients: string[]; // JSON array
  steps: string[]; // JSON array
  prep_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: Category;
  diet_tags: string[];
  source_type: 'house' | 'chef';
  created_at: string;
  updated_at: string;
  is_saved?: boolean;
  is_requested?: string[];
}
