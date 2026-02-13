import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DietaryPreference, dietaryLabels } from '@/types/database';
import { Check, Leaf, Sprout, Wheat } from 'lucide-react';

interface DietarySelectorProps {
  selected: DietaryPreference[];
  onChange: (preferences: DietaryPreference[]) => void;
}

const preferences: { value: DietaryPreference; icon: React.ReactNode }[] = [
  { value: 'vegetarian', icon: <Leaf className="w-5 h-5" /> },
  { value: 'vegan', icon: <Sprout className="w-5 h-5" /> },
  { value: 'gluten_free', icon: <Wheat className="w-5 h-5" /> },
];

export function DietarySelector({ selected, onChange }: DietarySelectorProps) {
  const togglePreference = (pref: DietaryPreference) => {
    if (selected.includes(pref)) {
      onChange(selected.filter((p) => p !== pref));
    } else {
      onChange([...selected, pref]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {preferences.map(({ value, icon }) => {
        const isSelected = selected.includes(value);

        return (
          <motion.button
            key={value}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => togglePreference(value)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            {icon}
            <span className="font-medium">{dietaryLabels[value]}</span>
            {isSelected && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
