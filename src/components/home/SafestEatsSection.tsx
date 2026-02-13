import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { usePantry } from '@/hooks/usePantry';

const allergyLabels: Record<string, string> = {
  peanuts: 'Peanuts',
  tree_nuts: 'Tree Nuts',
  milk: 'Dairy',
  eggs: 'Eggs',
  wheat: 'Wheat',
  soy: 'Soy',
  fish: 'Fish',
  shellfish: 'Shellfish',
  sesame: 'Sesame',
  mustard: 'Mustard',
  celery: 'Celery',
  sulfites: 'Sulfites',
};

export function SafestEatsSection() {
  const { profile } = useProfile();
  const { pantryItems } = usePantry();

  const allergies = profile?.allergies || [];
  const hasAllergies = allergies.length > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground">
          Your Safest Eats
        </h2>
        <Badge 
          variant="outline" 
          className="bg-green-50 border-green-200 text-green-700 gap-1.5 py-1.5 px-3"
        >
          <ShieldCheck className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wide uppercase">
            Safe Allergy Match
          </span>
        </Badge>
      </div>

      {/* Info card */}
      <div className="rounded-2xl border border-border bg-card p-4">
        {hasAllergies ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Recipes are filtered to exclude:
            </p>
            <div className="flex flex-wrap gap-2">
              {allergies.map((allergy) => (
                <Badge 
                  key={allergy} 
                  variant="secondary"
                  className="bg-destructive/10 text-destructive border-destructive/20"
                >
                  {allergyLabels[allergy] || allergy}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No allergies set. <span className="text-primary font-medium">Update your profile</span> to filter recipes.
          </p>
        )}

        {pantryItems.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">
              {pantryItems.length} ingredients ready for safe recipes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {pantryItems.slice(0, 6).map((item) => (
                <Badge key={item.id} variant="outline" className="text-xs">
                  {item.name}
                </Badge>
              ))}
              {pantryItems.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{pantryItems.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
