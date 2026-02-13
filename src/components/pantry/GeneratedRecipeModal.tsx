import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, ChefHat, Users, Save, RefreshCw, Loader2 } from 'lucide-react';
import { Recipe, cuisineLabels, dietaryLabels } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '@/hooks/useSubscription';
import { Link } from 'react-router-dom';

interface GeneratedRecipeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipe: Omit<Recipe, 'id' | 'created_at'> | null;
  isLoading: boolean;
  onSave: () => void;
  onRegenerate: () => void;
  onStartCooking: () => void;
  isSaving: boolean;
  isStartingCooking?: boolean;
}

export function GeneratedRecipeModal({
  open,
  onOpenChange,
  recipe,
  isLoading,
  onSave,
  onRegenerate,
  onStartCooking,
  isSaving,
  isStartingCooking,
}: GeneratedRecipeModalProps) {
  const { creditsRemaining, creditsTotal, tier, canCook } = useSubscription();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-12 h-12 text-primary" />
              </motion.div>
              <p className="mt-4 text-lg font-medium text-foreground">Creating your recipe...</p>
              <p className="text-sm text-muted-foreground mt-1">Using your pantry ingredients</p>
            </motion.div>
          ) : recipe ? (
            <motion.div
              key="recipe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                  {recipe.cuisine && recipe.cuisine !== 'other' && (
                    <Badge variant="outline">
                      {cuisineLabels[recipe.cuisine]}
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
                  {recipe.difficulty}
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

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, idx) => (
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
                  {recipe.instructions.map((step, idx) => (
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
                    ✨ You can make <span className="text-primary">{recipe.title}</span> with your ingredients!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Ready to start cooking? Click below and we'll guide you step by step.
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

                <div className="flex gap-3">
                  <Button
                    onClick={onStartCooking}
                    disabled={!canCook || isStartingCooking || isSaving}
                    className="flex-1 bg-gradient-warm text-base py-6"
                  >
                    {isStartingCooking ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <ChefHat className="w-5 h-5 mr-2" />
                    )}
                    Yes, I want to cook ✅
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onRegenerate}
                    disabled={isStartingCooking || isSaving}
                    className="flex-1 text-base py-6"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Generate Another
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  After clicking, we'll deduct 1 credit and the AI Chef will assist you step by step.
                </p>
              </div>

              {/* Save option */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSave}
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
          ) : null}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}