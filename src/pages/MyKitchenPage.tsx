import { Layout } from '@/components/layout/Layout';
import { usePantry } from '@/hooks/usePantry';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useCookingHistory } from '@/hooks/useCookingHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  ChefHat, 
  Apple, 
  Beef, 
  Milk, 
  Package, 
  Flame,
  AlertTriangle,
  ShieldAlert,
  Plus,
  Camera,
  Sparkles,
  BookOpen,
  Cherry,
  Wheat,
  Nut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays, format } from 'date-fns';
import { IngredientCategory, allergyLabels, FoodAllergy } from '@/types/database';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState } from 'react';

const categoryConfig: Record<IngredientCategory, { label: string; icon: React.ReactNode; color: string }> = {
  meat_protein: { label: 'Meat / Protein', icon: <Beef className="w-5 h-5" />, color: 'text-red-600' },
  vegetables: { label: 'Vegetables', icon: <Apple className="w-5 h-5" />, color: 'text-green-600' },
  fruits: { label: 'Fruits', icon: <Cherry className="w-5 h-5" />, color: 'text-orange-600' },
  dairy: { label: 'Dairy', icon: <Milk className="w-5 h-5" />, color: 'text-blue-600' },
  grains_bakery: { label: 'Grains / Bakery', icon: <Wheat className="w-5 h-5" />, color: 'text-amber-600' },
  nuts_seeds_pantry: { label: 'Nuts & Seeds / Pantry', icon: <Nut className="w-5 h-5" />, color: 'text-yellow-600' },
  herbs_spices: { label: 'Herbs & Spices', icon: <Flame className="w-5 h-5" />, color: 'text-purple-600' },
  other: { label: 'Other', icon: <Package className="w-5 h-5" />, color: 'text-gray-600' },
};

export default function MyKitchenPage() {
  const { user } = useAuth();
  const { pantryItems, isLoading: pantryLoading } = usePantry();
  const { profile, isLoading: profileLoading } = useProfile();
  const { cookingHistory } = useCookingHistory();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8 text-center">
          <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">My Kitchen</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to see your kitchen overview and manage your ingredients.
          </p>
          <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </Layout>
    );
  }

  const isLoading = pantryLoading || profileLoading;

  // Group items by category
  const itemsByCategory = pantryItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof pantryItems>);

  // Find expiring items (within 3 days)
  const expiringItems = pantryItems.filter(item => {
    if (!item.expires_at) return false;
    const daysUntilExpiry = differenceInDays(new Date(item.expires_at), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
  }).sort((a, b) => {
    return new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime();
  });

  // Recent cooking stats
  const recentCooks = cookingHistory.slice(0, 3);

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-primary" />
            My Kitchen
          </h1>
          <p className="text-muted-foreground">
            Welcome back, Chef{profile?.display_name ? ` ${profile.display_name}` : ''}! Here's what's in your kitchen.
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-64" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/pantry">
                    <Plus className="w-5 h-5" />
                    <span className="text-xs">Add Items</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/scan">
                    <Camera className="w-5 h-5" />
                    <span className="text-xs">Scan</span>
                  </Link>
                </Button>
                <Button className="h-auto py-4 flex-col gap-2 bg-gradient-warm hover:opacity-90" asChild>
                  <Link to="/cook-now">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs">Cook Now</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
                  <Link to="/cooking-journal">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs">Journal</span>
                  </Link>
                </Button>
              </div>

              {/* Pantry Overview by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Pantry Overview</span>
                    <Badge variant="secondary">{pantryItems.length} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pantryItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground mb-4">Your pantry is empty</p>
                      <Button size="sm" asChild>
                        <Link to="/pantry">Add Ingredients</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Object.entries(categoryConfig).map(([category, config]) => {
                        const items = itemsByCategory[category] || [];
                        const percentage = (items.length / pantryItems.length) * 100;
                        
                        return (
                          <div key={category} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={config.color}>{config.icon}</span>
                              <span className="text-sm font-medium">{config.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={percentage} className="h-2 flex-1" />
                              <span className="text-sm text-muted-foreground w-8">
                                {items.length}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expiring Soon */}
              {expiringItems.length > 0 && (
                <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <AlertTriangle className="w-5 h-5" />
                      Expiring Soon
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {expiringItems.map((item) => {
                        const daysLeft = differenceInDays(new Date(item.expires_at!), new Date());
                        return (
                          <div key={item.id} className="flex items-center justify-between py-2 border-b border-amber-200/50 last:border-0">
                            <span className="font-medium">{item.name}</span>
                            <Badge variant={daysLeft === 0 ? 'destructive' : 'outline'}>
                              {daysLeft === 0 ? 'Today!' : `${daysLeft} day${daysLeft > 1 ? 's' : ''}`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Allergies Reminder */}
              {profile?.allergies && profile.allergies.length > 0 && (
                <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                      <ShieldAlert className="w-5 h-5" />
                      Your Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      We'll always keep these out of your recipes.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.allergies.map((allergy) => {
                        const info = allergyLabels[allergy as FoodAllergy];
                        return (
                          <Badge key={allergy} variant="secondary" className="gap-1">
                            {info?.icon} {info?.label || allergy}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Recent Cooking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentCooks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No cooking history yet. Start by making a recipe!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentCooks.map((entry) => (
                        <div key={entry.id} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                            {entry.recipe?.image_url ? (
                              <img
                                src={entry.recipe.image_url}
                                alt=""
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <ChefHat className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {entry.recipe?.title || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(entry.cooked_at), 'MMM d')}
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link to="/cooking-journal">View All</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
