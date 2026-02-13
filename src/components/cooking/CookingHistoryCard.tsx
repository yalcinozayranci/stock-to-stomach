import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, ChefHat, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CookingEntry } from '@/hooks/useCookingHistory';
import { cuisineLabels, CuisineType } from '@/types/database';

interface CookingHistoryCardProps {
  entry: CookingEntry;
  onClick?: () => void;
}

export function CookingHistoryCard({ entry, onClick }: CookingHistoryCardProps) {
  const recipe = entry.recipe;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'overflow-hidden cursor-pointer transition-shadow hover:shadow-lg',
          onClick && 'hover:ring-2 hover:ring-primary/20'
        )}
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative h-40 bg-muted">
          {entry.photo_url ? (
            <img
              src={entry.photo_url}
              alt={recipe?.title || 'Cooked dish'}
              className="w-full h-full object-cover"
            />
          ) : recipe?.image_url ? (
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="w-full h-full object-cover opacity-70"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ChefHat className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Date badge */}
          <Badge className="absolute top-2 right-2 bg-background/90 text-foreground">
            {format(new Date(entry.cooked_at), 'MMM d, yyyy')}
          </Badge>

          {/* User photo indicator */}
          {entry.photo_url && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              📸 Your Photo
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg line-clamp-1">
            {recipe?.title || 'Unknown Recipe'}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {recipe?.cooking_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {recipe.cooking_time_minutes}m
              </span>
            )}
            {recipe?.cuisine && (
              <span>{cuisineLabels[recipe.cuisine as CuisineType] || recipe.cuisine}</span>
            )}
          </div>

          {/* Rating */}
          {entry.rating && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= entry.rating!
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                {entry.rating}/5
              </span>
            </div>
          )}

          {/* Notes preview */}
          {entry.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MessageSquare className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="line-clamp-2">{entry.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
