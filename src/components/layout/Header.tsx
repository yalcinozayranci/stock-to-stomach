import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { AuthModal } from '@/components/auth/AuthModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { ChefHat, Camera, BookOpen, User, LogOut, Menu, X, Crown, MessageCircle, ShoppingCart, Package } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSubscription } from '@/hooks/useSubscription';
import { Badge } from '@/components/ui/badge';
const navItems = [{
  path: '/my-kitchen',
  label: 'My Kitchen',
  icon: ChefHat
}, {
  path: '/scan',
  label: 'Scan',
  icon: Camera
}, {
  path: '/pantry',
  label: 'Pantry',
  icon: Package
}, {
  path: '/shopping-list',
  label: 'Shopping',
  icon: ShoppingCart
}, {
  path: '/chat',
  label: 'Ask Chef',
  icon: MessageCircle
}, {
  path: '/cooking-journal',
  label: 'Journal',
  icon: BookOpen
}];
export function Header() {
  const {
    user,
    signOut
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    tier,
    isPaid,
    creditsRemaining,
    creditsTotal,
  } = useSubscription();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const handleSignOut = async () => {
    await signOut();
  };
  return <>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div whileHover={{
            rotate: 15
          }} className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-6 h-6 text-primary-foreground" />
            </motion.div>
            <span className="font-display text-xl font-bold text-foreground hidden sm:block text-center">
              Cook From Here
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path}>
                  <Button variant={isActive ? 'secondary' : 'ghost'} size="sm" className={`gap-2 ${isActive ? 'bg-secondary' : ''}`}>
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>;
          })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {user && !isPaid && <Link to="/pricing">
                <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-1">
                  <Crown className="w-4 h-4" />
                  <span className="hidden sm:inline">Upgrade</span>
                </Button>
              </Link>}
            {user && (
              <Link to="/pricing">
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary/80 py-1.5">
                  🍳 {creditsRemaining}/{creditsTotal}
                </Badge>
              </Link>
            )}
            {user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                      <AvatarFallback className="bg-gradient-warm text-primary-foreground text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Hi, {displayName}! 👋</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Button onClick={() => setAuthModalOpen(true)} className="bg-gradient-warm hover:opacity-90">
                Sign In
              </Button>}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && <motion.nav initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden border-t border-border bg-background">
            <div className="container py-4 space-y-2">
              {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>;
          })}
            </div>
          </motion.nav>}
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>;
}