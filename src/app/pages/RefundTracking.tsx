import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import * as api from '../services/api';
import { AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { getDisplayErrorMessage } from '../utils/uiErrorMessages';

interface Refund {
  id: string;
  orderId: string;
  orderNumber?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAmount: number;
  approvedAmount?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  refunds: Refund[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function RefundTracking() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [expandedRefund, setExpandedRefund] = useState<string | null>(null);

  const limit = 10;

  useEffect(() => {
    loadRefunds();
  }, [currentPage, selectedStatus]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError(null);
      const offset = (currentPage - 1) * limit;
      const response = await api.getRefunds(limit, offset, selectedStatus || undefined);
      
      const refundsList = response.data || [];
      const total = response.pagination?.total || refundsList.length;

      setRefunds(refundsList);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load refunds'));
      console.error('Error loading refunds:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'approved':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusFilter = (status: string | null) => {
    setSelectedStatus(status);
    setCurrentPage(1);
  };

  if (loading && refunds.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading refunds...</p>
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
                  className="block px-3 py-2 rounded text-sm hover:bg-emerald-50 text-emerald-700 font-medium transition"
                >
                  Refunds
                </Link>
                <Link
                  to="/address-management"
                  className="block px-3 py-2 rounded text-sm hover:bg-muted text-muted-foreground transition"
                >
                  Addresses
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Refund Tracking</h1>
          <p className="text-muted-foreground">Track the status of your refund requests</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="bg-card rounded-lg border border-border shadow mb-6 p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Filter by Status</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusFilter(null)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedStatus === null
                  ? 'bg-emerald-600 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted'
              }`}
            >
              All
            </button>
            {['pending', 'approved', 'rejected', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                  selectedStatus === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted'
                }`}
              >
                {getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {/* Refunds List */}
        <div className="space-y-4">
          {refunds.length === 0 ? (
            <div className="bg-card rounded-lg border border-border shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No refunds found</p>
              <p className="text-muted-foreground mt-2">You haven't requested any refunds yet</p>
            </div>
          ) : (
            refunds.map((refund) => (
              <div
                key={refund.id}
                className={`bg-card rounded-lg border border-border shadow overflow-hidden border-l-4 transition cursor-pointer hover:shadow-lg ${
                  refund.status === 'pending'
                    ? 'border-l-yellow-500'
                    : refund.status === 'approved'
                    ? 'border-l-blue-500'
                    : refund.status === 'completed'
                    ? 'border-l-green-500'
                    : 'border-l-red-500'
                }`}
                onClick={() =>
                  setExpandedRefund(
                    expandedRefund === refund.id ? null : refund.id
                  )
                }
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {getStatusIcon(refund.status)}
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Order #{refund.orderNumber || refund.orderId.substring(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Requested on{' '}
                          {new Date(refund.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                        refund.status
                      )}`}
                    >
                      {getStatusText(refund.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Requested Amount</p>
                      <p className="text-xl font-semibold text-foreground">
                        ₦{(refund.requestedAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    {refund.approvedAmount && (
                      <div>
                        <p className="text-sm text-muted-foreground">Approved Amount</p>
                        <p className="text-xl font-semibold text-emerald-600">
                          ₦{refund.approvedAmount.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {expandedRefund === refund.id && (
                    <div className="border-t pt-4 mt-4">
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">Reason</p>
                        <p className="text-muted-foreground">{refund.reason}</p>
                      </div>

                      {refund.rejectionReason && (
                        <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
                          <p className="text-sm text-red-700 font-semibold">
                            Rejection Reason
                          </p>
                          <p className="text-red-600 mt-1">
                            {refund.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Refund ID:</strong> {refund.id.substring(0, 12)}...
                        </p>
                        <p>
                          <strong>Last Updated:</strong>{' '}
                          {new Date(refund.updatedAt).toLocaleString()}
                        </p>
                      </div>

                      {refund.status === 'pending' && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700">
                            Your refund request is being reviewed. We'll notify you
                            once it's processed.
                          </p>
                        </div>
                      )}

                      {refund.status === 'completed' && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700">
                            ✓ Your refund has been processed. The amount should
                            appear in your account within 3-5 business days.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              disabled={currentPage === 1}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
            >
              Next
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
