import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useIngredientScanner } from '@/hooks/useIngredientScanner';
import { usePantry } from '@/hooks/usePantry';
import { useSubscription } from '@/hooks/useSubscription';
import { AnalyzedIngredient, IngredientCategory } from '@/types/database';
import { Camera, Upload, Loader2, Check, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { UpgradeModal } from '@/components/paywall/UpgradeModal';

interface IngredientScannerProps {
  onComplete?: () => void;
}

export function IngredientScanner({ onComplete }: IngredientScannerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { isAnalyzing, analyzedIngredients, analyzeImage, clearResults } = useIngredientScanner();
  const { addMultipleItems } = usePantry();
  const { canScan, deductScanCredit, hasUnlimitedScans } = useSubscription();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Check scan credits before proceeding
    if (!canScan) {
      setUpgradeModalOpen(true);
      return;
    }

    // Deduct scan credit before analyzing (only for limited plans)
    if (!hasUnlimitedScans) {
      const success = await deductScanCredit();
      if (!success) {
        setUpgradeModalOpen(true);
        return;
      }
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPreview(base64);
      setSelectedIngredients(new Set());
      
      // Analyze the image
      const ingredients = await analyzeImage(base64);
      if (ingredients.length > 0) {
        // Pre-select all detected ingredients
        setSelectedIngredients(new Set(ingredients.map((i) => i.name)));
      }
    };
    reader.readAsDataURL(file);
  }, [analyzeImage, canScan, deductScanCredit, hasUnlimitedScans]);

  const handleCameraCapture = () => {
    if (!canScan) {
      setUpgradeModalOpen(true);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (!canScan) {
      setUpgradeModalOpen(true);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const toggleIngredient = (name: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleAddToPantry = async () => {
    const toAdd = analyzedIngredients
      .filter((i) => selectedIngredients.has(i.name))
      .map((i) => ({
        name: i.name,
        category: i.category as IngredientCategory,
      }));

    if (toAdd.length === 0) {
      toast.error('Please select at least one ingredient');
      return;
    }

    await addMultipleItems.mutateAsync(toAdd);
    clearResults();
    setPreview(null);
    setSelectedIngredients(new Set());
    onComplete?.();
  };

  const clearAll = () => {
    setPreview(null);
    setSelectedIngredients(new Set());
    clearResults();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload area */}
      {!preview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={handleCameraCapture}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">Take Photo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use your camera
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:border-primary transition-colors group"
            onClick={handleFileUpload}
          >
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">Upload Image</h3>
              <p className="text-sm text-muted-foreground mt-1">
                From your device
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Preview and results */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4"
          >
            {/* Image preview */}
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={preview}
                alt="Captured ingredients"
                className="w-full max-h-64 object-cover"
              />
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={clearAll}
              >
                <X className="w-4 h-4" />
              </Button>
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                    <p className="mt-2 text-sm font-medium">Analyzing ingredients...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Detected ingredients */}
            {analyzedIngredients.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-display text-lg font-semibold mb-4">
                    Detected Ingredients
                  </h3>
                  <div className="space-y-3">
                    {analyzedIngredients.map((ingredient: AnalyzedIngredient) => (
                      <div
                        key={ingredient.name}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50"
                      >
                        <Checkbox
                          checked={selectedIngredients.has(ingredient.name)}
                          onCheckedChange={() => toggleIngredient(ingredient.name)}
                        />
                        <span className="flex-1 capitalize font-medium">
                          {ingredient.name}
                        </span>
                        <Badge variant="outline" className="capitalize text-xs">
                          {ingredient.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(ingredient.confidence * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (selectedIngredients.size === analyzedIngredients.length) {
                          setSelectedIngredients(new Set());
                        } else {
                          setSelectedIngredients(
                            new Set(analyzedIngredients.map((i) => i.name))
                          );
                        }
                      }}
                    >
                      {selectedIngredients.size === analyzedIngredients.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                    <Button
                      className="flex-1 bg-gradient-warm hover:opacity-90"
                      onClick={handleAddToPantry}
                      disabled={selectedIngredients.size === 0 || addMultipleItems.isPending}
                    >
                      {addMultipleItems.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Add to Pantry ({selectedIngredients.size})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No ingredients found */}
            {!isAnalyzing && analyzedIngredients.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <ImagePlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No ingredients detected. Try taking a clearer photo with better lighting.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={clearAll}>
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <UpgradeModal 
        open={upgradeModalOpen} 
        onOpenChange={setUpgradeModalOpen}
        type="scan"
      />
    </div>
  );
}
