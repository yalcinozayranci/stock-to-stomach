import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingListItem } from '@/types/database';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useShoppingList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: shoppingItems = [], isLoading } = useQuery({
    queryKey: ['shopping-list', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('shopping_list_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ShoppingListItem[];
    },
    enabled: !!user,
  });

  const addItem = useMutation({
    mutationFn: async (item: {
      name: string;
      quantity?: string;
      unit?: string;
      recipe_id?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert({
          user_id: user.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          recipe_id: item.recipe_id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to add item');
      console.error(error);
    },
  });

  const addMultipleItems = useMutation({
    mutationFn: async (items: Array<{ name: string; quantity?: string; unit?: string; recipe_id?: string }>) => {
      if (!user) throw new Error('Not authenticated');
      
      const itemsToInsert = items.map(item => ({
        user_id: user.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        recipe_id: item.recipe_id,
      }));

      const { data, error } = await supabase
        .from('shopping_list_items')
        .insert(itemsToInsert)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success(`Added ${data.length} items to shopping list`);
    },
    onError: (error) => {
      toast.error('Failed to add items');
      console.error(error);
    },
  });

  const togglePurchased = useMutation({
    mutationFn: async ({ id, is_purchased }: { id: string; is_purchased: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('shopping_list_items')
        .update({ is_purchased })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to update item');
      console.error(error);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
    },
    onError: (error) => {
      toast.error('Failed to delete item');
      console.error(error);
    },
  });

  const clearPurchased = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('user_id', user.id)
        .eq('is_purchased', true);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', user?.id] });
      toast.success('Cleared purchased items');
    },
    onError: (error) => {
      toast.error('Failed to clear items');
      console.error(error);
    },
  });

  const unpurchasedCount = shoppingItems.filter(item => !item.is_purchased).length;
  const purchasedCount = shoppingItems.filter(item => item.is_purchased).length;

  return {
    shoppingItems,
    isLoading,
    addItem,
    addMultipleItems,
    togglePurchased,
    deleteItem,
    clearPurchased,
    unpurchasedCount,
    purchasedCount,
  };
}
