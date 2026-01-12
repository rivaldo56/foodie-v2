'use client';

import React, { useState } from 'react';
import { Heart, ShoppingBag, ChefHat, Loader2, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { recipeService } from '@/services/recipe.service';
import { Recipe } from '@/types/recipe';
import { Badge } from '@/components/ui/badge';

interface RecipeActionsProps {
  recipe: Recipe;
  onUpdate: (updatedRecipe: Recipe) => void;
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({ recipe, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Parse state from props (assuming recipe object has these fields populated by serializer)
  const isSaved = recipe.is_saved || false;
  // is_requested is an array of actions, e.g. ['would_order']
  const requestActions = recipe.is_requested || [];
  const wouldOrder = requestActions.includes('would_order');
  const requestedChef = requestActions.includes('request_chef');

  const handleAuthCheck = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!handleAuthCheck()) return;
    
    try {
      setSaving(true);
      const res = await recipeService.save(recipe.id);
      if (res.data) {
        onUpdate({ 
           ...recipe, 
           is_saved: res.data.is_saved 
        });
      }
    } catch (error) {
      console.error('Failed to save recipe', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async (action: 'would_order' | 'request_chef') => {
    if (!handleAuthCheck()) return;
    if (action === 'would_order' && wouldOrder) return;
    if (action === 'request_chef' && requestedChef) return;

    try {
      setRequesting(true);
      const res = await recipeService.request(recipe.id, action);
      if (res.data) {
        // Optimistically update
        const newActions = [...requestActions, action];
        onUpdate({ 
           ...recipe, 
           is_requested: newActions 
        });
      }
    } catch (error) {
      console.error('Failed to request recipe', error);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-4 mt-6">
      <button
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
          isSaved 
            ? 'bg-red-50 text-red-600 border border-red-200' 
            : 'bg-surface-highlight text-white border border-white/10 hover:bg-white/10'
        }`}
      >
        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />}
        {isSaved ? 'Saved' : 'Save Recipe'}
      </button>

      <button
        onClick={() => handleRequest('would_order')}
        disabled={requesting || wouldOrder}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
          wouldOrder
            ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
            : 'bg-accent text-white hover:bg-accent-strong shadow-lg shadow-accent/20'
        }`}
      >
        {wouldOrder ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
        {wouldOrder ? 'Would Order!' : 'I Would Order This'}
      </button>

      <button
        onClick={() => handleRequest('request_chef')}
        disabled={requesting || requestedChef}
        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
           requestedChef
           ? 'bg-purple-50 text-purple-600 border border-purple-200 cursor-default'
           : 'bg-surface-highlight text-white border border-white/10 hover:bg-white/10'
        }`}
      >
        {requestedChef ? <Check className="h-5 w-5" /> : <ChefHat className="h-5 w-5" />}
        {requestedChef ? 'Requested' : 'Request Chef Version'}
      </button>
    </div>
  );
};
