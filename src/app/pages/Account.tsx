import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import {
  getAuthSession,
  getMe,
  getPreferredCurrency,
  logout,
  setPreferredCurrency,
  updateMyProfile,
} from "../services/api";
import { SUPPORTED_PAYMENT_CURRENCIES } from "../constants/currencies";

export function Account() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    acceptedMarketing: false,
    acceptedNewsletter: false,
    currency: "NGN",
  });

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
        setErrorMessage(error instanceof Error ? error.message : "Unable to load account settings.");
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, [navigate]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await updateMyProfile({
        name: formData.name,
        phone: formData.phone,
        acceptedMarketing: formData.acceptedMarketing,
        acceptedNewsletter: formData.acceptedNewsletter,
      });
      setPreferredCurrency(formData.currency);
      setSuccessMessage("Account settings updated.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
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
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-4xl font-bold mb-2">My Account</h1>
        <p className="opacity-70 mb-8">
          Manage your profile, communication preferences, and checkout currency.
        </p>

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
      </div>
    </div>
  );
}
