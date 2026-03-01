export interface PasswordStrength {
  score: number;
  label: "Very Weak" | "Weak" | "Fair" | "Good" | "Strong";
  checks: {
    length: boolean;
    lower: boolean;
    upper: boolean;
    number: boolean;
    symbol: boolean;
  };
}

export const getPasswordStrength = (password: string): PasswordStrength => {
  const checks = {
    length: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  if (score <= 1) return { score, label: "Very Weak", checks };
  if (score === 2) return { score, label: "Weak", checks };
  if (score === 3) return { score, label: "Fair", checks };
  if (score === 4) return { score, label: "Good", checks };
  return { score, label: "Strong", checks };
};
