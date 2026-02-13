import { motion } from 'framer-motion';
import { Camera, ArrowRight, ScanLine, ChefHat, BookOpen } from 'lucide-react';

const journeySteps = [
  {
    step: 1,
    icon: Camera,
    title: 'Snap Your Ingredients',
    description: 'Open the app, point your camera at your fridge or lay out your ingredients. One tap is all it takes.',
    visual: (
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200/50 dark:border-blue-800/30 overflow-hidden flex items-center justify-center">
        {/* Phone mockup */}
        <div className="relative w-28 h-52 bg-slate-900 rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-slate-800 rounded-b-lg z-10" />
          <div className="absolute inset-1 rounded-xl bg-gradient-to-b from-blue-400/20 to-cyan-400/20 flex flex-col items-center justify-center gap-1.5">
            <div className="text-2xl">🧊</div>
            <div className="flex gap-1 text-lg">
              <span>🥚</span><span>🧀</span><span>🥛</span>
            </div>
            <div className="flex gap-1 text-lg">
              <span>🥕</span><span>🍅</span><span>🌶️</span>
            </div>
            {/* Scanning line */}
            <motion.div
              className="absolute left-2 right-2 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
              animate={{ top: ['20%', '80%', '20%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-white/30" />
        </div>
        {/* Decorative circles */}
        <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-blue-200/30 dark:bg-blue-700/20" />
        <div className="absolute bottom-4 left-4 w-10 h-10 rounded-full bg-cyan-200/30 dark:bg-cyan-700/20" />
      </div>
    ),
  },
  {
    step: 2,
    icon: ScanLine,
    title: 'AI Detects & Organizes',
    description: 'In seconds, AI identifies every ingredient, categorizes them, and updates your personal stock inventory.',
    visual: (
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/30 overflow-hidden p-6">
        <div className="space-y-2.5">
          {[
            { name: 'Eggs', cat: 'Protein', emoji: '🥚', conf: '98%' },
            { name: 'Tomatoes', cat: 'Vegetables', emoji: '🍅', conf: '96%' },
            { name: 'Cheese', cat: 'Dairy', emoji: '🧀', conf: '95%' },
            { name: 'Chicken', cat: 'Protein', emoji: '🍗', conf: '97%' },
            { name: 'Peppers', cat: 'Vegetables', emoji: '🌶️', conf: '94%' },
          ].map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex items-center gap-3 bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm border border-white/50"
            >
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.cat}</div>
              </div>
              <span className="text-xs font-bold text-purple-500 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">{item.conf}</span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    step: 3,
    icon: ChefHat,
    title: 'Get Personalized Recipes',
    description: 'AI creates recipes from your stock, tailored to your taste, cooking history, and dietary needs. Allergies always checked.',
    visual: (
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/30 overflow-hidden p-5">
        <div className="space-y-3">
          {[
            { name: 'Mediterranean Omelette', time: '15 min', emoji: '🍳', tag: 'Quick & Easy' },
            { name: 'Chicken Fajitas', time: '25 min', emoji: '🌮', tag: 'Family Favorite' },
            { name: 'Caprese Salad', time: '10 min', emoji: '🥗', tag: 'Healthy' },
          ].map((recipe, i) => (
            <motion.div
              key={recipe.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{recipe.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-bold text-foreground">{recipe.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">⏱ {recipe.time}</span>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{recipe.tag}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.div>
          ))}
          {/* Allergy badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 rounded-full px-4 py-2 mx-auto w-fit"
          >
            <span className="text-green-600 text-xs font-bold">✓ All recipes are safe for your allergies</span>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    step: 4,
    icon: BookOpen,
    title: 'Cook with Visual Guide',
    description: 'Follow every step with clear photos and detailed instructions. Like having a personal chef in your kitchen.',
    visual: (
      <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200/50 dark:border-emerald-800/30 overflow-hidden p-5">
        <div className="text-center mb-3">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">Step 2 of 5</span>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/50"
        >
          {/* Visual placeholder */}
          <div className="w-full h-24 rounded-lg bg-gradient-to-br from-emerald-200/60 to-teal-200/60 dark:from-emerald-800/40 dark:to-teal-800/40 flex items-center justify-center mb-3">
            <span className="text-4xl">🍳</span>
          </div>
          <h4 className="text-sm font-bold text-foreground mb-1">Dice the vegetables</h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Cut the tomatoes and peppers into small cubes. Keep them separate for now.
          </p>
          {/* Timer */}
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">⏱ Timer: 5 min</span>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs font-bold text-emerald-600 bg-emerald-200 dark:bg-emerald-800 px-3 py-1 rounded-full"
            >
              Next Step →
            </motion.div>
          </div>
        </motion.div>
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i <= 1 ? 'bg-emerald-500' : 'bg-emerald-200 dark:bg-emerald-800'}`} />
          ))}
        </div>
      </div>
    ),
  },
];

export function VisualJourneySection() {
  return (
    <section className="py-20 md:py-28 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-primary font-semibold text-sm tracking-wider uppercase mb-3"
          >
            Your Cooking Journey
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5"
          >
            From Photo to <span className="text-gradient-warm">Plate</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            See how easy it is to go from fridge photo to a delicious home-cooked meal.
          </motion.p>
        </div>

        {/* Journey Steps — alternating layout */}
        <div className="max-w-5xl mx-auto space-y-16 md:space-y-24">
          {journeySteps.map((item, i) => {
            const isReversed = i % 2 !== 0;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: '-50px' }}
                className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-12 lg:gap-16`}
              >
                {/* Visual */}
                <div className="w-full md:w-1/2">
                  {item.visual}
                </div>

                {/* Content */}
                <div className={`w-full md:w-1/2 ${isReversed ? 'md:text-right' : ''}`}>
                  {/* Step badge */}
                  <div className={`flex items-center gap-3 mb-4 ${isReversed ? 'md:justify-end' : ''}`}>
                    <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-sm">{item.step}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                    {item.description}
                  </p>

                  {/* Arrow to next step (not on last) */}
                  {i < journeySteps.length - 1 && (
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`mt-6 hidden md:block ${isReversed ? 'md:text-right' : ''}`}
                    >
                      <ArrowRight className={`w-5 h-5 text-primary/40 rotate-90 ${isReversed ? 'ml-auto' : ''}`} />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
