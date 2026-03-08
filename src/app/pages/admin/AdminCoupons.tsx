import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as api from '../../services/api';
import { Search, AlertCircle, Plus, Edit2, Trash2, Copy, Eye } from 'lucide-react';
import { getDisplayErrorMessage } from '../../utils/uiErrorMessages';

type AdminCoupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  timesUsed: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
};

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses: number;
  timesUsed: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

export default function AdminCoupons() {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedCoupon, setExpandedCoupon] = useState<string | null>(null);

  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as const,
    discountValue: 0,
    maxUses: 0,
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    expiresAt: '',
    isActive: true,
    description: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    const filtered = coupons.filter((coupon) => {
      const matchesSearch = coupon.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesActive =
        activeFilter === null ||
        (activeFilter === 'active' ? coupon.isActive : !coupon.isActive);
      return matchesSearch && matchesActive;
    });
    setFilteredCoupons(filtered);
    setCurrentPage(1);
  }, [searchTerm, activeFilter, coupons]);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.adminGetCoupons();
      const couponsList = response.data || [];
      setCoupons(couponsList as AdminCoupon[]);
      setFilteredCoupons(couponsList as AdminCoupon[]);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load coupons'));
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discountType: coupon.discountType as any,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses,
        minOrderAmount: coupon.minOrderAmount || 0,
        maxDiscountAmount: coupon.maxDiscountAmount || 0,
        expiresAt: coupon.expiresAt || '',
        isActive: coupon.isActive,
        description: coupon.description || '',
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: 0,
        maxUses: 0,
        minOrderAmount: 0,
        maxDiscountAmount: 0,
        expiresAt: '',
        isActive: true,
        description: '',
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.discountValue <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (editingCoupon) {
        await api.adminUpdateCoupon(editingCoupon.id, formData);
      } else {
        await api.adminCreateCoupon(formData);
      }

      handleCloseForm();
      await loadCoupons();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to save coupon'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      setError(null);
      await api.adminDeleteCoupon(couponId);
      await loadCoupons();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to delete coupon'));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Copied: ${code}`);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-50 text-green-700'
      : 'bg-muted text-muted-foreground';
  };

  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

  if (loading && coupons.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
            <p className="text-muted-foreground mt-2">Create and manage discount coupons</p>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
          >
            <Plus className="w-5 h-5" />
            New Coupon
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Coupon code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={activeFilter || ''}
                onChange={(e) => setActiveFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadCoupons}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 rounded-lg transition font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {filteredCoupons.length === 0 ? (
            <div className="bg-card rounded-lg border border-border shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No coupons found</p>
            </div>
          ) : (
            <>
              {paginatedCoupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="bg-card rounded-lg border border-border shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-muted"
                    onClick={() =>
                      setExpandedCoupon(
                        expandedCoupon === coupon.id ? null : coupon.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-mono font-bold text-lg text-foreground">
                            {coupon.code}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyCode(coupon.code);
                            }}
                            className="text-muted-foreground hover:text-emerald-600 transition"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {coupon.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {coupon.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% off`
                              : `₦${coupon.discountValue.toLocaleString()} off`}
                          </span>
                          <span>•</span>
                          <span>
                            {coupon.timesUsed}/{coupon.maxUses} uses
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            coupon.isActive
                          )}`}
                        >
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {coupon.expiresAt && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Expires:{' '}
                            {new Date(coupon.expiresAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedCoupon === coupon.id && (
                    <div className="border-t px-6 py-4 bg-muted">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Discount Type</p>
                          <p className="text-lg font-semibold text-foreground capitalize">
                            {coupon.discountType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Discount Value</p>
                          <p className="text-lg font-semibold text-foreground">
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}%`
                              : `₦${coupon.discountValue.toLocaleString()}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Min Order</p>
                          <p className="text-lg font-semibold text-foreground">
                            ₦{(coupon.minOrderAmount || 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Max Discount</p>
                          <p className="text-lg font-semibold text-foreground">
                            {coupon.maxDiscountAmount
                              ? `₦${coupon.maxDiscountAmount.toLocaleString()}`
                              : 'Unlimited'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-foreground mb-3">
                          Actions
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleOpenForm(coupon)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Coupon Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., SUMMER20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value as any,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountValue: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="e.g., 20"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUses: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0 for unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Min Order Amount
                    </label>
                    <input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderAmount: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0 for no minimum"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Max Discount Amount
                    </label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountAmount: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0 for unlimited"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expiresAt: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'active' : 'inactive'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.value === 'active',
                        })
                      }
                      className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Summer sale discount"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : 'Save Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
