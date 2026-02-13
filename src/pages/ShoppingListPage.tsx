import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useShoppingList } from '@/hooks/useShoppingList';
import { usePantry } from '@/hooks/usePantry';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthModal } from '@/components/auth/AuthModal';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Package,
  Check,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ShoppingListPage() {
  const { user } = useAuth();
  const { shoppingItems, isLoading, addItem, togglePurchased, deleteItem, clearPurchased, unpurchasedCount, purchasedCount } = useShoppingList();
  const { addItem: addToPantry } = usePantry();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;
    
    await addItem.mutateAsync({ name: newItemName.trim() });
    setNewItemName('');
    setIsAdding(false);
  };

  const handleAddPurchasedToPantry = async () => {
    const purchasedItems = shoppingItems.filter(item => item.is_purchased);
    
    for (const item of purchasedItems) {
      await addToPantry.mutateAsync({
        name: item.name,
        quantity: item.quantity || undefined,
        unit: item.unit || undefined,
      });
    }
    
    await clearPurchased.mutateAsync();
    toast.success('Added purchased items to pantry!');
  };

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-2xl py-8 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">Shopping List</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your shopping list.
          </p>
          <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </Layout>
    );
  }

  const unpurchasedItems = shoppingItems.filter(item => !item.is_purchased);
  const purchasedItems = shoppingItems.filter(item => item.is_purchased);

  return (
    <Layout>
      <div className="container max-w-2xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-primary" />
              Shopping List
            </h1>
            <p className="text-muted-foreground mt-1">
              {unpurchasedCount} items to buy
            </p>
          </div>
          <Button 
            onClick={() => setIsAdding(true)} 
            className="gap-2"
            disabled={isAdding}
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add new item */}
            <AnimatePresence>
              {isAdding && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter item name..."
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                          autoFocus
                        />
                        <Button onClick={handleAddItem} disabled={!newItemName.trim() || addItem.isPending}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" onClick={() => { setIsAdding(false); setNewItemName(''); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Items to buy */}
            {unpurchasedItems.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    To Buy
                    <Badge variant="secondary">{unpurchasedCount}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence>
                    {unpurchasedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 group"
                      >
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => togglePurchased.mutate({ id: item.id, is_purchased: true })}
                        />
                        <span className="flex-1 font-medium">{item.name}</span>
                        {item.quantity && (
                          <Badge variant="outline" className="text-xs">
                            {item.quantity} {item.unit || ''}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive"
                          onClick={() => deleteItem.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Purchased items */}
            {purchasedItems.length > 0 && (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-900/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                      <Check className="w-5 h-5" />
                      Purchased
                      <Badge variant="secondary" className="bg-green-100 text-green-700">{purchasedCount}</Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleAddPurchasedToPantry}
                        disabled={addToPantry.isPending}
                        className="gap-1"
                      >
                        <Package className="w-4 h-4" />
                        Add to Pantry
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => clearPurchased.mutate()}
                        className="text-destructive"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <AnimatePresence>
                    {purchasedItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 p-3 rounded-lg"
                      >
                        <Checkbox
                          checked={true}
                          onCheckedChange={() => togglePurchased.mutate({ id: item.id, is_purchased: false })}
                        />
                        <span className="flex-1 text-muted-foreground line-through">{item.name}</span>
                        {item.quantity && (
                          <Badge variant="outline" className="text-xs opacity-50">
                            {item.quantity} {item.unit || ''}
                          </Badge>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}

            {/* Empty state */}
            {shoppingItems.length === 0 && !isAdding && (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">Your list is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Add items manually or generate a recipe to auto-add missing ingredients.
                  </p>
                  <Button onClick={() => setIsAdding(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Item
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
