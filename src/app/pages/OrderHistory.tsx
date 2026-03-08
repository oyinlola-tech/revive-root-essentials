import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getOrders } from "../services/api";
import type { Order } from "../types/order";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";

export const OrderHistory = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const result = await getOrders();
        setOrders(result as Order[]);
        setError(null);
      } catch (err) {
        setError(getDisplayErrorMessage(err, "Unable to load your orders right now."));
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "text-yellow-600",
      paid: "text-green-600",
      failed: "text-red-600",
      refunded: "text-blue-600",
    };
    return colors[status] || "text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No orders yet</p>
            <button
              onClick={() => navigate("/shop")}
              className="inline-block bg-primary text-white px-6 py-2 rounded hover:opacity-90"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {order.currency} {order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {order.items?.length || 1} item(s)
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="text-primary hover:underline font-medium"
                        >
                          View Details
                        </button>
                        {order.status !== 'delivered' && order.paymentStatus === 'paid' && (
                          <button
                            onClick={() => navigate(`/refund-request?orderId=${order.id}`)}
                            className="text-orange-600 hover:underline font-medium"
                          >
                            Request Refund
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
