import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Mail, Lock, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import {
  checkPasswordStrength,
  checkLeakedPassword,
  getPasswordErrors,
} from '@/lib/passwordValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'confirm-sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const { signIn, signUp, resetPassword } = useAuth();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) throw error;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      toast.error(errorMessage);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast.success('Password reset email sent! Check your inbox.');
        setMode('login');
      } else if (mode === 'signup') {
        // Check passwords match
        if (password !== confirmPassword) {
          setPasswordError('Passwords do not match');
          setLoading(false);
          return;
        }

        // Validate password strength
        const strengthResult = checkPasswordStrength(password);
        if (!strengthResult.isValid) {
          const errors = getPasswordErrors(strengthResult);
          setPasswordError(errors[0]);
          setLoading(false);
          return;
        }

        // Check for leaked password
        const isLeaked = await checkLeakedPassword(password);
        if (isLeaked) {
          setPasswordError('This password has been found in a data breach. Please choose a different one.');
          setLoading(false);
          return;
        }

        const { error } = await signUp(email, password, displayName);
        if (error) throw error;
        
        // Send confirmation email via our custom edge function
        try {
          await supabase.functions.invoke('send-confirmation-email', {
            body: { email, displayName }
          });
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't block signup if email fails - Supabase will send its own
        }
        
        // Show confirmation message instead of closing modal
        setMode('confirm-sent');
        toast.success('Account created! Please check your email to confirm.');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setPasswordError(null);
    setMode('login');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  const getTitle = () => {
    if (mode === 'confirm-sent') return 'Check Your Email';
    if (mode === 'forgot') return 'Reset Password';
    if (mode === 'signup') return 'Join Cook From Here';
    return 'Welcome Back';
  };

  // Email confirmation sent view
  if (mode === 'confirm-sent') {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            <DialogTitle className="text-center font-display text-2xl">
              Check Your Email
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4 mt-4">
            <p className="text-muted-foreground">
              We've sent a confirmation link to:
            </p>
            <p className="font-medium text-foreground">{email}</p>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account and start cooking!
            </p>
            
            <div className="pt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setMode('login')}
              >
                Back to Sign In
              </Button>
              <p className="text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or try signing up again.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-warm rounded-full flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="displayName"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Your name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Password fields - hide for forgot mode */}
          {mode !== 'forgot' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    required
                    minLength={8}
                    className="pl-10"
                  />
                </div>
                
                {/* Password strength meter - only show during signup */}
                {mode === 'signup' && (
                  <PasswordStrengthMeter password={password} className="mt-3" />
                )}
              </div>

              {/* Confirm password - only show during signup */}
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    key="confirmPassword"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordError(null);
                        }}
                        required
                        minLength={8}
                        className="pl-10"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password error alert */}
              {passwordError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              {/* Forgot password link - only show during login */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-warm hover:opacity-90 transition-opacity"
            disabled={loading || googleLoading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'forgot'
              ? 'Send Reset Email'
              : mode === 'login'
              ? 'Sign In'
              : 'Create Account'}
          </Button>

          {/* Google Sign-In - show for login and signup */}
          {mode !== 'forgot' && (
            <>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  'Connecting...'
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </Button>
            </>
          )}
        </form>

        <div className="text-center text-sm text-muted-foreground">
          {mode === 'forgot' ? (
            <>
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          ) : mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
