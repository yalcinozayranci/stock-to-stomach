import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ChefHat, Camera, ShieldCheck, BookOpen } from 'lucide-react';
import heroBackground from '@/assets/hero-food-background.jpg';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function HeroSection({ onGetStarted, onSignIn }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 md:py-24 flex items-center min-h-[600px] md:min-h-[700px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center w-full">

          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full mb-6 shadow-sm border border-border/50"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Your Personal AI Chef</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Snap Your Fridge,{' '}
              <span className="text-gradient-warm">Get Personalized Recipes</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-xl leading-relaxed">
              Take a photo of your ingredients. AI creates recipes tailored to your taste, tracks your stock, respects your allergies, and guides you step by step with photos.
            </p>

            {/* Mini Feature Pills */}
            <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
              {[
                { icon: Camera, label: 'Photo Scan' },
                { icon: ShieldCheck, label: 'Allergy Safe' },
                { icon: BookOpen, label: 'Visual Guide' },
              ].map((pill, i) => (
                <motion.div
                  key={pill.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5 bg-background/80 backdrop-blur-sm text-foreground/70 px-3 py-1.5 rounded-full text-xs font-medium border border-border/30"
                >
                  <pill.icon className="w-3.5 h-3.5 text-primary" />
                  {pill.label}
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-gradient-warm hover:opacity-90 gap-2 text-base px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
                onClick={onGetStarted}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gap-2 text-base px-8 py-6 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background border-border/50 shadow-sm"
                onClick={onSignIn}
              >
                <ChefHat className="w-5 h-5" />
                Sign In
              </Button>
            </div>
          </motion.div>

          {/* Right: Visual Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-6 rounded-[4rem] bg-gradient-to-br from-primary/15 via-transparent to-accent/15 blur-2xl" />

              {/* Phone frame */}
              <div className="relative w-[260px] h-[520px] bg-background rounded-[3rem] border-[4px] border-foreground/10 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-b-2xl z-10" />

                {/* Status bar */}
                <div className="relative z-10 pt-7 px-5 pb-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground">9:41</span>
                  <div className="flex gap-0.5">
                    <div className="w-3.5 h-2 rounded-sm bg-foreground/20" />
                    <div className="w-2 h-2 rounded-full bg-foreground/20" />
                  </div>
                </div>

                {/* App content preview */}
                <div className="px-4 space-y-3">
                  {/* App header */}
                  <div className="text-center py-2">
                    <div className="text-xs font-bold text-primary">🍳 Cook From Here</div>
                  </div>

                  {/* Scanned items card */}
                  <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm">
                    <div className="text-[10px] font-bold text-foreground mb-2">📸 Detected Items</div>
                    <div className="flex flex-wrap gap-1">
                      {['🥚 Eggs', '🧀 Cheese', '🍅 Tomato', '🌶️ Pepper', '🥛 Milk'].map((item) => (
                        <span key={item} className="text-[8px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">{item}</span>
                      ))}
                    </div>
                  </div>

                  {/* Recipe suggestion */}
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-3 border border-primary/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🍳</span>
                      <div>
                        <div className="text-[10px] font-bold text-foreground">Mediterranean Omelette</div>
                        <div className="text-[8px] text-muted-foreground">⏱ 15min · 🔥 Easy · ✅ Safe</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="flex-1 h-1 rounded-full bg-primary/30" />
                      <div className="flex-1 h-1 rounded-full bg-primary/15" />
                      <div className="flex-1 h-1 rounded-full bg-primary/10" />
                    </div>
                  </motion.div>

                  {/* Cooking step preview */}
                  <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm">
                    <div className="text-[10px] font-bold text-emerald-600 mb-1">📖 Step 1 of 4</div>
                    <div className="w-full h-12 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center text-lg mb-1">🥚🍳</div>
                    <p className="text-[8px] text-muted-foreground">Crack eggs and whisk with cheese...</p>
                  </div>

                  {/* Allergy badge */}
                  <div className="flex items-center justify-center gap-1 bg-green-100 dark:bg-green-900/30 rounded-full px-3 py-1">
                    <ShieldCheck className="w-3 h-3 text-green-600" />
                    <span className="text-[8px] font-bold text-green-700 dark:text-green-400">Allergy-Safe Recipe</span>
                  </div>
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-foreground/15" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
