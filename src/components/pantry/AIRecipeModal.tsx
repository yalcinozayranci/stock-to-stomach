import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, ChefHat, Users, Loader2, Save } from 'lucide-react';
import { AIRecipe, cuisineLabels, dietaryLabels, RecipeIngredient } from '@/types/database';
import type { Json } from '@/integrations/supabase/types';
import { motion } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AIRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: AIRecipe | null;
  onStartCooking?: () => void;
}

export function AIRecipeModal({ open, onOpenChange, recipe, onStartCooking }: AIRecipeModalProps) {
  const { creditsRemaining, creditsTotal, tier, canCook, deductCredit, checkSubscription } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isStartingCooking, setIsStartingCooking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!recipe) return null;

  const handleStartCooking = async () => {
    if (!user || !canCook) return;
    
    setIsStartingCooking(true);
    try {
      // Deduct credit
      const success = await deductCredit();
      if (!success) {
        toast.error('Failed to deduct credit. Please try again.');
        return;
      }

      // Save recipe to database - build a proper insert object
      const recipeInsert = {
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        cooking_time_minutes: recipe.cooking_time_minutes,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        ingredients: recipe.ingredients as unknown as Json,
        instructions: recipe.instructions as unknown as Json,
        dietary_tags: recipe.dietary_tags,
        cuisine: recipe.cuisine,
        meal_type: recipe.meal_type,
        is_ai_generated: true,
        created_by: user.id,
      };

      const { data: savedRecipe, error: saveError } = await supabase
        .from('recipes')
        .insert([recipeInsert])
        .select()
        .single();

      if (saveError) throw saveError;

      // Add to cooking history
      await supabase.from('cooking_history').insert({
        user_id: user.id,
        recipe_id: savedRecipe.id,
      });

      await checkSubscription();
      
      toast.success('Recipe saved! Starting cooking mode...');
      onOpenChange(false);
      
      if (onStartCooking) {
        onStartCooking();
      }
      
      navigate(`/cook-now?recipe=${savedRecipe.id}`);
    } catch (error) {
      console.error('Error starting cooking:', error);
      toast.error('Failed to start cooking. Please try again.');
    } finally {
      setIsStartingCooking(false);
    }
  };

  const handleSaveForLater = async () => {
    if (!user) {
      toast.error('Please sign in to save recipes.');
      return;
    }

    setIsSaving(true);
    try {
      const recipeInsert = {
        title: recipe.title,
        description: recipe.description,
        image_url: recipe.image_url,
        cooking_time_minutes: recipe.cooking_time_minutes,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
        ingredients: recipe.ingredients as unknown as Json,
        instructions: recipe.instructions as unknown as Json,
        dietary_tags: recipe.dietary_tags,
        cuisine: recipe.cuisine,
        meal_type: recipe.meal_type,
        is_ai_generated: true,
        created_by: user.id,
      };
      
      const { error } = await supabase.from('recipes').insert([recipeInsert]);

      if (error) throw error;
      toast.success('Recipe saved for later!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      toast.error('Failed to save recipe.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Generated
              </Badge>
              {recipe.cuisine && recipe.cuisine !== 'other' && (
                <Badge variant="outline">
                  {cuisineLabels[recipe.cuisine]}
                </Badge>
              )}
              {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Uses {recipe.matchedIngredients.length} of your ingredients
                </Badge>
              )}
            </div>
            <DialogTitle className="text-2xl font-display">{recipe.title}</DialogTitle>
            <p className="text-muted-foreground mt-2">{recipe.description}</p>
          </DialogHeader>

          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {recipe.cooking_time_minutes} min
            </div>
            <div className="flex items-center gap-1">
              <ChefHat className="w-4 h-4" />
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings} servings
            </div>
          </div>

          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {recipe.dietary_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {dietaryLabels[tag] || tag}
                </Badge>
              ))}
            </div>
          )}

          {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                ✓ Uses your pantry ingredients:
              </p>
              <div className="flex flex-wrap gap-1">
                {recipe.matchedIngredients.map((ing) => (
                  <Badge key={ing} variant="outline" className="text-xs bg-white dark:bg-green-800 border-green-300 dark:border-green-600">
                    {ing}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing: RecipeIngredient, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-primary/60" />
                  <span>
                    {ing.amount} {ing.unit} {ing.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-3">Instructions</h3>
            <ol className="space-y-3">
              {recipe.instructions.map((step: string, idx: number) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Decision prompt */}
          <div className="mt-8 p-4 bg-gradient-to-br from-primary/5 to-accent/10 rounded-xl border border-primary/20">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-foreground">
                ✨ Ready to make <span className="text-primary">{recipe.title}</span>?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Click below and we'll guide you step by step with AI assistance.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <span>Meal credits:</span>
              <Badge variant={tier === 'free' ? 'secondary' : 'default'} className="capitalize">
                🍳 {creditsRemaining}/{creditsTotal} ({tier})
              </Badge>
            </div>
            
            {!canCook && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                <p className="text-sm text-destructive font-medium text-center">No credits remaining!</p>
                <p className="text-sm text-muted-foreground mt-1 text-center">
                  Upgrade your plan to continue cooking.
                </p>
                <div className="flex justify-center">
                  <Link to="/pricing">
                    <Button size="sm" className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade Now
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <Button
              onClick={handleStartCooking}
              disabled={!canCook || isStartingCooking || isSaving}
              className="w-full bg-gradient-warm text-base py-6"
            >
              {isStartingCooking ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ChefHat className="w-5 h-5 mr-2" />
              )}
              Yes, I want to cook ✅
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              After clicking, we'll deduct 1 credit and the AI Chef will assist you step by step.
            </p>
          </div>

          {/* Save option */}
          <div className="flex justify-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveForLater}
              disabled={isSaving || isStartingCooking}
              className="text-muted-foreground"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save for Later
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
