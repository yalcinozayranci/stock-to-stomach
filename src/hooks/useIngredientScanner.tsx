import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyzedIngredient } from '@/types/database';
import { toast } from 'sonner';

export function useIngredientScanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedIngredients, setAnalyzedIngredients] = useState<AnalyzedIngredient[]>([]);

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setAnalyzedIngredients([]);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-ingredients', {
        body: { imageBase64 },
      });
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      const ingredients = data.ingredients as AnalyzedIngredient[];
      setAnalyzedIngredients(ingredients);
      
      if (ingredients.length === 0) {
        toast.info('No ingredients detected. Try a clearer image.');
      } else {
        toast.success(`Found ${ingredients.length} ingredients!`);
      }
      
      return ingredients;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Rate limit')) {
        toast.error('Too many requests. Please wait a moment.');
      } else if (errorMessage.includes('credits')) {
        toast.error('AI credits depleted. Please try later.');
      } else {
        toast.error('Failed to analyze image');
      }
      console.error(error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearResults = () => {
    setAnalyzedIngredients([]);
  };

  return {
    isAnalyzing,
    analyzedIngredients,
    analyzeImage,
    clearResults,
  };
}
