import { useState, useEffect, useCallback } from 'react';
import { Mail, LogOut, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const COOLDOWN_SECONDS = 60;

export function EmailConfirmationPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleResendEmail = useCallback(async () => {
    if (!user?.email || cooldownRemaining > 0) return;

    setIsResending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
        body: {
          email: user.email,
          displayName: user.user_metadata?.display_name,
        },
      });

      if (error) throw error;

      toast({
        title: 'Email sent!',
        description: 'Please check your inbox for the confirmation link.',
      });

      setCooldownRemaining(COOLDOWN_SECONDS);
    } catch (error) {
      console.error('Failed to resend email:', error);
      toast({
        title: 'Failed to send email',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  }, [user, cooldownRemaining, toast]);

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCancelRegistration = async () => {
    if (!user) return;

    setIsCancelling(true);
    try {
      // Delete the user's profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Error deleting profile:', profileError);
      }

      // Sign out the user
      await signOut();

      toast({
        title: 'Registration cancelled',
        description: 'Your account has been removed.',
      });
    } catch (error) {
      console.error('Failed to cancel registration:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel registration. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Mail className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">Please confirm your email</CardTitle>
          <CardDescription className="text-base">
            We sent an email to <span className="font-medium text-foreground">{user?.email}</span>.
            It contains a link you need to click to confirm your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            You will need to do this before you can access the app.
          </p>

          <Button
            onClick={handleResendEmail}
            disabled={isResending || cooldownRemaining > 0}
            className="w-full"
            size="lg"
          >
            {isResending ? (
              'Sending...'
            ) : cooldownRemaining > 0 ? (
              `Resend in ${cooldownRemaining}s`
            ) : (
              'Resend Confirmation Email'
            )}
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 text-destructive hover:text-destructive"
                  disabled={isCancelling}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Cancel Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel registration?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your account and you'll need to sign up again if you want to use the app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep my account</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelRegistration}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes, cancel registration
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Didn't receive the email? Check your spam folder or click resend above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
