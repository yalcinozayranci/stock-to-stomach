import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { FoodAllergy, allergyLabels } from '@/types/database';
import { Check } from 'lucide-react';

interface AllergySelectorProps {
  selected: FoodAllergy[];
  onChange: (allergies: FoodAllergy[]) => void;
}

const allergies: FoodAllergy[] = [
  'peanuts',
  'tree_nuts',
  'milk',
  'eggs',
  'wheat',
  'soy',
  'fish',
  'shellfish',
  'sesame',
  'mustard',
  'celery',
  'sulfites',
];

export function AllergySelector({ selected, onChange }: AllergySelectorProps) {
  const toggleAllergy = (allergy: FoodAllergy) => {
    if (selected.includes(allergy)) {
      onChange(selected.filter((a) => a !== allergy));
    } else {
      onChange([...selected, allergy]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {allergies.map((allergy) => {
        const isSelected = selected.includes(allergy);
        const { label, icon } = allergyLabels[allergy];

        return (
          <motion.button
            key={allergy}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleAllergy(allergy)}
            className={cn(
              'relative flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left',
              isSelected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
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
