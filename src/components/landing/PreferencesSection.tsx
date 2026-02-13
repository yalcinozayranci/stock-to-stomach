import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera, ShieldCheck, ChefHat, Heart, BarChart3, BookImage } from 'lucide-react';

interface PreferencesSectionProps {
  onGetStarted: () => void;
}

const highlights = [
  { icon: Camera, text: 'Photo scanning' },
  { icon: BarChart3, text: 'Stock tracking' },
  { icon: ShieldCheck, text: 'Allergy safety' },
  { icon: Heart, text: 'Taste learning' },
  { icon: ChefHat, text: 'AI recipes' },
  { icon: BookImage, text: 'Visual cooking' },
];

export function PreferencesSection({ onGetStarted }: PreferencesSectionProps) {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto relative overflow-hidden rounded-3xl"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative p-8 md:p-16 text-center">
            {/* Emoji row */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-3 text-4xl mb-8"
            >
              <motion.span animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>📸</motion.span>
              <motion.span animate={{ y: [3, -3, 3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>🤖</motion.span>
              <motion.span animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}>🍳</motion.span>
              <motion.span animate={{ y: [3, -3, 3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>🛡️</motion.span>
              <motion.span animate={{ y: [-3, 3, -3] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}>📖</motion.span>
            </motion.div>

            {/* Title */}
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
              Ready to Cook{' '}
              <span className="text-gradient-warm">Smarter?</span>
            </h2>

            {/* Description */}
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg leading-relaxed">
              Join thousands of home cooks who save time, reduce waste, and discover amazing meals every day — all from what's already in their fridge.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {highlights.map((h, i) => (
                <motion.div
                  key={h.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-border/50 shadow-sm"
                >
                  <h.icon className="w-4 h-4 text-primary" />
                  <span className="text-foreground/80">{h.text}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-gradient-warm hover:opacity-90 rounded-full px-10 py-7 text-lg shadow-xl hover:shadow-2xl transition-all gap-2"
                onClick={onGetStarted}
              >
                Start Cooking for Free
                <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Free to start · No credit card required
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
