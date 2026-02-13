import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { RecipeIngredient } from '@/types/database';
import { 
  ChefHat, 
  Clock, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  RotateCcw,
  Check,
  AlertCircle,
  Timer,
  X,
  MessageCircle,
  Lightbulb,
  Volume2
} from 'lucide-react';

export interface CookingStep {
  instruction: string;
  duration?: number; // in seconds
  tip?: string;
}

interface ActiveCookingModeProps {
  recipeName: string;
  steps: CookingStep[];
  ingredients?: RecipeIngredient[];
  onClose: () => void;
  onAskHelp: (question: string) => void;
  onComplete?: () => void;
}

export function ActiveCookingMode({ 
  recipeName, 
  steps, 
  ingredients = [],
  onClose, 
  onAskHelp,
  onComplete
}: ActiveCookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [timer, setTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showIngredients, setShowIngredients] = useState(true);

  const step = steps[currentStep];
  const progress = ((completedSteps.size) / steps.length) * 100;

  // Timer countdown with audio notification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timer !== null && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev !== null && prev <= 1) {
            setIsTimerRunning(false);
            // Play notification sound
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleogdBdCV4/Sohk0j8I/k9aquZSQ=');
              audio.play().catch(() => {}); // Ignore errors if can't play
            } catch {}
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Reset timer when step changes
  useEffect(() => {
    if (step?.duration) {
      setTimer(step.duration);
      setIsTimerRunning(false);
    } else {
      setTimer(null);
    }
  }, [currentStep, step?.duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextStep = useCallback(() => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (completedSteps.size === steps.length - 1) {
      // All steps complete
      onComplete?.();
    }
  }, [currentStep, steps.length, completedSteps.size, onComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const toggleTimer = () => {
    if (timer === 0 && step?.duration) {
      setTimer(step.duration);
    }
    setIsTimerRunning(prev => !prev);
  };

  const resetTimer = () => {
    if (step?.duration) {
      setTimer(step.duration);
      setIsTimerRunning(false);
    }
  };

  const toggleIngredient = (index: number) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const helpQuestions = [
    `I'm stuck on step ${currentStep + 1}. Can you explain "${step?.instruction}" in more detail?`,
    `What should I do if this step isn't working right?`,
    `Any tips for "${step?.instruction}"?`,
    `How do I know when this step is done correctly?`,
  ];

  const allStepsComplete = completedSteps.size === steps.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
    >
      <div className="container max-w-2xl py-6 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">Active Cooking</h2>
              <p className="text-sm text-muted-foreground">{recipeName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedSteps.size} of {steps.length} steps
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Ingredient Checklist (collapsible) */}
        {ingredients.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2 cursor-pointer" onClick={() => setShowIngredients(!showIngredients)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  🥘 Ingredients
                  <Badge variant="secondary" className="text-xs">
                    {checkedIngredients.size}/{ingredients.length}
                  </Badge>
                </CardTitle>
                <Button variant="ghost" size="sm">
                  {showIngredients ? 'Hide' : 'Show'}
                </Button>
              </div>
            </CardHeader>
            <AnimatePresence>
              {showIngredients && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {ingredients.map((ing, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                            checkedIngredients.has(i) ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'
                          }`}
                          onClick={() => toggleIngredient(i)}
                        >
                          <Checkbox 
                            checked={checkedIngredients.has(i)} 
                            onCheckedChange={() => toggleIngredient(i)}
                          />
                          <span className={`text-sm ${checkedIngredients.has(i) ? 'line-through text-muted-foreground' : ''}`}>
                            {ing.amount} {ing.unit} {ing.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )}

        {/* Current Step */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
              {completedSteps.has(currentStep) && (
                <Badge className="bg-green-500/10 text-green-600 border-green-200">
                  <Check className="w-3 h-3 mr-1" /> Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium mb-4">{step?.instruction}</p>
            
            {/* Timer */}
            {step?.duration && (
              <div className="bg-muted/50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    <span className="font-medium">Timer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-mono text-2xl font-bold ${
                        timer === 0 ? 'text-green-600' : timer && timer < 10 ? 'text-destructive animate-pulse' : ''
                      }`}
                    >
                      {timer !== null ? formatTime(timer) : '--:--'}
                    </span>
                    {timer === 0 && (
                      <Volume2 className="w-5 h-5 text-green-600 animate-bounce" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={isTimerRunning ? "secondary" : "default"}
                    size="sm"
                    onClick={toggleTimer}
                    className="flex-1"
                  >
                    {isTimerRunning ? (
                      <><Pause className="w-4 h-4 mr-1" /> Pause</>
                    ) : timer === 0 ? (
                      <><Check className="w-4 h-4 mr-1" /> Done!</>
                    ) : (
                      <><Play className="w-4 h-4 mr-1" /> Start</>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetTimer}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Tip */}
            {step?.tip && (
              <div className="flex gap-3 p-3 bg-accent/30 rounded-lg">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-accent-foreground">{step.tip}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mb-6">
          <Button 
            variant="outline" 
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <SkipBack className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button 
            onClick={nextStep}
            disabled={allStepsComplete}
            className="flex-1 bg-gradient-warm hover:opacity-90"
          >
            {currentStep === steps.length - 1 ? (
              completedSteps.has(currentStep) ? (
                <><Check className="w-4 h-4 mr-2" /> All Done!</>
              ) : (
                <><Check className="w-4 h-4 mr-2" /> Mark Complete</>
              )
            ) : (
              <>Next Step <SkipForward className="w-4 h-4 ml-2" /></>
            )}
          </Button>
        </div>

        {/* Finish cooking button when all done */}
        {allStepsComplete && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button 
              size="lg" 
              className="w-full bg-green-600 hover:bg-green-700 mb-6"
              onClick={onComplete}
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Finish Cooking 🎉
            </Button>
          </motion.div>
        )}

        {/* Help Section */}
        <AnimatePresence>
          {showHelp ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Need help with this step?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {helpQuestions.map((question, i) => (
                    <Button
                      key={i}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => {
                        onAskHelp(question);
                        setShowHelp(false);
                      }}
                    >
                      {question}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setShowHelp(true)}
              className="w-full"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              I need help with this step
            </Button>
          )}
        </AnimatePresence>

        {/* Step Overview */}
        <div className="mt-6">
          <h3 className="font-medium text-sm text-muted-foreground mb-3">All Steps</h3>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  i === currentStep 
                    ? 'border-primary bg-primary/5' 
                    : completedSteps.has(i)
                    ? 'border-green-200 bg-green-50 dark:bg-green-950/20'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    completedSteps.has(i)
                      ? 'bg-green-500 text-white'
                      : i === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {completedSteps.has(i) ? <Check className="w-3 h-3" /> : i + 1}
                  </div>
                  <span className={`text-sm line-clamp-1 ${
                    completedSteps.has(i) ? 'text-muted-foreground line-through' : ''
                  }`}>
                    {s.instruction}
                  </span>
                  {s.duration && (
                    <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTime(s.duration)}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
