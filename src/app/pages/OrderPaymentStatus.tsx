import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { getAuthSession, getOrderById, verifyOrderPayment } from "../services/api";
import { formatMoney } from "../utils/formatMoney";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";

type ViewState = "loading" | "success" | "pending" | "error";

export function OrderPaymentStatus() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [orderMeta, setOrderMeta] = useState<{ orderNumber: string; totalAmount: number; currency: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const transactionId = useMemo(
    () => searchParams.get("transaction_id") || searchParams.get("transactionId") || "",
    [searchParams],
  );
  const txRef = useMemo(() => searchParams.get("tx_ref") || searchParams.get("txRef") || "", [searchParams]);

  useEffect(() => {
    const orderId = String(id || "").trim();
    if (!orderId) {
      setViewState("error");
      setMessage("Order identifier is missing.");
      return;
    }

    if (!getAuthSession()) {
      setViewState("error");
      setMessage("Please log in to complete payment verification for this order.");
      return;
    }

    const loadOrderMeta = async () => {
      const order = await getOrderById(orderId);
      setOrderMeta({
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount || 0),
        currency: order.currency || "NGN",
      });
      if (order.paymentStatus === "paid") {
        setViewState("success");
        setMessage("Payment was already confirmed.");
        return true;
      }
      return false;
    };

    const run = async () => {
      try {
        if (!transactionId && !txRef) {
          const alreadyPaid = await loadOrderMeta();
          if (!alreadyPaid) {
            setViewState("pending");
            setMessage("Complete payment in the popup, then return here to refresh the status.");
          }
          return;
        }

        const verifyResult = await verifyOrderPayment(orderId, {
          transactionId: transactionId || undefined,
          reference: txRef || undefined,
        });

        const order = verifyResult.order;
        setOrderMeta({
          orderNumber: order.orderNumber,
          totalAmount: Number(order.totalAmount || 0),
          currency: order.currency || "NGN",
        });

        if (order.paymentStatus === "paid") {
          setViewState("success");
          setMessage("Payment confirmed successfully.");
          return;
        }

        setViewState("pending");
        setMessage("Payment is still pending. Please wait a moment and refresh.");
      } catch (error) {
        try {
          await loadOrderMeta();
          if (transactionId || txRef) {
            setViewState("pending");
            setMessage("Payment is still pending. Please wait a moment and refresh.");
            return;
          }
        } catch {
          // Fall through to generic error below.
        }

        setViewState("error");
        setMessage(getDisplayErrorMessage(error, "Unable to verify payment right now."));
      }
    };

    void run();
  }, [id, transactionId, txRef]);

  const handleRefresh = async () => {
    const orderId = String(id || "").trim();
    if (!orderId) return;
    setIsRefreshing(true);
    try {
      const order = await getOrderById(orderId);
      setOrderMeta({
        orderNumber: order.orderNumber,
        totalAmount: Number(order.totalAmount || 0),
        currency: order.currency || "NGN",
      });
      if (order.paymentStatus === "paid") {
        setViewState("success");
        setMessage("Payment confirmed successfully.");
      } else {
        setViewState("pending");
        setMessage("Payment is still pending. Please wait a moment and refresh.");
      }
    } catch (error) {
      setViewState("error");
      setMessage(getDisplayErrorMessage(error, "Unable to verify payment right now."));
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold mb-4">Order Payment Status</h1>
        <p
          className={
            viewState === "success"
              ? "text-green-700"
              : viewState === "error"
                ? "text-red-600"
                : "opacity-80"
          }
        >
          {message}
        </p>

        {orderMeta ? (
          <div className="mt-6 p-4 border border-border rounded-lg text-sm space-y-1">
            <p>
              Order: <strong>{orderMeta.orderNumber}</strong>
            </p>
            <p>
              Amount: <strong>{formatMoney(orderMeta.totalAmount, orderMeta.currency)}</strong>
            </p>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          {viewState !== "success" && (
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? "Refreshing..." : "Refresh Status"}
            </Button>
          )}
          <Link to="/account">
            <Button>Go to Account</Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
