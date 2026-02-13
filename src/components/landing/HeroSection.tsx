import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, ChefHat } from 'lucide-react';
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
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 py-16 md:py-24 flex flex-col items-center justify-center min-h-[600px] md:min-h-[700px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center"
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
          <p className="text-lg md:text-xl text-foreground/80 mb-8 max-w-xl mx-auto leading-relaxed">
            Take a photo of your ingredients. AI creates recipes tailored to your taste, tracks your stock, respects your allergies, and guides you step by step with photos.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </div>
    </section>
  );
}
