import { motion } from 'framer-motion';
import { Clock, Leaf, ShieldCheck } from 'lucide-react';

const benefits = [
  {
    icon: Clock,
    title: 'Save Time',
    desc: 'Recipes ready in minutes from what you have.',
  },
  {
    icon: Leaf,
    title: 'Zero Waste',
    desc: 'Use ingredients before they expire.',
  },
  {
    icon: ShieldCheck,
    title: 'Allergy Safe',
    desc: 'Every recipe checked for your safety.',
  },
];

export function BenefitsBar() {
  return (
    <section className="py-14 md:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="flex items-start gap-4 bg-card rounded-2xl border border-border/50 p-6 shadow-sm"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
