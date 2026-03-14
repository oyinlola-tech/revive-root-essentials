import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getOrder } from "../services/api";
import type { Order } from "../types/order";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";

export const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatMoney = (value?: number, currency = "USD") =>
    new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
      const result = await getOrder(id);
      setOrder(result as Order);
        if (result?.orderNumber) {
          document.title = `Order #${result.orderNumber} | Revive Roots Essentials`;
        }
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
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
            role="alert"
            aria-live="assertive"
          >
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/order-history")}
          className="mb-6 text-primary hover:underline"
        >
          ← Back to Order History
        </button>

        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          {/* Order Header */}
          <div className="border-b p-6 bg-gradient-to-r from-emerald-50 via-white to-emerald-50">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Order #{order.orderNumber}
                </h1>
                <p className="text-muted-foreground mt-2">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Total</p>
                <p className="text-4xl font-bold text-foreground">
                  {formatMoney(order.totalAmount, order.currency)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Section */}
          <div className="border-b p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Order Status</h3>
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
              <h3 className="text-sm font-semibold text-muted-foreground mb-2">Payment Status</h3>
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
                {order.paymentStatus === "pending" && order.paymentLink && (
                  <button
                    onClick={() => window.location.assign(order.paymentLink)}
                    className="ml-2 text-sm font-semibold text-emerald-700 hover:underline"
                  >
                    Retry payment
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="border-b p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-background border border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Items</p>
              <p className="text-2xl font-semibold text-foreground">{order.items?.length || 0}</p>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Payment</p>
              <p className="text-lg font-medium text-foreground">{order.paymentMethod || "Not set"}</p>
            </div>
            <div className="p-4 rounded-xl bg-background border border-border">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Currency</p>
              <p className="text-lg font-medium text-foreground">{order.currency || "USD"}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-b p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center border-b pb-4">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      {formatMoney(Number(item.price || 0), order.currency)} each
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No items in this order</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="border-b p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Shipping Address</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-7">
                {order.shippingAddress}
              </div>
            </div>
          )}

          {/* Order notes / SEO-friendly description */}
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              Order summary for Revive Roots Essentials — status {order.status}, payment {order.paymentStatus}.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
