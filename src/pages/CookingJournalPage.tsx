import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useCookingHistory, CookingEntry } from '@/hooks/useCookingHistory';
import { useAuth } from '@/hooks/useAuth';
import { CookingHistoryCard } from '@/components/cooking/CookingHistoryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, ChefHat, Star, Clock, MessageSquare, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { cuisineLabels, CuisineType } from '@/types/database';
import { AuthModal } from '@/components/auth/AuthModal';

export default function CookingJournalPage() {
  const { user } = useAuth();
  const { cookingHistory, isLoading } = useCookingHistory();
  const [selectedEntry, setSelectedEntry] = useState<CookingEntry | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h1 className="font-display text-3xl font-bold mb-2">Cooking Journal</h1>
          <p className="text-muted-foreground mb-6">
            Sign in to track your culinary creations and see your cooking journey.
          </p>
          <Button onClick={() => setAuthModalOpen(true)}>Sign In to Start</Button>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </div>
      </Layout>
    );
  }

  const totalCooks = cookingHistory.length;
  const averageRating = cookingHistory.filter(e => e.rating).length > 0
    ? (cookingHistory.reduce((sum, e) => sum + (e.rating || 0), 0) / cookingHistory.filter(e => e.rating).length).toFixed(1)
    : null;

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Cooking Journal
          </h1>
          <p className="text-muted-foreground">
            Your personal record of culinary adventures and kitchen victories.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <ChefHat className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{totalCooks}</p>
              <p className="text-sm text-muted-foreground">Dishes Cooked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto text-amber-500 mb-2" />
              <p className="text-2xl font-bold">{averageRating || '—'}</p>
              <p className="text-sm text-muted-foreground">Avg Rating</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="p-4 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-2xl font-bold">
                {cookingHistory.filter(e => e.notes || e.feedback).length}
              </p>
              <p className="text-sm text-muted-foreground">With Notes</p>
            </CardContent>
          </Card>
        </div>

        {/* Journal entries */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-40" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : cookingHistory.length === 0 ? (
          <Card className="p-12 text-center">
            <ChefHat className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">No cooking entries yet</h2>
            <p className="text-muted-foreground mb-4">
              Start cooking recipes and mark them as "I Made This!" to build your journal.
            </p>
            <Button variant="outline" asChild>
              <a href="/recipes">Browse Recipes</a>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cookingHistory.map((entry) => (
              <CookingHistoryCard
                key={entry.id}
                entry={entry}
                onClick={() => setSelectedEntry(entry)}
              />
            ))}
          </div>
        )}

        {/* Entry Detail Modal */}
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="sm:max-w-lg">
            {selectedEntry && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">
                    {selectedEntry.recipe?.title || 'Cooked Dish'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Image */}
                  {(selectedEntry.photo_url || selectedEntry.recipe?.image_url) && (
                    <div className="relative h-48 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={selectedEntry.photo_url || selectedEntry.recipe?.image_url || ''}
                        alt={selectedEntry.recipe?.title || 'Dish'}
                        className="w-full h-full object-cover"
                      />
                      {selectedEntry.photo_url && (
                        <Badge className="absolute top-2 left-2 bg-primary">
                          📸 Your Photo
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {format(new Date(selectedEntry.cooked_at), 'MMMM d, yyyy')}
                    </Badge>
                    {selectedEntry.recipe?.cuisine && (
                      <Badge variant="secondary">
                        {cuisineLabels[selectedEntry.recipe.cuisine as CuisineType]}
                      </Badge>
                    )}
                  </div>

                  {/* Rating */}
                  {selectedEntry.rating && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Your Rating:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= selectedEntry.rating!
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedEntry.notes && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        What worked well
                      </p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedEntry.notes}
                      </p>
                    </div>
                  )}

                  {/* Feedback */}
                  {selectedEntry.feedback && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        What you'd change
                      </p>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {selectedEntry.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
