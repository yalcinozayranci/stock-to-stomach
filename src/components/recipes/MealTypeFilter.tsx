import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MealType, mealTypeLabels } from '@/types/database';

interface MealTypeFilterProps {
  selected: MealType | 'all';
  onSelect: (mealType: MealType | 'all') => void;
}

const mealTypes: (MealType | 'all')[] = ['all', 'breakfast', 'lunch', 'dinner', 'dessert', 'snack'];

export function MealTypeFilter({ selected, onSelect }: MealTypeFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {mealTypes.map((mealType) => (
          <motion.button
            key={mealType}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(mealType)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selected === mealType
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {mealType === 'all' ? '🍽️ All Meals' : `${mealTypeLabels[mealType].icon} ${mealTypeLabels[mealType].label}`}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
