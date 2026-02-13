import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeIngredient, DietaryPreference, MealType } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { Json } from '@/integrations/supabase/types';

export function useRecipes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(recipe => ({
        ...recipe,
        ingredients: recipe.ingredients as unknown as RecipeIngredient[],
        instructions: recipe.instructions as unknown as string[],
        dietary_tags: recipe.dietary_tags as DietaryPreference[],
        meal_type: (recipe.meal_type as MealType) || 'dinner',
      })) as Recipe[];
    },
  });

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorite_recipes')
        .select('recipe_id')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data.map(f => f.recipe_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const isFavorite = favoriteIds.includes(recipeId);
      
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_id', recipeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorite_recipes')
          .insert({ user_id: user.id, recipe_id: recipeId });
        if (error) throw error;
      }
      
      return !isFavorite;
    },
    onSuccess: (isNowFavorite) => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast.success(isNowFavorite ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error) => {
      toast.error('Failed to update favorites');
      console.error(error);
    },
  });

  const markAsCooked = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('cooking_history')
        .insert({ user_id: user.id, recipe_id: recipeId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooking-history', user?.id] });
      toast.success('Marked as cooked! 🎉');
    },
    onError: (error) => {
      toast.error('Failed to log cooking');
      console.error(error);
    },
  });

  const generateAIRecipe = useMutation({
    mutationFn: async ({ 
      ingredients, 
      dietaryPreferences,
      allergies,
      cuisine,
      mealType,
    }: { 
      ingredients: string[]; 
      dietaryPreferences?: string[];
      allergies?: string[];
      cuisine?: string;
      mealType?: MealType;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { ingredients, dietaryPreferences, allergies, cuisine, mealType },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data.recipe;
    },
    onError: (error: Error) => {
      if (error.message.includes('Rate limit')) {
        toast.error('Too many requests. Please wait a moment.');
      } else if (error.message.includes('credits')) {
        toast.error('AI credits depleted. Please try later.');
      } else {
        toast.error('Failed to generate recipe');
      }
      console.error(error);
    },
  });

  const saveAIRecipe = useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'id' | 'created_at'>) => {
      if (!user) throw new Error('Not authenticated');
      
      const recipeToInsert = {
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        cooking_time_minutes: recipe.cooking_time_minutes,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        ingredients: JSON.parse(JSON.stringify(recipe.ingredients)) as Json,
        instructions: recipe.instructions as Json,
        dietary_tags: recipe.dietary_tags,
        is_ai_generated: true,
        is_public: true,
        created_by: user.id,
      };
      
      const { data, error } = await supabase
        .from('recipes')
        .insert([recipeToInsert])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe saved!');
    },
    onError: (error) => {
      toast.error('Failed to save recipe');
      console.error(error);
    },
  });

  const updateRecipe = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Recipe> }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('recipes')
        .update({
          title: updates.title,
          description: updates.description,
          cooking_time_minutes: updates.cooking_time_minutes,
          difficulty: updates.difficulty,
          servings: updates.servings,
          ingredients: updates.ingredients ? JSON.parse(JSON.stringify(updates.ingredients)) as Json : undefined,
          instructions: updates.instructions as Json | undefined,
          dietary_tags: updates.dietary_tags,
        })
        .eq('id', id)
        .eq('created_by', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe updated!');
    },
    onError: (error) => {
      toast.error('Failed to update recipe');
      console.error(error);
    },
  });

  const deleteRecipe = useMutation({
    mutationFn: async (recipeId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId)
        .eq('created_by', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast.success('Recipe deleted!');
    },
    onError: (error) => {
      toast.error('Failed to delete recipe');
      console.error(error);
    },
  });

  return {
    recipes,
    isLoading,
    favoriteIds,
    toggleFavorite,
    markAsCooked,
    generateAIRecipe,
    saveAIRecipe,
    updateRecipe,
    deleteRecipe,
    userId: user?.id,
  };
}
