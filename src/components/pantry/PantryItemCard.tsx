import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PantryItem, IngredientCategory } from '@/types/database';
import { Trash2, AlertTriangle } from 'lucide-react';
import { format, differenceInDays, isPast } from 'date-fns';

interface PantryItemCardProps {
  item: PantryItem;
  onDelete: () => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  selectionMode?: boolean;
}

const categoryColors: Record<IngredientCategory, string> = {
  meat_protein: 'bg-red-100 text-red-700',
  vegetables: 'bg-green-100 text-green-700',
  fruits: 'bg-orange-100 text-orange-700',
  dairy: 'bg-blue-100 text-blue-700',
  grains_bakery: 'bg-amber-100 text-amber-700',
  nuts_seeds_pantry: 'bg-yellow-100 text-yellow-700',
  herbs_spices: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

const categoryLabels: Record<IngredientCategory, string> = {
  meat_protein: 'Meat / Protein',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  dairy: 'Dairy',
  grains_bakery: 'Grains / Bakery',
  nuts_seeds_pantry: 'Nuts & Seeds / Pantry',
  herbs_spices: 'Herbs & Spices',
  other: 'Other',
};

export function PantryItemCard({ item, onDelete, isSelected, onSelect, selectionMode }: PantryItemCardProps) {
  const isExpired = item.expires_at && isPast(new Date(item.expires_at));
  const daysUntilExpiry = item.expires_at
    ? differenceInDays(new Date(item.expires_at), new Date())
    : null;
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 3 && daysUntilExpiry >= 0;

  const handleCardClick = () => {
    if (selectionMode && onSelect) {
      onSelect(!isSelected);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card
        className={`border transition-all ${
          isExpired
            ? 'border-destructive/50 bg-destructive/5'
            : isExpiringSoon
            ? 'border-yellow-400/50 bg-yellow-50'
            : isSelected
            ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
            : 'border-border'
        } ${selectionMode ? 'cursor-pointer hover:border-primary/50' : ''}`}
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            {selectionMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect?.(checked as boolean)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 shrink-0"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground capitalize truncate">
                {item.name}
              </h4>
              
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={categoryColors[item.category] || categoryColors.other}>
                  {categoryLabels[item.category] || 'Other'}
                </Badge>
                
                {item.quantity && (
                  <span className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit || ''}
                  </span>
                )}
              </div>

              {item.expires_at && (
                <div
                  className={`flex items-center gap-1 mt-2 text-xs ${
                    isExpired
                      ? 'text-destructive'
                      : isExpiringSoon
                      ? 'text-yellow-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {(isExpired || isExpiringSoon) && (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  {isExpired
                    ? 'Expired'
                    : isExpiringSoon
                    ? `Expires in ${daysUntilExpiry} days`
                    : `Expires ${format(new Date(item.expires_at), 'MMM d')}`}
                </div>
              )}
            </div>

            {!selectionMode && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onDelete}
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
