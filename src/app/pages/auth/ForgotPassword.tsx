import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { requestPasswordReset } from "../../services/api";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!email.trim()) {
      setErrorMessage("Email is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset(email.trim());
      setSuccessMessage(response.message);
      setTimeout(() => {
        navigate(`/auth/reset-password?email=${encodeURIComponent(email.trim())}`);
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to request password reset.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Forgot Password</h1>
        <p className="opacity-70">Enter your email and we will send you an OTP to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Reset OTP"}
        </Button>
      </form>

      <p className="text-center text-sm">
        Remember your password?{" "}
        <Link to="/auth/login" className="font-semibold hover:opacity-70">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
