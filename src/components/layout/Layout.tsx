import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNavigation } from '@/components/home/BottomNavigation';

interface LayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
  showBottomNav?: boolean;
}

export function Layout({ children, hideNavigation, showBottomNav }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!hideNavigation && <Header />}
      <main className="flex-1">{children}</main>
      {!showBottomNav && !hideNavigation && (
        <footer className="border-t border-border py-8 bg-card">
          <div className="container text-center text-sm text-muted-foreground space-y-3">
            <p className="font-display text-foreground font-semibold">Cook From Here</p>
            <p>Transform your ingredients into delicious meals</p>
            <div className="pt-2 border-t border-border/50">
              <p>
                Questions? Contact us at{' '}
                <a 
                  href="mailto:hello@cookfromhere.com" 
                  className="text-primary hover:underline font-medium"
                >
                  hello@cookfromhere.com
                </a>
              </p>
            </div>
          </div>
        </footer>
      )}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
}
