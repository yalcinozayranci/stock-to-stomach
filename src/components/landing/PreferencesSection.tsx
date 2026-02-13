import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface PreferencesSectionProps {
  onGetStarted: () => void;
}

export function PreferencesSection({ onGetStarted }: PreferencesSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to cook <span className="text-gradient-warm">smarter?</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Free to start. No credit card needed.
          </p>
          <Button
            size="lg"
            className="bg-gradient-warm hover:opacity-90 rounded-full px-10 py-7 text-lg shadow-lg hover:shadow-xl transition-all gap-2"
            onClick={onGetStarted}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
