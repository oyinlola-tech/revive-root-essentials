import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { toast } from 'sonner';
import { SEO } from '../../components/SEO';
import { OAuthButton } from '../../components/auth/OAuthButton';
import {
  getGoogleIdToken,
  getAppleIdToken,
  isPopupBlockedError,
  redirectToGoogleOAuth,
  redirectToAppleOAuth,
} from '../../services/socialAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // API Call: POST /auth/login
      await login(email, password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const idToken = await getGoogleIdToken();
      await loginWithGoogle({ idToken });
      toast.success('Signed in with Google');
      navigate('/');
    } catch (error: any) {
      if (isPopupBlockedError(error)) {
        toast.message('Popup blocked. Redirecting to Google sign-in...');
        redirectToGoogleOAuth();
        return;
      }
      toast.error(error.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      const { idToken, name } = await getAppleIdToken();
      await loginWithApple({ idToken, name });
      toast.success('Signed in with Apple');
      navigate('/');
    } catch (error: any) {
      if (isPopupBlockedError(error)) {
        toast.message('Popup blocked. Redirecting to Apple sign-in...');
        await redirectToAppleOAuth();
        return;
      }
      toast.error(error.message || 'Apple login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f5f1ed] to-white px-4">
      <SEO
        title="Login"
        description="Sign in to your Revive Roots Essentials account to manage orders and saved products."
        canonicalPath="/login"
        noIndex
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your Revive Roots Essentials account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-muted-foreground hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <OAuthButton provider="google" type="button" onClick={handleGoogleLogin} disabled={isLoading} />
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary self-start"
                onClick={() => redirectToGoogleOAuth()}
                disabled={isLoading}
              >
                Use redirect sign-in with Google
              </button>
              <OAuthButton provider="apple" type="button" onClick={handleAppleLogin} disabled={isLoading} />
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-4 hover:text-primary self-start"
                onClick={() => void redirectToAppleOAuth()}
                disabled={isLoading}
              >
                Use redirect sign-in with Apple
              </button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/login/otp')}
                className="w-full"
              >
                Sign in with Email OTP
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
