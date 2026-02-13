import { useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  checkPasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  type PasswordStrengthResult,
} from '@/lib/passwordValidation';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface RequirementItemProps {
  met: boolean;
  label: string;
}

function RequirementItem({ met, label }: RequirementItemProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={cn(met ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
    </div>
  );
}

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const result: PasswordStrengthResult = useMemo(
    () => checkPasswordStrength(password),
    [password]
  );

  const strengthLabel = getStrengthLabel(result.score);
  const strengthColor = getStrengthColor(result.score);
  const progressValue = (result.score / 5) * 100;

  if (!password) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength:</span>
          <span
            className={cn(
              'font-medium',
              result.score <= 2 && 'text-red-500',
              result.score === 3 && 'text-yellow-600',
              result.score >= 4 && 'text-green-500'
            )}
          >
            {strengthLabel}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn('h-full transition-all duration-300', strengthColor)}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <div className="grid grid-cols-1 gap-1.5">
        <RequirementItem
          met={result.requirements.minLength}
          label="At least 8 characters"
        />
        <RequirementItem
          met={result.requirements.hasUppercase}
          label="Contains uppercase letter"
        />
        <RequirementItem
          met={result.requirements.hasLowercase}
          label="Contains lowercase letter"
        />
        <RequirementItem
          met={result.requirements.hasDigit}
          label="Contains number"
        />
        <RequirementItem
          met={result.requirements.hasSymbol}
          label="Contains special character"
        />
      </div>
    </div>
  );
}
