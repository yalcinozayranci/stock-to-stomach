import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Recipe, DietaryPreference, FoodAllergy, cuisineLabels, allergyLabels, dietaryLabels } from '@/types/database';
import { Heart, Clock, ChefHat, Sparkles, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RecipeCardProps {
  recipe: Recipe;
  isFavorite?: boolean;
  matchPercentage?: number;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  allergenWarning?: FoodAllergy[];
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  hard: 'bg-red-100 text-red-700',
};

export function RecipeCard({
  recipe,
  isFavorite,
  matchPercentage,
  onToggleFavorite,
  onClick,
  allergenWarning,
}: RecipeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className={`overflow-hidden cursor-pointer group border-border hover:shadow-xl transition-shadow duration-300 ${
          allergenWarning?.length ? 'ring-2 ring-destructive/50' : ''
        }`}
        onClick={onClick}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={recipe.image_url || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800'}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Top badges row */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <div className="flex flex-col gap-1">
              {/* Match percentage badge */}
              {matchPercentage !== undefined && (
                <Badge className="bg-gradient-warm text-primary-foreground font-bold">
                  {matchPercentage}% match
                </Badge>
              )}
              
              {/* Cuisine badge */}
              {recipe.cuisine && (
                <Badge variant="secondary" className="text-xs">
                  {cuisineLabels[recipe.cuisine]}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Allergen warning */}
              {allergenWarning && allergenWarning.length > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-8 h-8 rounded-full bg-destructive flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">Contains allergens:</p>
                    <ul className="text-sm">
                      {allergenWarning.map(a => (
                        <li key={a}>{allergyLabels[a].icon} {allergyLabels[a].label}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              )}

              {/* AI generated badge */}
              {recipe.is_ai_generated && (
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </Badge>
              )}

              {/* Favorite button */}
              {onToggleFavorite && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="bg-background/80 hover:bg-background rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-destructive text-destructive' : 'text-foreground'
                    }`}
                  />
                </Button>
              )}
            </div>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-display text-lg font-semibold text-white line-clamp-2 drop-shadow-lg">
              {recipe.title}
            </h3>
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {recipe.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {recipe.cooking_time_minutes && (
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {recipe.cooking_time_minutes} min
              </Badge>
            )}
            <Badge className={difficultyColors[recipe.difficulty] || ''}>
              <ChefHat className="w-3 h-3 mr-1" />
              {recipe.difficulty}
            </Badge>
          </div>

          {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {recipe.dietary_tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {dietaryLabels[tag]}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
