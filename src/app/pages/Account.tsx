import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
  changePassword,
  deleteMyAccount,
  getAuthSession,
  getMe,
  getPreferredCurrency,
  logout,
  setPreferredCurrency,
  updateMyProfile,
} from "../services/api";
import { SUPPORTED_PAYMENT_CURRENCIES } from "../constants/currencies";
import { getPasswordStrength } from "../utils/passwordStrength";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";

export function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    acceptedMarketing: false,
    acceptedNewsletter: false,
    currency: "NGN",
  });
  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      navigate("/auth/login?redirect=/account");
      return;
    }

    const loadAccount = async () => {
      setLoading(true);
      try {
        const me = await getMe();
        setFormData({
          name: me.name || "",
          email: me.email || "",
          phone: me.phone || "",
          acceptedMarketing: Boolean(me.acceptedMarketing),
          acceptedNewsletter: Boolean(me.acceptedNewsletter),
          currency: getPreferredCurrency(),
        });
      } catch (error) {
        setErrorMessage(getDisplayErrorMessage(error, "Unable to load account settings."));
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [navigate]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (formData.phone && formData.phone.length < 10) {
      setErrorMessage("Phone number must be at least 10 digits.");
      return;
    }

    setSaving(true);

    try {
      await updateMyProfile({
        name: formData.name.trim(),
        phone: formData.phone?.trim() || "",
        acceptedMarketing: formData.acceptedMarketing,
        acceptedNewsletter: formData.acceptedNewsletter,
      });
      setPreferredCurrency(formData.currency);
      setSuccessMessage("Account settings updated.");
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to save settings."));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    // Validation
    if (!passwordForm.currentPassword) {
      setPasswordError("Current password is required.");
      return;
    }
    if (!passwordForm.newPassword) {
      setPasswordError("New password is required.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(passwordForm.newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(passwordForm.newPassword)) {
      setPasswordError("Password must contain at least one number.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess(response.message);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await logout();
      navigate("/auth/login");
    } catch (error) {
      setPasswordError(getDisplayErrorMessage(error, "Unable to change password."));
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const proceed = confirm("This will permanently delete your account. Continue?");
    if (!proceed) return;

    setDeleting(true);
    setErrorMessage("");
    try {
      await deleteMyAccount();
      navigate("/auth/signup");
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to delete account."));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="opacity-70">Loading account settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">My Account</h1>
        <p className="opacity-70 mb-8">
          Manage your profile, communication preferences, and checkout currency.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="border border-border rounded-lg p-4 sticky top-20">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                Account Menu
              </h3>
              <nav className="space-y-2">
                <Link
                  to="/account"
                  className="block px-3 py-2 rounded text-sm hover:bg-emerald-50 text-emerald-700 font-medium transition"
                >
                  Settings
                </Link>
                <Link
                  to="/order-history"
                  className="block px-3 py-2 rounded text-sm hover:bg-muted text-muted-foreground transition"
                >
                  Order History
                </Link>
                <Link
                  to="/refund-tracking"
                  className="block px-3 py-2 rounded text-sm hover:bg-muted text-muted-foreground transition"
                >
                  Refunds
                </Link>
                <Link
                  to="/address-management"
                  className="block px-3 py-2 rounded text-sm hover:bg-muted text-muted-foreground transition"
                >
                  Addresses
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded text-sm hover:bg-red-50 text-red-700 transition"
                >
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
        <form onSubmit={handleSave} className="space-y-6 border border-border rounded-lg p-6">
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={formData.email} readOnly />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
              placeholder="+234..."
            />
          </div>

          <Separator />

          <div>
            <Label>Payment Currency</Label>
            <select
              value={formData.currency}
              onChange={(event) => setFormData({ ...formData, currency: event.target.value })}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg"
            >
              {SUPPORTED_PAYMENT_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            <p className="text-xs opacity-70 mt-2">Default is NGN. Prices will follow backend conversion rules.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.acceptedMarketing}
                onChange={(event) => setFormData({ ...formData, acceptedMarketing: event.target.checked })}
              />
              Receive marketing updates
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.acceptedNewsletter}
                onChange={(event) => setFormData({ ...formData, acceptedNewsletter: event.target.checked })}
              />
              Receive newsletter emails
            </label>
          </div>

          {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
          {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
            <Link to="/shop">
              <Button type="button" variant="outline">Continue Shopping</Button>
            </Link>
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </form>

        <form onSubmit={handlePasswordChange} className="space-y-4 border border-border rounded-lg p-6 mt-6">
          <h2 className="text-2xl font-semibold">Change Password</h2>
          <div>
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                onClick={() => setShowPasswords((current) => ({ ...current, current: !current.current }))}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPasswords.next ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
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
            {passwordForm.newPassword.length > 0 && (
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
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
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
          {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
          {passwordSuccess && <p className="text-sm text-green-700">{passwordSuccess}</p>}
          <Button type="submit" disabled={passwordSaving}>
            {passwordSaving ? "Updating..." : "Change Password"}
          </Button>
        </form>

        <div className="border border-red-200 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Danger Zone</h2>
          <p className="text-sm opacity-80 mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>
          <Button type="button" variant="outline" onClick={handleDeleteAccount} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete My Account"}
          </Button>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
