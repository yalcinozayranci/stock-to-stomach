import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePantry } from '@/hooks/usePantry';
import { useProfile } from '@/hooks/useProfile';
import { Sparkles, ChefHat, RefreshCw, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

interface AISuggestion {
  dish: string;
  reason: string;
}

export function PantryReminder() {
  const { pantryItems } = usePantry();
  const { profile } = useProfile();
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find expiring items
  const expiringItems = pantryItems.filter(item => {
    if (!item.expires_at) return false;
    const daysUntilExpiry = differenceInDays(new Date(item.expires_at), new Date());
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
  });

  // Get a quick AI suggestion
  const fetchSuggestion = async () => {
    if (pantryItems.length < 2) return;
    
    setIsLoading(true);
    try {
      const ingredientNames = pantryItems.slice(0, 5).map(i => i.name);
      const priorityIngredients = expiringItems.map(i => i.name);
      
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: [
            {
              role: 'user',
              content: `I have these ingredients: ${ingredientNames.join(', ')}${
                priorityIngredients.length > 0 
                  ? `. These are expiring soon: ${priorityIngredients.join(', ')}.` 
                  : '.'
              } Suggest ONE quick dish I could make. Reply with JSON only: {"dish": "dish name", "reason": "brief reason why"}`
            }
          ]
        }
      });

      if (error) throw error;
      
      // Parse the AI response
      const content = data.content || data.message;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setSuggestion(parsed);
        }
      } catch {
        // If parsing fails, create a simple suggestion
        setSuggestion({
          dish: 'A delicious meal',
          reason: 'Using your available ingredients'
        });
      }
    } catch (error) {
      console.error('Failed to get suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pantryItems.length >= 2 && !suggestion) {
      fetchSuggestion();
    }
  }, [pantryItems.length]);

  if (pantryItems.length < 2) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-primary/5 via-accent/5 to-background border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-display font-semibold">Based on your pantry...</h3>
                {expiringItems.length > 0 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {expiringItems.length} expiring
                  </Badge>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Thinking of ideas...</span>
                </div>
              ) : suggestion ? (
                <>
                  <p className="text-muted-foreground mb-1">
                    You have <span className="font-medium text-foreground">{pantryItems.slice(0, 3).map(i => i.name).join(', ')}</span>
                    {pantryItems.length > 3 && ` and ${pantryItems.length - 3} more`}.
                  </p>
                  <p className="text-lg font-medium text-primary mb-1">
                    Perfect for {suggestion.dish}!
                  </p>
                  <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                </>
              ) : (
                <p className="text-muted-foreground">
                  You have {pantryItems.length} ingredients ready to cook with!
                </p>
              )}

              <div className="flex gap-2 mt-4">
                <Button asChild className="bg-gradient-warm hover:opacity-90 gap-2">
                  <Link to="/cook-now">
                    <ChefHat className="w-4 h-4" />
                    Let's Cook
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchSuggestion}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
