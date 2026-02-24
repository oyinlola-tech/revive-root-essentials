import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { SEO } from '../../components/SEO';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
    acceptedMarketing: false,
    acceptedNewsletter: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.acceptedTerms) {
      toast.error('You must accept the Terms and Conditions to continue');
      return;
    }

    setIsLoading(true);

    try {
      // API Call: POST /auth/register
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        acceptedTerms: formData.acceptedTerms,
        acceptedMarketing: formData.acceptedMarketing,
        acceptedNewsletter: formData.acceptedNewsletter,
      });

      localStorage.setItem('pendingVerification', formData.email);
      localStorage.setItem('pendingVerificationType', 'email');
      toast.success(response?.message || 'Registration successful!');
      navigate('/register/verify-otp');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f1ed] to-white px-4 py-8">
      <SEO
        title="Create Account"
        description="Create your Revive Roots Essentials account for faster checkout and order tracking."
        canonicalPath="/register"
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Revive Roots Essentials today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={formData.acceptedTerms}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                <span>
                  I have read and accept the{' '}
                  <Link to="/terms-and-conditions" className="underline underline-offset-4 hover:text-primary" target="_blank" rel="noreferrer">
                    Terms and Conditions
                  </Link>{' '}
                  and understand how my data is processed.
                </span>
              </label>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="acceptedMarketing"
                  checked={formData.acceptedMarketing}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span>I want to receive marketing offers and promotional updates by email.</span>
              </label>

              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="acceptedNewsletter"
                  checked={formData.acceptedNewsletter}
                  onChange={handleChange}
                  className="mt-1"
                />
                <span>
                  I want to receive the weekly newsletter featuring newly launched products. You can unsubscribe any time.
                </span>
              </label>

              <p className="text-xs text-muted-foreground">
                Need more details before consenting? Read the{' '}
                <Link to="/faq" className="underline underline-offset-4 hover:text-primary" target="_blank" rel="noreferrer">
                  FAQ
                </Link>.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="underline underline-offset-4 hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
