import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CuisineType, cuisineLabels } from '@/types/database';
import { Check } from 'lucide-react';

interface CuisineSelectorProps {
  selected: CuisineType[];
  onChange: (cuisines: CuisineType[]) => void;
}

const cuisines: CuisineType[] = [
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

export function CuisineSelector({ selected, onChange }: CuisineSelectorProps) {
  const toggleCuisine = (cuisine: CuisineType) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter((c) => c !== cuisine));
    } else {
      onChange([...selected, cuisine]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cuisines.map((cuisine) => {
        const isSelected = selected.includes(cuisine);

        return (
          <motion.button
            key={cuisine}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleCuisine(cuisine)}
            className={cn(
              'relative flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <span className="text-lg font-medium">{cuisineLabels[cuisine]}</span>
            {isSelected && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
