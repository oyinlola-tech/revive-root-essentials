import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as api from '../../services/api';
import { Search, AlertCircle, Download, MoreVertical } from 'lucide-react';
import { getDisplayErrorMessage } from '../../utils/uiErrorMessages';

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  customerName?: string;
  customerEmail?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.adminGetOrders();
      const ordersList = (response.data || []).map(o => ({
        ...o,
        totalAmount: typeof o.totalAmount === 'string' ? parseFloat(o.totalAmount) : o.totalAmount,
        customerName: o.User?.name || o.customerName,
        customerEmail: o.User?.email || o.customerEmail,
        items: (o.OrderItems || o.items || []).map((item: any) => ({
          name: item.Product?.name || item.name || 'Product',
          quantity: Number(item.quantity || 0),
          price: Number(item.price || 0),
        })),
      }));
      setOrders(ordersList);
      setFilteredOrders(ordersList);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load orders'));
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingStatus(orderId);
      setError(null);
      await api.adminUpdateOrderStatus(orderId, newStatus as any);
      await loadOrders();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to update order status'));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700';
      case 'paid':
        return 'bg-green-50 text-green-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      case 'refunded':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">Manage customer orders and track shipments</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Order #, Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={paymentFilter || ''}
                onChange={(e) => setPaymentFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadOrders}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No orders found</p>
            </div>
          ) : (
            <>
              {paginatedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}{' '}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                        {order.customerEmail && (
                          <p className="text-sm text-gray-600 mt-1">
                            {order.customerEmail}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {order.currency} {order.totalAmount.toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-2 justify-end">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus === 'paid' ? '✓ Paid' : order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t px-6 py-4 bg-gray-50">
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Order Items
                        </h4>
                        {order.items && order.items.length > 0 ? (
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-sm py-2 border-b border-gray-200"
                              >
                                <div>
                                  <p className="text-gray-900 font-medium">
                                    {item.name}
                                  </p>
                                  <p className="text-gray-500">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="text-gray-900 font-medium">
                                  ₦{(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No items</p>
                        )}
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Update Status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {['pending', 'processing', 'shipped', 'delivered'].map(
                            (status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(order.id, status)}
                                disabled={updatingStatus === order.id}
                                className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
                                  order.status === status
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {status}
                              </button>
                            )
                          )}
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
                    onClick={() =>
                      setCurrentPage((p) => Math.max(1, p - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
