import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, ChefHat, Users, Search, Sparkles } from 'lucide-react';
import { AIRecipe, cuisineLabels } from '@/types/database';
import { motion, AnimatePresence } from 'framer-motion';

interface RecipeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipes: AIRecipe[];
  isLoading: boolean;
  onSelectRecipe: (recipe: AIRecipe) => void;
  totalFound?: number;
}

export function RecipeSelectionModal({
  open,
  onOpenChange,
  recipes,
  isLoading,
  onSelectRecipe,
  totalFound = 0,
}: RecipeSelectionModalProps) {
  const hasResults = recipes.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              <p className="mt-4 text-lg font-medium text-foreground">AI is creating recipes...</p>
              <p className="text-sm text-muted-foreground mt-1">Finding perfect dishes with your ingredients</p>
            </motion.div>
          ) : hasResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-display">Choose a Recipe</DialogTitle>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <p className="text-muted-foreground text-sm">
                    AI generated {totalFound} personalized recipes
                  </p>
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {recipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id || `recipe-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => onSelectRecipe(recipe)}
                      className="w-full text-left group"
                    >
                      <div className="relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-200">
                        <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                          {recipe.image_url ? (
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs">
                              <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                              AI
                            </Badge>
                            {recipe.cuisine && recipe.cuisine !== 'other' && (
                              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs">
                                {cuisineLabels[recipe.cuisine]?.split(' ')[0]}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                            {recipe.title}
                          </h3>
                          {recipe.matchedIngredients && recipe.matchedIngredients.length > 0 && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Uses {recipe.matchedIngredients.length} of your ingredients
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {recipe.cooking_time_minutes} min
                            </div>
                            <div className="flex items-center gap-1">
                              <ChefHat className="w-3 h-3" />
                              <span className="capitalize">{recipe.difficulty}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {recipe.servings}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Recipes Generated</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't generate recipes with those ingredients. Try selecting different ingredients or add more to your pantry!
              </p>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="mt-6"
              >
                Try Different Ingredients
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
