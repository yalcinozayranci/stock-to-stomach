import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PantryItem, IngredientCategory } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function usePantry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pantryItems = [], isLoading } = useQuery({
    queryKey: ['pantry', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PantryItem[];
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async (item: {
      name: string;
      category?: IngredientCategory;
      quantity?: string;
      unit?: string;
      expires_at?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({
          user_id: user.id,
          name: item.name,
          category: item.category || 'other',
          quantity: item.quantity,
          unit: item.unit,
          expires_at: item.expires_at,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry', user?.id] });
      toast.success('Ingredient added to pantry');
    },
    onError: (error) => {
      toast.error('Failed to add ingredient');
      console.error(error);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PantryItem> & { id: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('pantry_items')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry', user?.id] });
      toast.success('Ingredient updated');
    },
    onError: (error) => {
      toast.error('Failed to update ingredient');
      console.error(error);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pantry', user?.id] });
      toast.success('Ingredient removed from pantry');
    },
    onError: (error) => {
      toast.error('Failed to remove ingredient');
      console.error(error);
    },
  });

  const addMultipleItems = useMutation({
    mutationFn: async (items: Array<{ name: string; category: IngredientCategory }>) => {
      if (!user) throw new Error('Not authenticated');
      
      const itemsToInsert = items.map(item => ({
        user_id: user.id,
        name: item.name,
        category: item.category,
      }));

      const { data, error } = await supabase
        .from('pantry_items')
        .insert(itemsToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pantry', user?.id] });
      toast.success(`Added ${data.length} ingredients to pantry`);
    },
    onError: (error) => {
      toast.error('Failed to add ingredients');
      console.error(error);
    },
  });

  return {
    pantryItems,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    addMultipleItems,
  };
}
