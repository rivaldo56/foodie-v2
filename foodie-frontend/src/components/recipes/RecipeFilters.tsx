'use client';

import React from 'react';
import { Category } from '@/types/recipe';

interface RecipeFiltersProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  selectedDifficulty: string | null;
  onSelectDifficulty: (diff: string | null) => void;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedDifficulty,
  onSelectDifficulty,
}) => {
  if (!Array.isArray(categories)) {
     return null;
  }
  return (
    <div className="bg-surface-highlight p-5 rounded-2xl border border-white/5 space-y-6 shadow-lg">
      <div>
        <h4 className="font-bold text-white mb-4 text-lg">Categories</h4>
        <div className="space-y-2">
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-accent text-white shadow-glow'
                : 'text-gray-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
             if (!cat) return null;
             return (
             <button
             key={cat.id || Math.random()}
             onClick={() => onSelectCategory(cat.slug)}
             className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
               selectedCategory === cat.slug
                 ? 'bg-accent text-white shadow-glow'
                 : 'text-gray-300 hover:bg-white/5 hover:text-white'
             }`}
           >
             {cat.name || 'Unnamed Category'}
           </button>
             );
          })}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-white mb-4 text-lg">Difficulty</h4>
        <div className="space-y-2">
            {['easy', 'medium', 'hard'].map((diff) => (
                <button
                key={diff}
                onClick={() => onSelectDifficulty(selectedDifficulty === diff ? null : diff)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all capitalize ${
                  selectedDifficulty === diff
                    ? 'bg-accent text-white shadow-glow'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};
