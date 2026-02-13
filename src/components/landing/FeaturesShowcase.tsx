import { motion } from 'framer-motion';
import { Camera, Brain, ShieldCheck, BookImage, BarChart3, Heart } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Snap & Scan',
    description: 'Take a photo of your fridge or ingredients. Our AI instantly detects everything — no typing needed.',
    gradient: 'from-blue-500 to-cyan-400',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: BarChart3,
    title: 'Smart Stock Tracking',
    description: 'Your pantry, always up to date. Know what you have, what\'s expiring, and what you need to buy.',
    gradient: 'from-emerald-500 to-teal-400',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  {
    icon: Brain,
    title: 'AI-Powered Recipes',
    description: 'Recipes generated from your actual ingredients — personalized to your taste, history, and preferences.',
    gradient: 'from-purple-500 to-pink-400',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  {
    icon: ShieldCheck,
    title: 'Allergy Safe',
    description: 'Your allergies are always respected. Every recipe is checked to keep you and your family safe.',
    gradient: 'from-amber-500 to-orange-400',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  {
    icon: Heart,
    title: 'Learns Your Taste',
    description: 'The more you cook, the smarter it gets. Your profile remembers favorites, ratings, and cooking history.',
    gradient: 'from-rose-500 to-red-400',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    icon: BookImage,
    title: 'Visual Cooking Guide',
    description: 'Step-by-step instructions with photos and text. Like having a personal chef guiding you through every dish.',
    gradient: 'from-primary to-accent',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
];

export function FeaturesShowcase() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3"
          >
            Why Cook From Here?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5"
          >
            Everything You Need in{' '}
            <span className="text-gradient-warm">One App</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            From scanning your fridge to plating your meal — AI handles the hard parts so you can enjoy cooking.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative bg-card rounded-2xl border border-border/50 p-6 md:p-8 h-full transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20">
                {/* Gradient accent line */}
                <div className={`absolute top-0 left-6 right-6 h-1 rounded-b-full bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-5`}
                >
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} strokeWidth={1.5} />
                </motion.div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
