import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChefHat } from 'lucide-react';
import heroBackground from '@/assets/hero-food-background.jpg';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function HeroSection({ onGetStarted, onSignIn }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[550px] md:min-h-[650px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 md:py-24 flex items-center min-h-[550px] md:min-h-[650px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg"
        >
          {/* Small tag */}
          <span className="inline-block text-primary font-semibold text-sm tracking-wide uppercase mb-4">
            AI-Powered Kitchen
          </span>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground mb-5 leading-[1.15]">
            Snap your fridge.{' '}
            <span className="text-gradient-warm">Cook something amazing.</span>
          </h1>

          {/* Short description */}
          <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-md">
            AI scans your ingredients, suggests personalized recipes, and guides you step by step — allergy-safe, every time.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
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
              className="gap-2 text-base px-8 py-6 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background border-border/50"
              onClick={onSignIn}
            >
              <ChefHat className="w-5 h-5" />
              Sign In
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
