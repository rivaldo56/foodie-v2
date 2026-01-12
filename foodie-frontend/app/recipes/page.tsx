'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Loader2 } from 'lucide-react';
import { recipeService } from '@/services/recipe.service';
import { Recipe, Category } from '@/types/recipe';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { RecipeFilters } from '@/components/recipes/RecipeFilters';
import BackButton from '@/components/BackButton';

function RecipesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get('search') || '';

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [recipesRes, categoriesRes] = await Promise.all([
          recipeService.getAll(),
          recipeService.getCategories()
        ]);
        
        if (recipesRes.data) {
           const recipesData = Array.isArray(recipesRes.data) ? recipesRes.data : 
                              (recipesRes.data as any).results ? (recipesRes.data as any).results : [];
           setRecipes(recipesData);
        }
        
        if (categoriesRes.data) {
            const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data :
                                  (categoriesRes.data as any).results ? (categoriesRes.data as any).results : [];
            setCategories(categoriesData);
        }
      } catch (err) {
        console.error("Failed to fetch recipes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filter logic
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? recipe.category?.slug === selectedCategory : true;
    const matchesDifficulty = selectedDifficulty ? recipe.difficulty === selectedDifficulty : true;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-surface-elevated pb-20">
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <BackButton label="Back to Home" />
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">House Recipes</h1>
          <p className="text-muted max-w-2xl mx-auto">
            Discover our collection of chef-crafted recipes you can cook at home. 
            From quick weeknight meals to impressive dinner party dishes.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <RecipeFilters 
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
            />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-surface-highlight text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent sm:text-sm"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface-highlight rounded-xl border border-white/5">
                <p className="text-muted text-lg">No recipes found matching your criteria.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    setSelectedDifficulty(null);
                  }}
                  className="mt-4 text-accent hover:text-accent-strong font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-elevated flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}>
      <RecipesContent />
    </Suspense>
  );
}
