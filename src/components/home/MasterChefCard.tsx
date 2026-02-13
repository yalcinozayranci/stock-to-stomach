import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function MasterChefCard() {
  return (
    <Link to="/pantry">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full rounded-3xl bg-gradient-to-br from-primary to-accent p-6 overflow-hidden min-h-[200px]"
      >
        {/* Chef hat decoration */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-20">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M12 3C10.5 3 9.2 3.7 8.3 4.8C7.1 4.3 5.7 4.5 4.6 5.4C3.5 6.3 3 7.7 3.2 9.1C2.1 9.9 1.5 11.1 1.5 12.5C1.5 14.4 2.7 16 4.5 16.7V20C4.5 20.6 5 21 5.5 21H18.5C19 21 19.5 20.6 19.5 20V16.7C21.3 16 22.5 14.4 22.5 12.5C22.5 11.1 21.9 9.9 20.8 9.1C21 7.7 20.5 6.3 19.4 5.4C18.3 4.5 16.9 4.3 15.7 4.8C14.8 3.7 13.5 3 12 3Z"/>
          </svg>
        </div>

        {/* Icon badge */}
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Master Chef<br/>Suggestion
        </h2>
        <p className="text-white/80 text-sm max-w-[200px]">
          Instant recipes based on your stock and allergies.
        </p>
      </motion.div>
    </Link>
  );
}
