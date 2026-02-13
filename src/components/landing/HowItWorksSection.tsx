import { motion } from 'framer-motion';
import { Camera, ScanLine, ShieldCheck, BookImage } from 'lucide-react';
import { HowItWorksVideo } from './HowItWorksVideo';

const steps = [
  {
    icon: Camera,
    title: 'Snap',
    desc: 'Photo your fridge or ingredients.',
  },
  {
    icon: ScanLine,
    title: 'Detect',
    desc: 'AI identifies everything instantly.',
  },
  {
    icon: ShieldCheck,
    title: 'Match',
    desc: 'Safe, personalized recipes for you.',
  },
  {
    icon: BookImage,
    title: 'Cook',
    desc: 'Step-by-step visual guide.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground text-base max-w-md mx-auto">
            Four simple steps from fridge to fork.
          </p>
        </div>

        {/* Interactive Demo */}
        <HowItWorksVideo />

        {/* Compact Steps */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-3xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-base font-bold text-foreground mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-snug">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
