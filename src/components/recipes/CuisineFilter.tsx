import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CuisineType, cuisineLabels } from '@/types/database';

interface CuisineFilterProps {
  selected: CuisineType | 'all';
  onSelect: (cuisine: CuisineType | 'all') => void;
}

const cuisines: (CuisineType | 'all')[] = [
  'all',
  'british',
  'asian',
  'mediterranean',
  'european',
  'latin_american',
  'american',
  'indian',
  'middle_eastern',
  'african',
  'other',
];

export function CuisineFilter({ selected, onSelect }: CuisineFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {cuisines.map((cuisine) => (
          <motion.button
            key={cuisine}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(cuisine)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selected === cuisine
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {cuisine === 'all' ? '🍽️ All Cuisines' : cuisineLabels[cuisine]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
