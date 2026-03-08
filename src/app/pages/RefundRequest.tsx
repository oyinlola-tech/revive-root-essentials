import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getOrderById, createRefund } from "../services/api";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";

export const RefundRequest = () => {
  const navigate = useNavigate();
  const orderId = new URLSearchParams(window.location.search).get("orderId");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    reason: "",
    requestedAmount: 0,
    description: "",
  });

  const refundReasons: Record<string, string> = {
    defective_product: "Defective Product",
    not_as_described: "Not As Described",
    wrong_item_received: "Wrong Item Received",
    changed_mind: "Changed Mind",
    duplicate_order: "Duplicate Order",
    other: "Other",
  };

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError("No order ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getOrderById(orderId);
        setOrder(result);
        setFormData((prev) => ({
          ...prev,
          requestedAmount: typeof result.totalAmount === 'string' 
            ? parseFloat(result.totalAmount) 
            : result.totalAmount,
        }));
        setError(null);
      } catch (err) {
        setError(getDisplayErrorMessage(err, "Failed to load order"));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      setError("Please provide a reason for the refund");
      return;
    }

    if (formData.reason === "other" && formData.description.trim().length < 10) {
      setError("Please provide at least 10 characters of detail for this refund request.");
      return;
    }

    if (formData.requestedAmount <= 0) {
      setError("Refund amount must be greater than 0");
      return;
    }

    if (!orderId) {
      setError("Order ID is missing");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const selectedReason = refundReasons[formData.reason] || formData.reason;
      const detailedReason = formData.description.trim()
        ? `${selectedReason}: ${formData.description.trim()}`
        : selectedReason;
      await createRefund({
        orderId,
        reason: detailedReason,
        requestedAmount: formData.requestedAmount,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/refund-tracking");
      }, 2000);
    } catch (err) {
      setError(getDisplayErrorMessage(err, "Failed to submit refund request"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
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
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/refund-tracking")}
          className="mb-6 text-primary hover:underline"
        >
          ← Back to Refund Tracking
        </button>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Refund</h1>
          <p className="text-gray-600 mb-8">
            Order #{order.orderNumber} • {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
          </p>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              Refund request submitted successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund *
              </label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select a reason</option>
                <option value="defective_product">Defective Product</option>
                <option value="not_as_described">Not As Described</option>
                <option value="wrong_item_received">Wrong Item Received</option>
                <option value="changed_mind">Changed Mind</option>
                <option value="duplicate_order">Duplicate Order</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Please provide more details about your refund request..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Refund Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Refund Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-600 font-medium">
                  {order.currency}
                </span>
                <input
                  type="number"
                  value={formData.requestedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      requestedAmount: Math.min(
                        parseFloat(e.target.value) || 0,
                        parseFloat(order.totalAmount)
                      ),
                    })
                  }
                  min="0"
                  max={parseFloat(order.totalAmount)}
                  step="0.01"
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Maximum refund amount: {order.currency} {parseFloat(order.totalAmount).toFixed(2)}
              </p>
            </div>

            {/* Order Items Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-2">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="text-gray-900 font-medium">
                        {order.currency} {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No items in this order</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 font-medium"
              >
                {submitting ? "Submitting..." : "Submit Refund Request"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/order-history")}
                className="flex-1 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RefundRequest;
