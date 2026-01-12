'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, BarChart, Loader2, Utensils, ChefHat, Users } from 'lucide-react';
import { recipeService } from '@/services/recipe.service';
import { Recipe } from '@/types/recipe';
import { RecipeActions } from '@/components/recipes/RecipeActions';
import BackButton from '@/components/BackButton';
import { Badge } from '@/components/ui/badge';

export default function RecipeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await recipeService.getById(id);
        if (res.data) {
          setRecipe(res.data);
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        setError('Failed to load recipe');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipe();
  }, [id]);

  const handleUpdateRecipe = (updated: Recipe) => {
    setRecipe(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-elevated flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-surface-elevated flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-muted mb-6">{error || 'Recipe not found'}</p>
        <BackButton label="Back to Recipes" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-elevated pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 mb-6">
        <BackButton label="Back to Recipes" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Image and Actions */}
          <div className="space-y-6">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="rounded-3xl overflow-hidden aspect-[4/3] bg-gray-800 shadow-glow relative"
            >
              <img 
                src={recipe.image || '/placeholder-recipe.jpg'} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              {recipe.source_type === 'chef' && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-black/80 text-white backdrop-blur-md px-3 py-1 text-sm border-0">
                    <ChefHat className="h-4 w-4 mr-1 text-accent" />
                    Chef Version
                  </Badge>
                </div>
              )}
            </motion.div>

            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
            >
                <RecipeActions recipe={recipe} onUpdate={handleUpdateRecipe} />
            </motion.div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-8 text-white">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                 <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">
                    {recipe.category?.name}
                 </Badge>
                 {recipe.diet_tags.map(tag => (
                   <span key={tag} className="text-xs text-muted uppercase tracking-wider bg-white/5 px-2 py-1 rounded-md">
                     {tag}
                   </span>
                 ))}
              </div>
              
              <h1 className="text-4xl font-bold mb-4 leading-tight">{recipe.title}</h1>
              <p className="text-lg text-muted leading-relaxed">
                {recipe.description}
              </p>

              <div className="flex items-center gap-8 mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{recipe.prep_time} mins</span>
                </div>
                <div className="flex items-center gap-2 capitalize">
                  <BarChart className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">{recipe.difficulty}</span>
                </div>
                {recipe.servings && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="font-medium">{recipe.servings} servings</span>
                  </div>
                )}
              </div>
            </motion.div>

            <div className="grid md:grid-cols-1 gap-8">
               {/* Ingredients */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="bg-surface-highlight rounded-2xl p-6 border border-white/5"
               >
                 <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                   <Utensils className="h-5 w-5 text-accent" /> Ingredients
                 </h3>
                 <ul className="space-y-2">
                   {recipe.ingredients.map((ingredient, i) => (
                     <li key={i} className="flex items-start gap-2 text-gray-300">
                       <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                       <span>{ingredient}</span>
                     </li>
                   ))}
                 </ul>
               </motion.div>

               {/* Steps */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
               >
                 <h3 className="text-xl font-bold mb-4">Instructions</h3>
                 <div className="space-y-6">
                   {recipe.steps.map((step, i) => (
                     <div key={i} className="flex gap-4">
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-highlight border border-white/10 flex items-center justify-center font-bold text-accent">
                         {i + 1}
                       </div>
                       <p className="text-gray-300 pt-1 leading-relaxed">
                         {step}
                       </p>
                     </div>
                   ))}
                 </div>
               </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
