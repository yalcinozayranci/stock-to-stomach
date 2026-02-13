import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';

export function HomeHeader() {
  const { profile } = useProfile();
  const displayName = profile?.display_name || 'Chef';

  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
          Hello, {displayName}!
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold tracking-wide text-green-600 uppercase">
            AI Kitchen is Active
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-12 h-12 border-2 bg-background shadow-sm"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
      </Button>
    </div>
  );
}
