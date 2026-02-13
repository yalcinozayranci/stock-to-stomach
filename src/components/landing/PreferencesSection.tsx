import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ChefHat, Heart } from 'lucide-react';

interface PreferencesSectionProps {
  onGetStarted: () => void;
}

export function PreferencesSection({ onGetStarted }: PreferencesSectionProps) {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 rounded-3xl p-8 md:p-12 text-center"
        >
          {/* Icons */}
          <div className="flex justify-center gap-4 mb-6">
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center"
            >
              <ShieldCheck className="w-6 h-6 text-primary" />
            </motion.div>
            <motion.div
              animate={{ y: [2, -2, 2] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-accent-foreground" />
            </motion.div>
            <motion.div
              animate={{ y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
              className="w-12 h-12 bg-primary/15 rounded-xl flex items-center justify-center"
            >
              <ChefHat className="w-6 h-6 text-primary" />
            </motion.div>
          </div>

          {/* Title */}
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Built Around You
          </h3>

          {/* Description */}
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
            Your allergies, your taste, your history — all in one profile. Every recipe is safe, personal, and made from what you already have. No waste, just great food.
          </p>

          {/* CTA */}
          <Button 
            size="lg"
            className="bg-gradient-warm hover:opacity-90 rounded-full px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all" 
            onClick={onGetStarted}
          >
            Get Started Free
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
