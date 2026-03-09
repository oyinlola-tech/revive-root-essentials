import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  createAdminShippingFee,
  deleteAdminShippingFee,
  getAdminShippingFees,
  getAuthSession,
  type ShippingFeeRule,
  updateAdminShippingFee,
} from "../../services/api";
import { SUPPORTED_COUNTRIES, STATES_BY_COUNTRY } from "../../constants/countries";
import { getDisplayErrorMessage } from "../../utils/uiErrorMessages";

const initialForm = {
  id: "",
  country: "Nigeria",
  state: "",
  city: "",
  fee: "",
  isActive: true,
};

export default function AdminShippingFees() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rules, setRules] = useState<ShippingFeeRule[]>([]);
  const [form, setForm] = useState(initialForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const editing = Boolean(form.id);
  const isNigeria = form.country === "Nigeria";
  const isInternationalFallback = form.country === "__international__";
  const stateOptions = isNigeria ? (STATES_BY_COUNTRY.Nigeria || []) : [];

  const loadRules = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await getAdminShippingFees();
      setRules(data);
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to load shipping fee rules."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      navigate("/auth/login");
      return;
    }
    if (!["admin", "superadmin"].includes(session.user.role)) {
      navigate("/");
      return;
    }
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRules = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rules;
    return rules.filter((item) =>
      String(item.country || "").toLowerCase().includes(query)
      || String(item.state || "").toLowerCase().includes(query)
      || String(item.city || "").toLowerCase().includes(query)
      || String(item.fee || "").toLowerCase().includes(query),
    );
  }, [rules, searchTerm]);

  const resetForm = () => {
    setForm(initialForm);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    const normalizedCountry = form.country.trim();
    const normalizedState = form.state.trim();
    const normalizedCity = form.city.trim();
    const parsedFee = Number(form.fee);

    if (!normalizedCountry) {
      setErrorMessage("Country is required.");
      setSaving(false);
      return;
    }
    if (Number.isNaN(parsedFee) || parsedFee < 0) {
      setErrorMessage("Fee must be 0 or greater.");
      setSaving(false);
      return;
    }

    const payload = {
      country: normalizedCountry,
      state: isNigeria ? (normalizedState || undefined) : undefined,
      city: normalizedCity || undefined,
      fee: parsedFee,
      currency: "NGN",
      isActive: form.isActive,
    };

    try {
      if (editing) {
        await updateAdminShippingFee(form.id, payload);
        setStatusMessage("Shipping fee rule updated.");
      } else {
        await createAdminShippingFee(payload);
        setStatusMessage("Shipping fee rule created.");
      }
      resetForm();
      await loadRules();
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to save shipping fee rule."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (rule: ShippingFeeRule) => {
    setForm({
      id: rule.id,
      country: (rule.country || "Nigeria").toLowerCase() === "__international__" ? "__international__" : (rule.country || "Nigeria"),
      state: rule.state || "",
      city: rule.city || "",
      fee: String(rule.fee || 0),
      isActive: Boolean(rule.isActive),
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this shipping fee rule?")) return;
    setStatusMessage("");
    setErrorMessage("");
    try {
      await deleteAdminShippingFee(id);
      setStatusMessage("Shipping fee rule deleted.");
      await loadRules();
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to delete shipping fee rule."));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-emerald-600" />
            <p className="text-foreground font-medium">Loading shipping rules...</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch your configuration.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Shipping Fees</h1>
            </div>
            <Button variant="outline" size="sm" onClick={loadRules}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          {statusMessage && <p className="text-sm text-green-700 mt-3">{statusMessage}</p>}
          {errorMessage && <p className="text-sm text-red-600 mt-3">{errorMessage}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{editing ? "Edit Fee Rule" : "Create Fee Rule"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Country</Label>
                <select
                  value={form.country}
                  onChange={(event) => setForm({ ...form, country: event.target.value, state: "", city: "" })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="__international__">International (fallback for other countries)</option>
                  {SUPPORTED_COUNTRIES.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>State</Label>
                {isNigeria && stateOptions.length > 0 ? (
                  <select
                    value={form.state}
                    onChange={(event) => setForm({ ...form, state: event.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                  >
                    <option value="">Any state</option>
                    {stateOptions.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    value={form.state}
                    onChange={(event) => setForm({ ...form, state: event.target.value })}
                    placeholder={isInternationalFallback ? "Not used for international fallback" : "State is only used for Nigeria rules"}
                    disabled
                  />
                )}
              </div>

              <div>
                <Label>City (optional)</Label>
                <Input
                  value={form.city}
                  onChange={(event) => setForm({ ...form, city: event.target.value })}
                  placeholder="City (optional)"
                />
              </div>

              <div>
                <Label>Fee (NGN)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fee}
                  onChange={(event) => setForm({ ...form, fee: event.target.value })}
                  placeholder="e.g. 3500"
                  required
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  id="shipping-rule-active"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
                <Label htmlFor="shipping-rule-active">Rule is active</Label>
              </div>

              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update Rule" : "Create Rule"}
                </Button>
                {editing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Rules ({filteredRules.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by country, state, city or fee..."
            />
            <div className="space-y-3">
              {filteredRules.map((rule) => (
                <div key={rule.id} className="p-4 border border-border rounded-lg flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {(rule.country || "Any country").toLowerCase() === "__international__" ? "International fallback" : (rule.country || "Any country")} / {rule.state || "Any state"} / {rule.city || "Any city"}
                    </p>
                    <p className="text-sm opacity-70">
                      Fee: NGN {Number(rule.fee || 0).toLocaleString()} • {rule.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(rule)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(rule.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {filteredRules.length === 0 && (
                <div className="p-4 border border-border rounded-lg text-sm text-muted-foreground">
                  No shipping fee rules found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
