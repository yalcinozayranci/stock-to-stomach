import { Link, useLocation } from 'react-router-dom';
import { Home, Package, ScanLine, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'HOME', icon: Home },
  { path: '/pantry', label: 'PANTRY', icon: Package },
  { path: '/scan', label: 'SCAN', icon: ScanLine },
  { path: '/profile', label: 'PROFILE', icon: User },
];

export function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="bg-[hsl(220,30%,15%)] rounded-3xl px-4 py-3 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
                isActive 
                  ? "bg-[hsl(220,30%,22%)]" 
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-white/80"
              )} />
              <span className={cn(
                "text-[10px] font-semibold tracking-wide",
                isActive ? "text-white" : "text-white/80"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
