import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  ScanLine,
  Package,
  AlertTriangle,
  ChefHat,
  Sparkles,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Step definitions                                                   */
/* ------------------------------------------------------------------ */
const STEPS = [
  {
    id: 'scan',
    label: 'Scan Fridge',
    description: 'Take a photo of your fridge with your phone camera',
    icon: Camera,
    color: 'from-blue-500 to-cyan-400',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    activeBorder: 'border-blue-500',
    activeGlow: 'shadow-blue-500/20',
  },
  {
    id: 'analyze',
    label: 'AI Analysis',
    description: 'Our AI detects and identifies every ingredient',
    icon: ScanLine,
    color: 'from-purple-500 to-pink-400',
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-500/10',
    activeBorder: 'border-purple-500',
    activeGlow: 'shadow-purple-500/20',
  },
  {
    id: 'stock',
    label: 'Your Stock',
    description: 'See your pantry organized by category',
    icon: Package,
    color: 'from-emerald-500 to-teal-400',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    activeBorder: 'border-emerald-500',
    activeGlow: 'shadow-emerald-500/20',
  },
  {
    id: 'allergy',
    label: 'Allergies',
    description: 'Set dietary restrictions & food allergies',
    icon: AlertTriangle,
    color: 'from-amber-500 to-orange-400',
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    activeBorder: 'border-amber-500',
    activeGlow: 'shadow-amber-500/20',
  },
  {
    id: 'preference',
    label: 'Preferences',
    description: 'Choose cuisine type & meal preferences',
    icon: ChefHat,
    color: 'from-rose-500 to-red-400',
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-500/10',
    activeBorder: 'border-rose-500',
    activeGlow: 'shadow-rose-500/20',
  },
  {
    id: 'recipe',
    label: 'Your Recipe',
    description: 'Get a personalized recipe just for you',
    icon: Sparkles,
    color: 'from-primary to-accent',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    activeBorder: 'border-primary',
    activeGlow: 'shadow-primary/20',
  },
] as const;

const STEP_DURATION = 3500;

/* ------------------------------------------------------------------ */
/*  Individual step screens                                            */
/* ------------------------------------------------------------------ */

function ScanScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 px-4">
      <div className="relative w-full max-w-[200px] aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-4xl">
          <span>🧊</span>
          <div className="flex gap-1 text-2xl">
            <span>🥚</span><span>🥛</span><span>🧀</span>
          </div>
          <div className="flex gap-1 text-2xl">
            <span>🥕</span><span>🍅</span><span>🌶️</span>
          </div>
          <div className="flex gap-1 text-2xl">
            <span>🍋</span><span>🧈</span><span>🥬</span>
          </div>
        </div>
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
          animate={{ top: ['10%', '90%', '10%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <p className="text-xs text-muted-foreground text-center font-medium">
        Snap a photo of your fridge
      </p>
    </div>
  );
}

function AnalyzeScreen() {
  const items = ['Eggs', 'Milk', 'Cheese', 'Tomatoes', 'Carrots', 'Butter'];
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-4">
      <motion.div
        className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <ScanLine className="w-7 h-7 text-purple-500" />
      </motion.div>
      <p className="text-xs font-semibold text-purple-500">AI Analyzing...</p>
      <div className="w-full space-y-1.5 max-w-[180px]">
        {items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.3 }}
            className="flex items-center gap-2 bg-card rounded-lg px-3 py-1.5 shadow-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.3 + 0.2 }}
            >
              <Check className="w-3.5 h-3.5 text-green-500" />
            </motion.div>
            <span className="text-xs font-medium">{item}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StockScreen() {
  const categories = [
    { name: 'Dairy', emoji: '🥛', items: ['Milk', 'Cheese', 'Butter'], color: 'bg-blue-50 border-blue-200' },
    { name: 'Vegetables', emoji: '🥕', items: ['Tomatoes', 'Carrots', 'Lettuce'], color: 'bg-green-50 border-green-200' },
    { name: 'Protein', emoji: '🥚', items: ['Eggs'], color: 'bg-amber-50 border-amber-200' },
  ];
  return (
    <div className="flex flex-col h-full gap-2 px-3 py-2">
      <p className="text-xs font-bold text-center text-emerald-600">Your Pantry Stock</p>
      <div className="space-y-2 flex-1">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className={cn('rounded-lg border p-2', cat.color)}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{cat.emoji}</span>
              <span className="text-[10px] font-bold">{cat.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{cat.items.length} items</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {cat.items.map((item) => (
                <span key={item} className="text-[9px] bg-white/80 px-1.5 py-0.5 rounded-full font-medium">{item}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function AllergyScreen() {
  const allergies = [
    { name: 'Peanuts', emoji: '🥜', selected: true },
    { name: 'Shellfish', emoji: '🦐', selected: false },
    { name: 'Gluten', emoji: '🌾', selected: true },
    { name: 'Soy', emoji: '🫘', selected: false },
    { name: 'Lactose', emoji: '🥛', selected: false },
    { name: 'Tree Nuts', emoji: '🌰', selected: false },
  ];
  return (
    <div className="flex flex-col items-center h-full gap-3 px-3 py-2">
      <AlertTriangle className="w-8 h-8 text-amber-500" />
      <p className="text-xs font-bold text-amber-600">Any allergies?</p>
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {allergies.map((a, i) => (
          <motion.button
            key={a.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium border transition-all',
              a.selected
                ? 'bg-amber-100 border-amber-400 text-amber-800 shadow-sm'
                : 'bg-card border-border text-muted-foreground'
            )}
          >
            <span className="text-sm">{a.emoji}</span>
            <span>{a.name}</span>
            {a.selected && <Check className="w-3 h-3 ml-auto text-amber-600" />}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function PreferenceScreen() {
  const cuisines = [
    { name: 'Italian', emoji: '🇮🇹', selected: true },
    { name: 'Asian', emoji: '🥢', selected: false },
    { name: 'Mexican', emoji: '🇲🇽', selected: false },
    { name: 'Mediterranean', emoji: '🫒', selected: true },
  ];
  return (
    <div className="flex flex-col items-center h-full gap-3 px-3 py-2">
      <ChefHat className="w-8 h-8 text-rose-500" />
      <p className="text-xs font-bold text-rose-600">What do you feel like?</p>
      <div className="space-y-1.5 w-full">
        {cuisines.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-3 py-2 border transition-all',
              c.selected ? 'bg-rose-50 border-rose-300 shadow-sm' : 'bg-card border-border'
            )}
          >
            <span className="text-lg">{c.emoji}</span>
            <span className="text-xs font-semibold">{c.name}</span>
            {c.selected && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                <Check className="w-4 h-4 text-rose-500" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RecipeScreen() {
  return (
    <div className="flex flex-col h-full gap-2 px-3 py-2">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="text-3xl mb-1">🍝</div>
        <p className="text-xs font-bold text-primary">Your Personalized Recipe</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-xl border p-3 shadow-sm space-y-2"
      >
        <h4 className="text-sm font-bold">Mediterranean Egg Bake</h4>
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          <span>⏱ 25 min</span>
          <span>🔥 320 cal</span>
          <span>👤 2 servings</span>
        </div>
        <div className="h-px bg-border" />
        <div className="space-y-1">
          {['Preheat oven to 375°F', 'Dice tomatoes & carrots', 'Whisk eggs with cheese', 'Bake for 20 minutes'].map(
            (step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.3 }}
                className="flex items-start gap-1.5"
              >
                <span className="text-[10px] font-bold text-primary mt-px">{i + 1}.</span>
                <span className="text-[10px] leading-tight">{step}</span>
              </motion.div>
            )
          )}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="flex items-center justify-center gap-1 mt-auto"
      >
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-semibold text-primary">Tailored just for you</span>
      </motion.div>
    </div>
  );
}

const SCREEN_MAP: Record<string, () => JSX.Element> = {
  scan: ScanScreen,
  analyze: AnalyzeScreen,
  stock: StockScreen,
  allergy: AllergyScreen,
  preference: PreferenceScreen,
  recipe: RecipeScreen,
};

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function HowItWorksVideo() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, STEP_DURATION);
    return () => clearInterval(timer);
  }, [isPaused]);

  const ActiveScreen = SCREEN_MAP[STEPS[activeStep].id];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="w-full max-w-4xl mx-auto mb-16"
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-14">
        {/* ---- Phone mockup ---- */}
        <div
          className="relative flex-shrink-0 cursor-pointer"
          onClick={() => setIsPaused((p) => !p)}
          title={isPaused ? 'Click to play' : 'Click to pause'}
        >
          {/* Glow ring behind phone */}
          <div className="absolute -inset-3 rounded-[3rem] bg-gradient-to-br from-primary/10 via-transparent to-accent/10 blur-xl" />

          {/* Phone frame */}
          <div className="relative w-[220px] h-[440px] bg-background rounded-[2.5rem] border-[3px] border-foreground/10 shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-foreground/10 rounded-b-2xl z-10" />

            {/* Status bar */}
            <div className="relative z-10 pt-6 px-4 pb-1 flex items-center justify-between">
              <span className="text-[8px] font-bold text-muted-foreground">9:41</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-1.5 rounded-sm bg-foreground/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
              </div>
            </div>

            {/* Screen content */}
            <div className="relative h-[370px] overflow-hidden">
              {/* Gradient header bar with smooth color transition */}
              <motion.div
                className="h-8 flex items-center justify-center"
                animate={{
                  background: `linear-gradient(to right, var(--tw-gradient-stops))`,
                }}
              >
                <div className={cn('absolute inset-0 h-8 bg-gradient-to-r transition-all duration-500', STEPS[activeStep].color)} />
                <span className="relative text-[10px] font-bold text-white tracking-wide">
                  {STEPS[activeStep].label}
                </span>
              </motion.div>

              {/* Animated screen */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={STEPS[activeStep].id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35 }}
                  className="h-[342px]"
                >
                  <ActiveScreen />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full bg-foreground/15" />
          </div>

          {/* Pause indicator */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-foreground/10 backdrop-blur-[2px] rounded-[2.5rem] z-20"
              >
                <div className="flex gap-1.5">
                  <div className="w-3 h-10 bg-white/80 rounded" />
                  <div className="w-3 h-10 bg-white/80 rounded" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- Timeline (right side) ---- */}
        <div className="relative flex md:flex-col gap-3 md:gap-0">
          {/* Vertical connector line (desktop only) */}
          <div className="hidden md:block absolute left-[19px] top-[28px] bottom-[28px] w-[2px] bg-border/60 rounded-full" />
          {/* Animated progress on the connector */}
          <motion.div
            className="hidden md:block absolute left-[19px] top-[28px] w-[2px] rounded-full bg-gradient-to-b from-primary to-accent"
            animate={{
              height: `${(activeStep / (STEPS.length - 1)) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ maxHeight: 'calc(100% - 56px)' }}
          />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isActive = i === activeStep;
            const isPast = i < activeStep;

            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(i);
                  setIsPaused(false);
                }}
                className="relative flex items-start gap-4 group text-left md:py-[10px]"
              >
                {/* Circle icon */}
                <motion.div
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300',
                    isActive
                      ? cn('border-transparent shadow-lg', step.iconBg, step.activeGlow)
                      : isPast
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border bg-card'
                  )}
                  animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                >
                  {isPast ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </motion.div>
                  ) : (
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors duration-300',
                        isActive ? step.iconColor : 'text-muted-foreground/60'
                      )}
                    />
                  )}
                </motion.div>

                {/* Text content (desktop) */}
                <div className="hidden md:flex flex-col min-w-0 pt-0.5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`label-${step.id}-${isActive}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: isActive ? 0.1 : 0 }}
                      className={cn(
                        'text-sm font-semibold tracking-tight transition-colors duration-300 whitespace-nowrap',
                        isActive
                          ? 'text-foreground'
                          : isPast
                            ? 'text-foreground/70'
                            : 'text-muted-foreground/60'
                      )}
                    >
                      {step.label}
                    </motion.span>
                  </AnimatePresence>

                  {/* Description - only shown for active step */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, y: -4 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -4 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="text-xs text-muted-foreground leading-relaxed mt-0.5 max-w-[200px]"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-8 flex gap-2 justify-center">
        {STEPS.map((step, i) => (
          <button
            key={step.id}
            className="h-1.5 rounded-full overflow-hidden bg-border/50 w-10 md:w-14 cursor-pointer transition-all hover:bg-border"
            onClick={() => {
              setActiveStep(i);
              setIsPaused(false);
            }}
          >
            <motion.div
              className={cn(
                'h-full rounded-full',
                i <= activeStep ? 'bg-primary' : 'bg-transparent'
              )}
              initial={{ width: '0%' }}
              animate={{
                width: i < activeStep ? '100%' : i === activeStep ? '100%' : '0%',
              }}
              transition={
                i === activeStep
                  ? { duration: STEP_DURATION / 1000, ease: 'linear' }
                  : { duration: 0.3 }
              }
            />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
