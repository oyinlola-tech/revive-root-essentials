import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { login, oauthAppleLogin, oauthGoogleLogin } from "../../services/api";

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"" | "google" | "apple">("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(formData) as any;

      // If admin/superadmin requires OTP
      if (response.requiresOtp && response.identifier) {
        navigate(`/auth/otp?identifier=${encodeURIComponent(response.identifier)}&admin=true&redirect=${encodeURIComponent(searchParams.get("redirect") || "/admin")}`);
        return;
      }

      // Regular user login successful
      const session = response;
      const redirect = searchParams.get("redirect");
      if (redirect && session.user.role === "user") {
        navigate(redirect);
        return;
      }
      if (session.user.role === "superadmin") {
        navigate("/super-admin");
        return;
      }
      if (session.user.role === "admin") {
        navigate("/admin");
        return;
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setError("");
    const tokenLabel = provider === "google" ? "Google ID token" : "Apple ID token";
    const idToken = window.prompt(`Paste your ${tokenLabel} to continue:`);
    if (!idToken) return;

    setSocialLoading(provider);
    try {
      const session = provider === "google"
        ? await oauthGoogleLogin({ idToken, acceptedTerms: true })
        : await oauthAppleLogin({ idToken, acceptedTerms: true });

      const redirect = searchParams.get("redirect");
      if (redirect && session.user.role === "user") {
        navigate(redirect);
        return;
      }
      if (session.user.role === "superadmin") {
        navigate("/super-admin");
        return;
      }
      if (session.user.role === "admin") {
        navigate("/admin");
        return;
      }
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in with social login.");
    } finally {
      setSocialLoading("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="opacity-70">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            placeholder="you@example.com"
            required
            className="bg-input-background"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            placeholder="••••••••"
            required
            className="bg-input-background"
          />
          <div className="mt-2 text-right">
            <Link to="/auth/forgot-password" className="text-sm font-medium hover:opacity-70">
              Forgot Password?
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-sm opacity-60">
          Or continue with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          className="gap-2"
          disabled={socialLoading !== ""}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {socialLoading === "google" ? "Connecting..." : "Google"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("apple")}
          className="gap-2"
          disabled={socialLoading !== ""}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {socialLoading === "apple" ? "Connecting..." : "Apple"}
        </Button>
      </div>

      <p className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/auth/signup" className="font-semibold hover:opacity-70">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
