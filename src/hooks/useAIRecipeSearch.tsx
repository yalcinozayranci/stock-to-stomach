import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AIRecipe, MealType, DietaryPreference, FoodAllergy } from '@/types/database';
import { toast } from 'sonner';

interface AISearchParams {
  ingredients: string[];
  allergies?: FoodAllergy[];
  dietaryPreferences?: DietaryPreference[];
  mealType?: MealType;
  count?: number;
}

interface AISearchResponse {
  recipes: AIRecipe[];
  totalFound: number;
}

export function useAIRecipeSearch() {
  const searchRecipes = useMutation({
    mutationFn: async ({ 
      ingredients, 
      allergies = [], 
      dietaryPreferences = [],
      mealType,
      count = 3 
    }: AISearchParams): Promise<AISearchResponse> => {
      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: { 
          ingredients, 
          allergies, 
          dietaryPreferences,
          mealType,
          count 
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data;
    },
    onError: (error: Error) => {
      console.error('AI recipe search error:', error);
      if (error.message.includes('Rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else if (error.message.includes('credits')) {
        toast.error('AI credits depleted. Please try again later.');
      } else {
        toast.error('Failed to generate recipes. Please try again.');
      }
    },
  });

  return {
    searchRecipes,
    isSearching: searchRecipes.isPending,
    searchResults: searchRecipes.data,
    resetSearch: searchRecipes.reset,
  };
}
