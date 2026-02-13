import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IngredientCategory } from '@/types/database';
import { Plus } from 'lucide-react';

interface AddIngredientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: {
    name: string;
    category?: IngredientCategory;
    quantity?: string;
    unit?: string;
    expires_at?: string;
  }) => void;
  isLoading: boolean;
}

const categories: { value: IngredientCategory; label: string }[] = [
  { value: 'meat_protein', label: 'Meat / Protein' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'grains_bakery', label: 'Grains / Bakery' },
  { value: 'nuts_seeds_pantry', label: 'Nuts & Seeds / Pantry' },
  { value: 'herbs_spices', label: 'Herbs & Spices' },
  { value: 'other', label: 'Other' },
];

const units = ['pieces', 'g', 'kg', 'ml', 'l', 'cups', 'tbsp', 'tsp', 'oz', 'lb'];

export function AddIngredientModal({
  open,
  onOpenChange,
  onAdd,
  isLoading,
}: AddIngredientModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('other');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      quantity: quantity || undefined,
      unit: unit || undefined,
      expires_at: expiresAt || undefined,
    });

    // Reset form
    setName('');
    setCategory('other');
    setQuantity('');
    setUnit('');
    setExpiresAt('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Ingredient</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ingredient Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tomatoes"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as IngredientCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expiration Date (optional)</Label>
            <Input
              id="expires"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-warm hover:opacity-90"
            disabled={isLoading || !name.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Pantry
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
