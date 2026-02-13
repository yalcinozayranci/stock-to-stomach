import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Camera, ChefHat, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CookingEntryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipeName: string;
  onSubmit: (data: {
    rating?: number;
    notes?: string;
    feedback?: string;
  }) => void;
  isLoading?: boolean;
}

export function CookingEntryModal({
  open,
  onOpenChange,
  recipeName,
  onSubmit,
  isLoading,
}: CookingEntryModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    onSubmit({
      rating: rating > 0 ? rating : undefined,
      notes: notes.trim() || undefined,
      feedback: feedback.trim() || undefined,
    });
    // Reset form
    setRating(0);
    setNotes('');
    setFeedback('');
  };

  const handleSkip = () => {
    onSubmit({});
    setRating(0);
    setNotes('');
    setFeedback('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2"
          >
            <ChefHat className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="font-display text-xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Amazing work, Chef! 🎉
            </motion.span>
          </DialogTitle>
          <DialogDescription>
            You just made <span className="font-semibold text-foreground">{recipeName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              How did it turn out?
            </Label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      (hoveredRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {rating > 0 && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  {rating === 5 && "Perfect! A masterpiece! 👨‍🍳"}
                  {rating === 4 && "Great job! Really delicious! 😋"}
                  {rating === 3 && "Good, but room to improve 👍"}
                  {rating === 2 && "Not quite right this time 🤔"}
                  {rating === 1 && "Better luck next time! 💪"}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              What worked well? (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Added extra garlic, the sauce was perfect..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Feedback */}
          <div className="space-y-2">
            <Label htmlFor="feedback" className="text-sm font-medium">
              What would you change? (optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="e.g., Less salt next time, cook longer..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save to Journal'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
