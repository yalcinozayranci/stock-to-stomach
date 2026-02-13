import { motion } from 'framer-motion';
import { Camera, ScanLine, Package, AlertTriangle, ChefHat, Sparkles } from 'lucide-react';
import { HowItWorksVideo } from './HowItWorksVideo';

const steps = [
  {
    icon: Camera,
    title: 'Scan Your Fridge',
    desc: 'Snap a photo of your fridge with your phone. Our AI camera detects every ingredient automatically.',
  },
  {
    icon: ScanLine,
    title: 'AI Analyzes Everything',
    desc: 'Our AI instantly recognizes all your ingredients and categorizes them for you.',
  },
  {
    icon: Package,
    title: 'See Your Stock',
    desc: 'View your full pantry organized by category—dairy, vegetables, protein, and more.',
  },
  {
    icon: AlertTriangle,
    title: 'Set Allergies',
    desc: 'Tell us about any food allergies or dietary restrictions to keep your meals safe.',
  },
  {
    icon: ChefHat,
    title: 'Choose Your Style',
    desc: 'Pick the cuisine or meal type you\'re craving—Italian, Asian, quick meals, and more.',
  },
  {
    icon: Sparkles,
    title: 'Get Your Recipe',
    desc: 'Receive a personalized recipe with step-by-step instructions, tailored just for you.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Delicious meals from your fridge—personalized just for you.
          </p>
        </div>

        {/* Video Player */}
        <HowItWorksVideo />

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              {/* Icon Container */}
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
              >
                <step.icon className="w-12 h-12 text-primary" strokeWidth={1.5} />
              </motion.div>

              {/* Title */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
