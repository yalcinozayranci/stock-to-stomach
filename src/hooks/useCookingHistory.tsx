import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface CookingEntry {
  id: string;
  user_id: string;
  recipe_id: string;
  cooked_at: string;
  photo_url: string | null;
  rating: number | null;
  notes: string | null;
  feedback: string | null;
  recipe?: {
    id: string;
    title: string;
    image_url: string | null;
    cooking_time_minutes: number | null;
    difficulty: string;
    cuisine: string;
  };
}

export function useCookingHistory() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cookingHistory = [], isLoading } = useQuery({
    queryKey: ['cooking-history', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('cooking_history')
        .select(`
          *,
          recipe:recipes(id, title, image_url, cooking_time_minutes, difficulty, cuisine)
        `)
        .eq('user_id', user.id)
        .order('cooked_at', { ascending: false });
      
      if (error) throw error;
      return data as CookingEntry[];
    },
    enabled: !!user,
  });

  const addCookingEntry = useMutation({
    mutationFn: async ({
      recipeId,
      photoUrl,
      rating,
      notes,
      feedback,
    }: {
      recipeId: string;
      photoUrl?: string;
      rating?: number;
      notes?: string;
      feedback?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('cooking_history')
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          photo_url: photoUrl,
          rating,
          notes,
          feedback,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooking-history', user?.id] });
      toast.success('Added to your cooking journal! 🎉');
    },
    onError: (error) => {
      toast.error('Failed to save cooking entry');
      console.error(error);
    },
  });

  const updateCookingEntry = useMutation({
    mutationFn: async ({
      id,
      photoUrl,
      rating,
      notes,
      feedback,
    }: {
      id: string;
      photoUrl?: string;
      rating?: number;
      notes?: string;
      feedback?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('cooking_history')
        .update({
          photo_url: photoUrl,
          rating,
          notes,
          feedback,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cooking-history', user?.id] });
      toast.success('Entry updated!');
    },
    onError: (error) => {
      toast.error('Failed to update entry');
      console.error(error);
    },
  });

  const getRecentCooks = () => {
    return cookingHistory.slice(0, 5);
  };

  const getCookCountForRecipe = (recipeId: string) => {
    return cookingHistory.filter(entry => entry.recipe_id === recipeId).length;
  };

  return {
    cookingHistory,
    isLoading,
    addCookingEntry,
    updateCookingEntry,
    getRecentCooks,
    getCookCountForRecipe,
  };
}
