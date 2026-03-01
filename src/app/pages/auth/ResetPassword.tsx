import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { confirmPasswordReset } from "../../services/api";
import { getPasswordStrength } from "../../utils/passwordStrength";

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    next: false,
    confirm: false,
  });
  const passwordStrength = getPasswordStrength(formData.newPassword);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await confirmPasswordReset({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      setSuccessMessage(response.message);
      setTimeout(() => navigate("/auth/login"), 1200);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
        <p className="opacity-70">Enter the OTP sent to your email and your new password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            required
          />
        </div>
        <div>
          <Label>OTP</Label>
          <Input
            inputMode="numeric"
            value={formData.otp}
            onChange={(event) => setFormData({ ...formData, otp: event.target.value })}
            placeholder="6-digit OTP"
            required
          />
        </div>
        <div>
          <Label>New Password</Label>
          <div className="relative">
            <Input
              type={showPasswords.next ? "text" : "password"}
              value={formData.newPassword}
              onChange={(event) => setFormData({ ...formData, newPassword: event.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPasswords((current) => ({ ...current, next: !current.next }))}
            >
              {showPasswords.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formData.newPassword.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <p className="text-xs opacity-70">Strength: {passwordStrength.label}</p>
            </div>
          )}
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              onClick={() => setShowPasswords((current) => ({ ...current, confirm: !current.confirm }))}
            >
              {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>

      <p className="text-center text-sm">
        Back to{" "}
        <Link to="/auth/login" className="font-semibold hover:opacity-70">
          Login
        </Link>
      </p>
    </div>
  );
}
