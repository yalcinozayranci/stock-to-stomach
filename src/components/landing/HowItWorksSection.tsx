import { motion } from 'framer-motion';
import { Camera, ScanLine, Package, ShieldCheck, UserCircle, BookImage } from 'lucide-react';
import { HowItWorksVideo } from './HowItWorksVideo';

const steps = [
  {
    icon: Camera,
    title: 'Snap a Photo',
    desc: 'Take a photo of your fridge or the ingredients you want to cook with.',
  },
  {
    icon: ScanLine,
    title: 'AI Detects & Stocks',
    desc: 'AI instantly recognizes every ingredient and updates your personal stock inventory.',
  },
  {
    icon: UserCircle,
    title: 'Your Personal Profile',
    desc: 'We remember what you cooked, what you loved, and your dietary preferences.',
  },
  {
    icon: ShieldCheck,
    title: 'Allergy-Safe Recipes',
    desc: 'Your allergies are always checked — every recipe suggestion is safe for you.',
  },
  {
    icon: Package,
    title: 'Personalized Suggestions',
    desc: 'Get recipes tailored to your taste, your stock, and your cooking history.',
  },
  {
    icon: BookImage,
    title: 'Cook with Visual Guide',
    desc: 'Follow step-by-step instructions with photos and written guidance for every dish.',
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
            From photo to plate — your AI kitchen assistant handles everything.
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
