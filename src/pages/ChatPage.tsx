import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Send, ChefHat, User, Loader2, Sparkles, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { usePantry } from '@/hooks/usePantry';
import { ActiveCookingMode, CookingStep } from '@/components/cooking/ActiveCookingMode';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recipeData?: {
    recipeName: string;
    steps: CookingStep[];
  };
};

type ActiveCookingContext = {
  recipeName: string;
  currentStep: number;
  totalSteps: number;
  currentInstruction: string;
};

const quickSuggestions = [
  "What can I make with chicken?",
  "Give me a quick dinner idea",
  "Help me cook pasta carbonara",
  "I need a vegetarian recipe",
];

export default function ChatPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { pantryItems } = usePantry();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCooking, setActiveCooking] = useState<{
    recipeName: string;
    steps: CookingStep[];
  } | null>(null);
  const [cookingContext, setCookingContext] = useState<ActiveCookingContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const sendMessage = async (messageText: string, cookingCtx?: ActiveCookingContext) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await supabase.functions.invoke('chat-assistant', {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          pantryItems: pantryItems?.map(item => item.name) || [],
          dietaryPreferences: profile?.dietary_preferences || [],
          allergies: profile?.allergies || [],
          activeCooking: cookingCtx || cookingContext,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.data.message || "I'm sorry, I couldn't process that request. Please try again.",
        recipeData: response.data.recipeData,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const startCookingMode = (recipeName: string, steps: CookingStep[]) => {
    setActiveCooking({ recipeName, steps });
    setCookingContext({
      recipeName,
      currentStep: 0,
      totalSteps: steps.length,
      currentInstruction: steps[0]?.instruction || '',
    });
  };

  const handleCookingHelp = (question: string) => {
    // Close cooking mode temporarily to show chat
    const currentContext = cookingContext;
    setActiveCooking(null);
    sendMessage(question, currentContext || undefined);
  };

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'there';

  return (
    <Layout>
      <div className="container py-8 max-w-3xl h-[calc(100vh-12rem)] flex flex-col">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-gradient-warm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">Cook From Here Assistant</h1>
          <p className="text-muted-foreground text-sm">Your personal AI cooking companion</p>
        </div>

        {/* Messages Area */}
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent-foreground px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">AI-Powered</span>
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">
                  Hey {displayName}, happy to see you! 👋
                </h2>
                <p className="text-muted-foreground mb-6">
                  What would you like to cook today? I can guide you step-by-step!
                </p>
                
                {/* Quick Suggestions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {quickSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-sm"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gradient-warm text-primary-foreground">
                          <ChefHat className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="max-w-[80%]">
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Start Cooking Button */}
                      {message.recipeData && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-2"
                        >
                          <Button
                            size="sm"
                            onClick={() => startCookingMode(
                              message.recipeData!.recipeName,
                              message.recipeData!.steps
                            )}
                            className="bg-gradient-warm hover:opacity-90 gap-2"
                          >
                            <PlayCircle className="w-4 h-4" />
                            Start Cooking Mode
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-secondary">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-warm text-primary-foreground">
                    <ChefHat className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about cooking..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-warm hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Active Cooking Mode Overlay */}
      <AnimatePresence>
        {activeCooking && (
          <ActiveCookingMode
            recipeName={activeCooking.recipeName}
            steps={activeCooking.steps}
            onClose={() => {
              setActiveCooking(null);
              setCookingContext(null);
            }}
            onAskHelp={handleCookingHelp}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
}
