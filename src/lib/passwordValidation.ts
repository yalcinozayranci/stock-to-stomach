// Password validation utilities with HaveIBeenPwned integration

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSymbol: true,
} as const;

const PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  digit: /[0-9]/,
  symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~]/,
};

export interface PasswordStrengthResult {
  score: number; // 0-5
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasDigit: boolean;
    hasSymbol: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const requirements = {
    minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
    hasUppercase: PATTERNS.uppercase.test(password),
    hasLowercase: PATTERNS.lowercase.test(password),
    hasDigit: PATTERNS.digit.test(password),
    hasSymbol: PATTERNS.symbol.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const isValid = Object.values(requirements).every(Boolean);

  return { score, isValid, requirements };
}

export function getStrengthLabel(score: number): string {
  if (score <= 1) return 'Very Weak';
  if (score === 2) return 'Weak';
  if (score === 3) return 'Fair';
  if (score === 4) return 'Good';
  return 'Strong';
}

export function getStrengthColor(score: number): string {
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-orange-500';
  if (score === 3) return 'bg-yellow-500';
  if (score === 4) return 'bg-lime-500';
  return 'bg-green-500';
}

// SHA-1 hash function using Web Crypto API
async function sha1(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

/**
 * Check if a password has been leaked using HaveIBeenPwned API
 * Uses k-anonymity: only first 5 chars of hash are sent to API
 * @returns true if password has been leaked, false otherwise
 */
export async function checkLeakedPassword(password: string): Promise<boolean> {
  try {
    const hash = await sha1(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Adds padding to prevent fingerprinting
      },
    });

    if (!response.ok) {
      // If API fails, don't block the user - just log and continue
      console.warn('HIBP API check failed, proceeding without breach check');
      return false;
    }

    const text = await response.text();
    const hashes = text.split('\n');

    // Check if our suffix appears in the returned list
    for (const line of hashes) {
      const [hashSuffix] = line.split(':');
      if (hashSuffix.trim().toUpperCase() === suffix) {
        return true; // Password has been leaked
      }
    }

    return false;
  } catch (error) {
    // Network error or other issue - don't block user
    console.warn('Error checking leaked password:', error);
    return false;
  }
}

export function getPasswordErrors(result: PasswordStrengthResult): string[] {
  const errors: string[] = [];
  
  if (!result.requirements.minLength) {
    errors.push('Password must be at least 8 characters');
  }
  if (!result.requirements.hasUppercase) {
    errors.push('Password needs at least one uppercase letter');
  }
  if (!result.requirements.hasLowercase) {
    errors.push('Password needs at least one lowercase letter');
  }
  if (!result.requirements.hasDigit) {
    errors.push('Password needs at least one number');
  }
  if (!result.requirements.hasSymbol) {
    errors.push('Password needs at least one special character');
  }
  
  return errors;
}
