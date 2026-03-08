import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { COUNTRIES_BY_REGION, STATES_BY_COUNTRY, DEFAULT_STATES } from '../constants/countries';
import { getDisplayErrorMessage } from '../utils/uiErrorMessages';

interface Address {
  id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
  createdAt: string;
}

export default function AddressManagement() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulate loading from API - in production, use api.getAddresses()
      const stored = localStorage.getItem('user_addresses');
      if (stored) {
        setAddresses(JSON.parse(stored));
      } else {
        setAddresses([]);
      }
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load addresses'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);

      // Validation
      if (!formData.line1.trim() || !formData.city.trim() || !formData.state.trim()) {
        setError('Please fill in all required fields');
        return;
      }

      let updatedAddresses: Address[];

      if (editingId) {
        // Update existing address
        updatedAddresses = addresses.map((addr) =>
          addr.id === editingId
            ? { ...addr, ...formData, updatedAt: new Date().toISOString() }
            : addr
        );
        setEditingId(null);
      } else {
        // Add new address
        const newAddress: Address = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          isDefault: addresses.length === 0,
        };
        updatedAddresses = [...addresses, newAddress];
      }

      setAddresses(updatedAddresses);
      localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses));

      // Reset form
      setFormData({
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Nigeria',
      });
      setIsFormOpen(false);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to save address'));
    }
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      label: address.label || '',
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode || '',
      country: address.country,
    });
    setEditingId(address.id);
    setIsFormOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const updatedAddresses = addresses.filter((addr) => addr.id !== id);
        setAddresses(updatedAddresses);
        localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses));
      } catch (err) {
        setError(getDisplayErrorMessage(err, 'Failed to delete address'));
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const updatedAddresses = addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }));
      setAddresses(updatedAddresses);
      localStorage.setItem('user_addresses', JSON.stringify(updatedAddresses));
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to update default address'));
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
    });
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="md:col-span-1">
            <div className="border border-border rounded-lg p-4 sticky top-20 bg-card">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wide">
                Account Menu
              </h3>
              <nav className="space-y-2">
                <Link
                  to="/account"
                  className="block px-3 py-2 rounded text-sm hover:bg-muted text-muted-foreground transition"
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
                  className="block px-3 py-2 rounded text-sm hover:bg-emerald-50 text-emerald-700 font-medium transition"
                >
                  Addresses
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Addresses</h1>
            <p className="text-muted-foreground mt-2">Manage your shipping and billing addresses</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Address
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="bg-card rounded-lg border border-border shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Address Label (e.g., Home, Work)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Home"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) =>
                    setFormData({ ...formData, line1: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Apartment, Suite, etc. (optional)
                </label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) =>
                    setFormData({ ...formData, line2: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Apt 4B"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Lagos"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Lagos State"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="100001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition"
                >
                  {editingId ? 'Update Address' : 'Add Address'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-muted hover:bg-accent text-muted-foreground py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Addresses List */}
        <div className="space-y-4">
          {addresses.length === 0 ? (
            <div className="bg-card rounded-lg border border-border shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No addresses saved</p>
              <p className="text-muted-foreground mt-2">Add an address to get started</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div
                key={address.id}
                className="bg-card rounded-lg border border-border shadow p-6 border-l-4 border-emerald-600"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {address.label || 'Unnamed Address'}
                      </h3>
                      {address.isDefault && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="p-2 hover:bg-muted rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="p-2 hover:bg-muted rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-muted-foreground">{address.line1}</p>
                  {address.line2 && <p className="text-muted-foreground">{address.line2}</p>}
                  <p className="text-muted-foreground">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p className="text-muted-foreground">{address.country}</p>
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            ))
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
