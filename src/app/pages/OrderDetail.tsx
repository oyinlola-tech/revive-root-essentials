import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getOrder } from "../services/api";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const result = await getOrder(id);
        setOrder(result);
        setError(null);
      } catch (err) {
        setError(getDisplayErrorMessage(err, "Failed to load order"));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Order not found"}
          </div>
          <button
            onClick={() => navigate("/order-history")}
            className="mt-4 text-primary hover:underline"
          >
            Back to Order History
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/order-history")}
          className="mb-6 text-primary hover:underline"
        >
          ← Back to Order History
        </button>

        <div className="bg-white rounded-lg shadow">
          {/* Order Header */}
          <div className="border-b p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-gray-600 mt-2">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-gray-900">
                  {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="border-b p-6 grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Order Status</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Payment Status</h3>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : order.paymentStatus === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-gray-900">
                      {order.currency} {parseFloat(item.price).toFixed(2)} each
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No items in this order</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="border-b p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-700 whitespace-pre-line">
                {order.shippingAddress}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 flex gap-4">
            {order.status !== "delivered" && order.paymentStatus === "paid" && (
              <button
                onClick={() => navigate(`/refund-request?orderId=${order.id}`)}
                className="flex-1 border border-orange-600 text-orange-600 px-4 py-2 rounded hover:bg-orange-50"
              >
                Request Refund
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
