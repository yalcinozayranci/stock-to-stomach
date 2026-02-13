import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DietarySelector } from './DietarySelector';
import { AllergySelector } from './AllergySelector';
import { CuisineSelector } from './CuisineSelector';
import { IngredientScanner } from '@/components/scanner/IngredientScanner';
import { DietaryPreference, FoodAllergy, CuisineType } from '@/types/database';
import { useProfile } from '@/hooks/useProfile';
import { ArrowRight, ArrowLeft, Sparkles, AlertTriangle, ChefHat, Heart, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference[]>([]);
  const [allergies, setAllergies] = useState<FoodAllergy[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<CuisineType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pantryScanned, setPantryScanned] = useState(false);

  const steps = [
    {
      title: 'Scan Your Kitchen 📸',
      description: "Start by taking a photo of your fridge or pantry to stock your digital kitchen!",
      icon: <Camera className="w-8 h-8" />,
    },
    {
      title: 'Welcome, Chef! 👨‍🍳',
      description: "Let's personalize your cooking experience. What should we call you?",
      icon: <Heart className="w-8 h-8" />,
    },
    {
      title: 'Dietary Preferences',
      description: 'Do you follow any special diets? This helps us suggest the right recipes.',
      icon: <ChefHat className="w-8 h-8" />,
    },
    {
      title: 'Food Allergies',
      description: "Select any food allergies so we can keep you safe. We'll never suggest recipes with these ingredients.",
      icon: <AlertTriangle className="w-8 h-8" />,
    },
    {
      title: 'Favorite Cuisines',
      description: 'What cuisines do you enjoy most? Pick your favorites for personalized recommendations.',
      icon: <Sparkles className="w-8 h-8" />,
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        display_name: displayName.trim() || undefined,
        dietary_preferences: dietaryPreferences,
        allergies: allergies,
        favorite_cuisines: favoriteCuisines,
        has_completed_onboarding: true,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        has_completed_onboarding: true,
      });
      onComplete();
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanComplete = () => {
    setPantryScanned(true);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl my-8">
        <CardHeader className="text-center">
          <motion.div 
            key={step}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4"
          >
            {steps[step].icon}
          </motion.div>
          <CardTitle className="font-display text-2xl">{steps[step].title}</CardTitle>
          <CardDescription className="text-base">{steps[step].description}</CardDescription>
          
          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? 'bg-primary' : i < step ? 'bg-primary/50' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-4">
                  <IngredientScanner onComplete={handleScanComplete} />
                  
                  {pantryScanned && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg"
                    >
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        ✓ Ingredients added to your pantry!
                      </p>
                    </motion.div>
                  )}
                  
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                      className="text-muted-foreground"
                    >
                      Skip for now - I'll add ingredients later
                    </Button>
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium">Your name</Label>
                    <Input
                      id="displayName"
                      placeholder="e.g., Chef Alex"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="text-center text-lg"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      This is how we'll greet you in the app
                    </p>
                  </div>
                </div>
              )}
              {step === 2 && (
                <DietarySelector selected={dietaryPreferences} onChange={setDietaryPreferences} />
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <AllergySelector selected={allergies} onChange={setAllergies} />
                  {allergies.length > 0 && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-center text-emerald-600 dark:text-emerald-400"
                    >
                      ✓ We'll keep you safe by avoiding these in all recipe suggestions
                    </motion.p>
                  )}
                </div>
              )}
              {step === 4 && (
                <CuisineSelector selected={favoriteCuisines} onChange={setFavoriteCuisines} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4">
            <div>
              {step > 0 ? (
                <Button variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <Button variant="ghost" onClick={handleSkip} disabled={isSubmitting}>
                  Skip for now
                </Button>
              )}
            </div>

            <Button onClick={handleNext} disabled={isSubmitting}>
              {step === steps.length - 1 ? (
                isSubmitting ? 'Saving...' : "Let's Cook! 🍳"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
