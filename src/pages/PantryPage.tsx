import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usePantry } from '@/hooks/usePantry';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useRecipes } from '@/hooks/useRecipes';
import { useSubscription } from '@/hooks/useSubscription';
import { useAIRecipeSearch } from '@/hooks/useAIRecipeSearch';
import { PantryItemCard } from '@/components/pantry/PantryItemCard';
import { AddIngredientModal } from '@/components/pantry/AddIngredientModal';
import { RecipeSelectionModal } from '@/components/pantry/RecipeSelectionModal';
import { AIRecipeModal } from '@/components/pantry/AIRecipeModal';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/auth/AuthModal';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Search, Sunrise, Sun, Moon, Cake, Cookie, CheckSquare, X, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { AIRecipe, MealType, mealTypeLabels } from '@/types/database';
import { toast } from 'sonner';

export default function PantryPage() {
  const { user } = useAuth();
  const { pantryItems, isLoading, addItem, deleteItem } = usePantry();
  const { profile } = useProfile();
  const { saveAIRecipe } = useRecipes();
  const { creditsRemaining, creditsTotal, canCook, deductCredit } = useSubscription();
  const { searchRecipes, isSearching, searchResults, resetSearch } = useAIRecipeSearch();
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectionModalOpen, setSelectionModalOpen] = useState(false);
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<AIRecipe | null>(null);
  
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

  const mealTypeIcons = {
    breakfast: <Sunrise className="w-4 h-4" />,
    lunch: <Sun className="w-4 h-4" />,
    dinner: <Moon className="w-4 h-4" />,
    dessert: <Cake className="w-4 h-4" />,
    snack: <Cookie className="w-4 h-4" />,
  };

  const toggleItemSelection = (itemId: string, selected: boolean) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedItemIds(new Set());
    setSelectionMode(false);
  };

  const selectAll = () => {
    setSelectedItemIds(new Set(pantryItems.map(item => item.id)));
  };

  // Get ingredients based on selection mode
  const getIngredientsForRecipe = () => {
    if (selectionMode && selectedItemIds.size > 0) {
      return pantryItems
        .filter(item => selectedItemIds.has(item.id))
        .map(item => item.name);
    }
    return pantryItems.map(item => item.name);
  };

  // Search for recipes using AI
  const handleFindRecipes = async () => {
    const ingredients = getIngredientsForRecipe();
    
    if (ingredients.length === 0) {
      toast.error(selectionMode 
        ? 'Select at least one ingredient!' 
        : 'Add some ingredients to your pantry first!');
      return;
    }

    const allergies = profile?.allergies || [];
    const dietaryPreferences = profile?.dietary_preferences || [];

    setSelectionModalOpen(true);
    resetSearch();

    try {
      await searchRecipes.mutateAsync({
        ingredients,
        allergies,
        dietaryPreferences,
        count: 3,
      });
    } catch (error) {
      // Error is handled by the hook
    }
  };

  // User selects a recipe from the grid
  const handleSelectRecipe = (recipe: AIRecipe) => {
    setSelectedRecipe(recipe);
    setSelectionModalOpen(false);
    setRecipeModalOpen(true);
  };

  // Close recipe modal and clear selection
  const handleRecipeModalClose = (open: boolean) => {
    setRecipeModalOpen(open);
    if (!open) {
      setSelectedRecipe(null);
    }
  };

  // User has started cooking, clear all state
  const handleStartCooking = () => {
    setRecipeModalOpen(false);
    setSelectedRecipe(null);
    clearSelection();
  };

  if (!user) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">My Pantry</h1>
          <p className="text-muted-foreground mb-6">Sign in to manage your ingredients.</p>
          <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-warm">Sign In</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">My Pantry</h1>
            <p className="text-muted-foreground">{pantryItems.length} ingredients</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="py-1.5 px-3">
              🍳 {creditsRemaining}/{creditsTotal} meals
            </Badge>
            <div className="flex gap-2">
              {!selectionMode ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setSelectionMode(true)}
                    disabled={pantryItems.length === 0}
                    className="gap-2"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Select Items
                  </Button>
                  <Button
                    onClick={handleFindRecipes}
                    disabled={pantryItems.length === 0 || isSearching}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Recipes
                  </Button>
                </>
              ) : (
                <Button variant="ghost" onClick={clearSelection} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              )}
              <Button onClick={() => setAddModalOpen(true)} className="bg-gradient-warm gap-2">
                <Plus className="w-4 h-4" /> Add Ingredient
              </Button>
            </div>
          </div>
        </div>

        {/* Selection mode toolbar */}
        <AnimatePresence>
          {selectionMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium">
                    {selectedItemIds.size === 0 
                      ? 'Tap items to select them' 
                      : `${selectedItemIds.size} item${selectedItemIds.size > 1 ? 's' : ''} selected`}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAll}>
                      Select All
                    </Button>
                    {selectedItemIds.size > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => setSelectedItemIds(new Set())}>
                        Clear Selection
                      </Button>
                    )}
                  </div>
                </div>
                
                <Button
                  onClick={handleFindRecipes}
                  disabled={selectedItemIds.size === 0 || isSearching}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with {selectedItemIds.size} item{selectedItemIds.size !== 1 ? 's' : ''}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="text-center py-12">Loading...</div>
        ) : pantryItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Your pantry is empty. Add ingredients to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {pantryItems.map((item) => (
                <PantryItemCard 
                  key={item.id} 
                  item={item} 
                  onDelete={() => deleteItem.mutate(item.id)}
                  selectionMode={selectionMode}
                  isSelected={selectedItemIds.has(item.id)}
                  onSelect={(selected) => toggleItemSelection(item.id, selected)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        <AddIngredientModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onAdd={(item) => addItem.mutate(item)}
          isLoading={addItem.isPending}
        />

        <RecipeSelectionModal
          open={selectionModalOpen}
          onOpenChange={setSelectionModalOpen}
          recipes={searchResults?.recipes || []}
          isLoading={isSearching}
          onSelectRecipe={handleSelectRecipe}
          totalFound={searchResults?.totalFound}
        />

        <AIRecipeModal
          open={recipeModalOpen}
          onOpenChange={handleRecipeModalClose}
          recipe={selectedRecipe}
          onStartCooking={handleStartCooking}
        />
      </div>
    </Layout>
  );
}
