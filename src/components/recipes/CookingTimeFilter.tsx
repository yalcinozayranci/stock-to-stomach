import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CookingTimeRange, cookingTimeLabels } from '@/types/database';

interface CookingTimeFilterProps {
  selected: CookingTimeRange;
  onSelect: (timeRange: CookingTimeRange) => void;
}

const timeRanges: CookingTimeRange[] = ['all', 'quick', '15-30', '30-45', '45-60', '60+'];

export function CookingTimeFilter({ selected, onSelect }: CookingTimeFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {timeRanges.map((range) => (
          <motion.button
            key={range}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(range)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              selected === range
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            )}
          >
            {cookingTimeLabels[range]}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
