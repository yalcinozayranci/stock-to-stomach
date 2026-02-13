import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ScanLine } from 'lucide-react';

export function AIPantryScanCard() {
  return (
    <Link to="/scan">
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full rounded-3xl overflow-hidden min-h-[180px]"
      >
        {/* Background image simulation with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-800/90 via-green-700/80 to-yellow-700/70" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800')] bg-cover bg-center opacity-60" />
        
        {/* Content overlay */}
        <div className="relative flex flex-col items-center justify-center h-full min-h-[180px] py-8">
          {/* Scan icon */}
          <div className="w-14 h-14 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center mb-4">
            <ScanLine className="w-7 h-7 text-white" />
          </div>

          {/* Text */}
          <h3 className="font-display text-xl font-bold text-white tracking-wide mb-1">
            AI PANTRY SCAN
          </h3>
          <p className="text-white/70 text-xs font-medium tracking-[0.2em] uppercase">
            Visual Recognition Active
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
