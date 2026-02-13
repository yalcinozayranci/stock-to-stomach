import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Recipe, DietaryPreference } from '@/types/database';
import { Heart, Clock, ChefHat, Users, Sparkles, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { CookingEntryModal } from '@/components/cooking/CookingEntryModal';

interface RecipeModalProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onMarkAsCooked?: (data: { rating?: number; notes?: string; feedback?: string }) => void;
  userIngredients?: string[];
  showCookingEntry?: boolean;
}

const dietaryLabels: Record<DietaryPreference, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Gluten Free',
};

export function RecipeModal({
  recipe,
  open,
  onOpenChange,
  isFavorite,
  onToggleFavorite,
  onMarkAsCooked,
  userIngredients = [],
  showCookingEntry = true,
}: RecipeModalProps) {
  const [cookingEntryOpen, setCookingEntryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!recipe) return null;

  const userIngredientNames = userIngredients.map((i) => i.toLowerCase());

  const handleMarkAsCooked = () => {
    if (showCookingEntry) {
      setCookingEntryOpen(true);
    } else if (onMarkAsCooked) {
      onMarkAsCooked({});
    }
  };

  const handleCookingEntrySubmit = async (data: { rating?: number; notes?: string; feedback?: string }) => {
    if (!onMarkAsCooked) return;
    setIsSubmitting(true);
    try {
      await onMarkAsCooked(data);
      setCookingEntryOpen(false);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <div className="relative h-56 md:h-72">
          <img
            src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <DialogHeader className="absolute bottom-4 left-4 right-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                {recipe.is_ai_generated && (
                  <Badge className="mb-2 gap-1 bg-accent text-accent-foreground">
                    <Sparkles className="w-3 h-3" />
                    AI Generated
                  </Badge>
                )}
                <DialogTitle className="font-display text-2xl md:text-3xl text-white">
                  {recipe.title}
                </DialogTitle>
              </div>
              {onToggleFavorite && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-background/80 hover:bg-background rounded-full shrink-0"
                  onClick={onToggleFavorite}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'
                    }`}
                  />
                </Button>
              )}
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-muted-foreground">{recipe.description}</p>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              {recipe.cooking_time_minutes && (
                <Badge variant="outline" className="gap-1 py-1 px-3">
                  <Clock className="w-4 h-4" />
                  {recipe.cooking_time_minutes} minutes
                </Badge>
              )}
              <Badge variant="outline" className="gap-1 py-1 px-3">
                <ChefHat className="w-4 h-4" />
                {recipe.difficulty}
              </Badge>
              <Badge variant="outline" className="gap-1 py-1 px-3">
                <Users className="w-4 h-4" />
                {recipe.servings} servings
              </Badge>
            </div>

            {/* Dietary tags */}
            {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {recipe.dietary_tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {dietaryLabels[tag]}
                  </Badge>
                ))}
              </div>
            )}

            {/* Ingredients */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => {
                  const hasIngredient = userIngredientNames.includes(
                    ingredient.name.toLowerCase()
                  );
                  return (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      {hasIngredient ? (
                        <Check className="w-4 h-4 text-green-600 shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <span className={hasIngredient ? 'text-foreground' : 'text-muted-foreground'}>
                        {ingredient.amount} {ingredient.unit} {ingredient.name}
                      </span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-display text-lg font-semibold mb-3">Instructions</h3>
              <ol className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <span className="shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </span>
                    <p className="text-muted-foreground pt-1">{step}</p>
                  </motion.li>
                ))}
              </ol>
            </div>

            {/* Action button */}
            {onMarkAsCooked && (
              <Button
                onClick={handleMarkAsCooked}
                className="w-full bg-gradient-warm hover:opacity-90"
                size="lg"
              >
                <ChefHat className="w-5 h-5 mr-2" />
                I Made This!
              </Button>
            )}
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Cooking Entry Modal */}
      <CookingEntryModal
        open={cookingEntryOpen}
        onOpenChange={setCookingEntryOpen}
        recipeName={recipe.title}
        onSubmit={handleCookingEntrySubmit}
        isLoading={isSubmitting}
      />
    </Dialog>
  );
}
