import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usePantry } from '@/hooks/usePantry';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useRecipes } from '@/hooks/useRecipes';
import { useShoppingList } from '@/hooks/useShoppingList';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthModal } from '@/components/auth/AuthModal';
import { ActiveCookingMode, CookingStep } from '@/components/cooking/ActiveCookingMode';
import { MealType, mealTypeLabels, Recipe, RecipeIngredient, cuisineLabels } from '@/types/database';
import { 
  ChefHat, 
  Clock, 
  Users,
  Sparkles,
  Loader2,
  ShoppingCart,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface GeneratedRecipe extends Recipe {
  usedIngredients: string[];
  missingIngredients: RecipeIngredient[];
}

export default function CookNowPage() {
  const { user } = useAuth();
  const { pantryItems, isLoading: pantryLoading } = usePantry();
  const { profile } = useProfile();
  const { generateAIRecipe, saveAIRecipe, markAsCooked } = useRecipes();
  const { addMultipleItems: addToShoppingList } = useShoppingList();
  const navigate = useNavigate();
  
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState<GeneratedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<GeneratedRecipe | null>(null);
  const [isCooking, setIsCooking] = useState(false);

  const handleGenerateRecipes = async (mealType: MealType) => {
    setSelectedMealType(mealType);
    setIsGenerating(true);
    setGeneratedRecipes([]);

    const ingredientNames = pantryItems.map(item => item.name);
    
    try {
      // Generate 3 recipes sequentially (could be parallelized with edge function update)
      const recipes: GeneratedRecipe[] = [];
      
      for (let i = 0; i < 3; i++) {
        const recipe = await generateAIRecipe.mutateAsync({
          ingredients: ingredientNames,
          dietaryPreferences: profile?.dietary_preferences || [],
          allergies: profile?.allergies || [],
          mealType,
        });

        if (recipe) {
          // Determine which ingredients are used and which are missing
          const usedIngredients = recipe.ingredients
            .filter((ing: RecipeIngredient) => 
              ingredientNames.some(pantryItem => 
                pantryItem.toLowerCase().includes(ing.name.toLowerCase()) ||
                ing.name.toLowerCase().includes(pantryItem.toLowerCase())
              )
            )
            .map((ing: RecipeIngredient) => ing.name);

          const missingIngredients = recipe.ingredients.filter((ing: RecipeIngredient) => 
            !ingredientNames.some(pantryItem => 
              pantryItem.toLowerCase().includes(ing.name.toLowerCase()) ||
              ing.name.toLowerCase().includes(pantryItem.toLowerCase())
            )
          );

          recipes.push({
            ...recipe,
            usedIngredients,
            missingIngredients,
          });
        }
      }
      
      setGeneratedRecipes(recipes);
      
      if (recipes.length === 0) {
        toast.error('Could not generate recipes. Try adding more ingredients.');
      }
    } catch (error) {
      console.error('Failed to generate recipes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectRecipe = (recipe: GeneratedRecipe) => {
    setSelectedRecipe(recipe);
    
    // Add missing ingredients to shopping list
    if (recipe.missingIngredients.length > 0) {
      addToShoppingList.mutate(
        recipe.missingIngredients.map(ing => ({
          name: ing.name,
          quantity: ing.amount,
          unit: ing.unit,
          recipe_id: recipe.id || undefined,
        }))
      );
    }
  };

  const handleStartCooking = async () => {
    if (!selectedRecipe) return;
    
    // Save the recipe if not already saved
    const saved = await saveAIRecipe.mutateAsync(selectedRecipe);
    setSelectedRecipe({ ...selectedRecipe, id: saved.id });
    setIsCooking(true);
  };

  const handleFinishCooking = async () => {
    if (selectedRecipe?.id) {
      await markAsCooked.mutateAsync(selectedRecipe.id);
    }
    setIsCooking(false);
    navigate('/cooking-journal');
  };

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8 text-center">
          <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">Let's Cook!</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to generate personalized recipes from your pantry.
          </p>
          <Button onClick={() => setAuthModalOpen(true)}>Sign In</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </Layout>
    );
  }

  // Active cooking mode
  if (isCooking && selectedRecipe) {
    const cookingSteps: CookingStep[] = selectedRecipe.instructions.map((instruction, i) => ({
      instruction,
      tip: i === 0 ? 'Gather all your ingredients before starting' : undefined,
    }));

    return (
      <ActiveCookingMode
        recipeName={selectedRecipe.title}
        steps={cookingSteps}
        onClose={() => setIsCooking(false)}
        onAskHelp={(question) => {
          navigate(`/chat?q=${encodeURIComponent(question)}`);
        }}
      />
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        {/* Back button when in recipe selection */}
        {(selectedMealType || selectedRecipe) && (
          <Button
            variant="ghost"
            className="mb-4 gap-2"
            onClick={() => {
              if (selectedRecipe) {
                setSelectedRecipe(null);
              } else {
                setSelectedMealType(null);
                setGeneratedRecipes([]);
              }
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}

        {/* Recipe detail view */}
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="overflow-hidden">
              {selectedRecipe.image_url && (
                <img
                  src={selectedRecipe.image_url}
                  alt={selectedRecipe.title}
                  className="w-full h-64 object-cover"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{selectedRecipe.title}</CardTitle>
                    <CardDescription className="mt-2">{selectedRecipe.description}</CardDescription>
                  </div>
                  <Badge className="bg-gradient-warm">{selectedRecipe.difficulty}</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedRecipe.cooking_time_minutes} min
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="w-3 h-3" />
                    {selectedRecipe.servings} servings
                  </Badge>
                  <Badge variant="secondary">
                    {cuisineLabels[selectedRecipe.cuisine]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Ingredients */}
                <div>
                  <h3 className="font-semibold mb-3">Ingredients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRecipe.ingredients.map((ing, i) => {
                      const isMissing = selectedRecipe.missingIngredients.some(
                        m => m.name === ing.name
                      );
                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2 p-2 rounded ${
                            isMissing 
                              ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400' 
                              : 'bg-muted/50'
                          }`}
                        >
                          {isMissing && <ShoppingCart className="w-4 h-4 shrink-0" />}
                          <span className="text-sm">
                            {ing.amount} {ing.unit} {ing.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {selectedRecipe.missingIngredients.length > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      Missing items added to your shopping list
                    </p>
                  )}
                </div>

                {/* Instructions preview */}
                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                    {selectedRecipe.instructions.slice(0, 3).map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                    {selectedRecipe.instructions.length > 3 && (
                      <li className="text-primary">+{selectedRecipe.instructions.length - 3} more steps...</li>
                    )}
                  </ol>
                </div>

                <Button 
                  size="lg" 
                  className="w-full bg-gradient-warm hover:opacity-90 gap-2"
                  onClick={handleStartCooking}
                >
                  <ChefHat className="w-5 h-5" />
                  Start Cooking
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recipe selection */}
        {!selectedRecipe && generatedRecipes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold mb-2">
                Choose Your Recipe
              </h2>
              <p className="text-muted-foreground">
                Based on your {pantryItems.length} pantry ingredients
              </p>
            </div>

            <div className="grid gap-4">
              {generatedRecipes.map((recipe, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
                    onClick={() => handleSelectRecipe(recipe)}
                  >
                    <div className="flex">
                      {recipe.image_url && (
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-32 h-32 object-cover shrink-0"
                        />
                      )}
                      <CardContent className="flex-1 py-4">
                        <h3 className="font-display text-lg font-semibold mb-1">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {recipe.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {recipe.cooking_time_minutes} min
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {recipe.usedIngredients.length} pantry items
                          </Badge>
                          {recipe.missingIngredients.length > 0 && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              <ShoppingCart className="w-3 h-3 mr-1" />
                              {recipe.missingIngredients.length} to buy
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generating state */}
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">
              Generating Recipes...
            </h2>
            <p className="text-muted-foreground">
              Finding the best {mealTypeLabels[selectedMealType!]?.label.toLowerCase()} recipes for your pantry
            </p>
          </motion.div>
        )}

        {/* Meal type selection */}
        {!selectedMealType && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <h1 className="font-display text-3xl font-bold mb-2">
                What would you like to cook?
              </h1>
              <p className="text-muted-foreground">
                We'll create personalized recipes using your {pantryItems.length} pantry ingredients
              </p>
            </div>

            {/* Pantry preview */}
            {pantryItems.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Your Ingredients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pantryItems.slice(0, 8).map((item) => (
                      <Badge key={item.id} variant="secondary">
                        {item.name}
                      </Badge>
                    ))}
                    {pantryItems.length > 8 && (
                      <Badge variant="outline">+{pantryItems.length - 8} more</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No ingredients warning */}
            {pantryItems.length === 0 && !pantryLoading && (
              <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/10">
                <CardContent className="py-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Your pantry is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Add some ingredients first so we can suggest recipes.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button asChild>
                      <Link to="/scan">Scan Ingredients</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/pantry">Add Manually</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meal type buttons */}
            {pantryItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(Object.entries(mealTypeLabels) as [MealType, { label: string; icon: string }][]).map(([type, info]) => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleGenerateRecipes(type)}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary bg-card text-center transition-colors"
                  >
                    <span className="text-4xl mb-2 block">{info.icon}</span>
                    <span className="font-display font-semibold">{info.label}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
