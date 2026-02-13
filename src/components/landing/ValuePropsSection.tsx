import { motion } from 'framer-motion';
import { Leaf, Clock, TrendingDown, Sparkles } from 'lucide-react';

const stats = [
  {
    icon: TrendingDown,
    value: '60%',
    label: 'Less Food Waste',
    description: 'Use what you have before it expires',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Clock,
    value: '15min',
    label: 'Average Prep Time',
    description: 'Quick recipes from your ingredients',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Sparkles,
    value: '1000+',
    label: 'AI Recipe Variations',
    description: 'Endless possibilities from your fridge',
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Leaf,
    value: '100%',
    label: 'Allergy Safe',
    description: 'Every recipe respects your dietary needs',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

const benefits = [
  {
    emoji: '📸',
    title: 'No More "What\'s for Dinner?"',
    desc: 'Just snap a photo and let AI figure it out.',
  },
  {
    emoji: '💰',
    title: 'Save Money on Groceries',
    desc: 'Cook with what you have instead of buying new ingredients.',
  },
  {
    emoji: '🍽️',
    title: 'Discover New Dishes Daily',
    desc: 'AI creates fresh recipes based on your evolving stock.',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Safe for the Whole Family',
    desc: 'Allergies and dietary needs are always front and center.',
  },
];

export function ValuePropsSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <motion.div
                initial={{ scale: 0.5 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, type: 'spring' }}
                className={`font-display text-3xl md:text-4xl font-bold ${stat.color} mb-1`}
              >
                {stat.value}
              </motion.div>
              <div className="font-semibold text-foreground text-sm mb-1">{stat.label}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
            >
              Cook Smarter, <span className="text-gradient-warm">Not Harder</span>
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 bg-card rounded-2xl border border-border/50 p-5 md:p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <span className="text-3xl flex-shrink-0">{benefit.emoji}</span>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
