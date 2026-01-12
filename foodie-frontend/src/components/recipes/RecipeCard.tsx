'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, BarChart, ChefHat, Users } from 'lucide-react';
import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  if (!recipe) return null;
  
  return (
    <Link href={`/recipes/${recipe.id}`}>
      <motion.div
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="bg-surface-highlight rounded-2xl shadow-lg hover:shadow-glow overflow-hidden border border-white/5 h-full flex flex-col group"
      >
        <div className="relative h-56 w-full bg-gray-800 overflow-hidden">
           {/* Recipe Image */}
           <motion.img 
             src={recipe.image || '/placeholder-recipe.jpg'} 
             alt={recipe.title}
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
           />
           
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
           
           {/* Chef Badge */}
           {recipe.source_type === 'chef' && (
             <div className="absolute top-4 right-4 z-10">
               <Badge className="bg-accent text-white backdrop-blur-md px-3 py-1.5 text-xs font-bold border-0 shadow-glow">
                  <ChefHat className="w-3.5 h-3.5 mr-1.5" /> Chef Version
               </Badge>
             </div>
           )}
           
           {/* Category Badge */}
           <div className="absolute bottom-4 left-4 z-10">
             <Badge className="bg-black/70 text-white backdrop-blur-md border-0 px-3 py-1">
               {recipe?.category?.name}
             </Badge>
           </div>
        </div>
        
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-accent transition-colors">
            {recipe.title}
          </h3>
          
          <p className="text-muted text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
            {recipe.description}
          </p>
          
          {/* Recipe Stats */}
          <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-white font-medium">{recipe.prep_time}m</span>
            </div>
            <div className="flex items-center gap-1.5 capitalize">
              <BarChart className="w-4 h-4 text-accent" />
              <span className="text-white font-medium">{recipe.difficulty}</span>
            </div>
            {recipe.servings && (
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent" />
                <span className="text-white font-medium">{recipe.servings}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
