import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useCommerce } from "../contexts/CommerceContext";
import { createOrder, getAuthSession, quoteShippingFee } from "../services/api";
import { formatMoney } from "../utils/formatMoney";
import { PRODUCT_FALLBACK_IMAGES, getProductImageByCategory } from "../utils/productImages";
import { getDisplayErrorMessage } from "../utils/uiErrorMessages";
import { SUPPORTED_COUNTRIES, STATES_BY_COUNTRY } from "../constants/countries";

const initialCheckout = {
  country: "Nigeria",
  state: "",
  city: "",
  line1: "",
  postalCode: "",
  paymentMethod: "card" as "card" | "ussd" | "transfer",
};

export function Cart() {
  const navigate = useNavigate();
  const { cartItems, subtotal, conversionBaseFee, updateCartQuantity, removeFromCart, clearCart } = useCommerce();
  const [checkout, setCheckout] = useState(initialCheckout);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [isShippingFeeLoading, setIsShippingFeeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const activeCurrency = cartItems[0]?.product.currency || "NGN";
  const stateOptions = checkout.country === "Nigeria" ? (STATES_BY_COUNTRY.Nigeria || []) : [];

  const total = useMemo(
    () => Number((subtotal + conversionBaseFee + shippingFee).toFixed(2)),
    [subtotal, conversionBaseFee, shippingFee],
  );

  useEffect(() => {
    let cancelled = false;

    const loadShippingQuote = async () => {
      const session = getAuthSession();
      if (!session || cartItems.length === 0) {
        setShippingFee(0);
        return;
      }

      if (!checkout.country.trim() || !checkout.state.trim() || !checkout.city.trim()) {
        setShippingFee(0);
        return;
      }

      setIsShippingFeeLoading(true);
      try {
        const quote = await quoteShippingFee({
          country: checkout.country.trim(),
          state: checkout.state.trim(),
          city: checkout.city.trim(),
          line1: checkout.line1.trim() || undefined,
          postalCode: checkout.postalCode.trim() || undefined,
        });
        if (!cancelled) {
          setShippingFee(Number(quote.fee || 0));
        }
      } catch {
        if (!cancelled) {
          setShippingFee(0);
        }
      } finally {
        if (!cancelled) {
          setIsShippingFeeLoading(false);
        }
      }
    };

    void loadShippingQuote();

    return () => {
      cancelled = true;
    };
  }, [cartItems.length, checkout.country, checkout.state, checkout.city, checkout.line1, checkout.postalCode]);

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    // Validate shipping address
    if (checkout.country === "Nigeria" && !checkout.state.trim()) {
      setErrorMessage("State is required for deliveries in Nigeria.");
      return;
    }
    if (!checkout.city.trim()) {
      setErrorMessage("City is required.");
      return;
    }
    if (!checkout.line1.trim()) {
      setErrorMessage("Street address is required.");
      return;
    }
    if (checkout.line1.trim().length < 5) {
      setErrorMessage("Please provide a valid street address.");
      return;
    }

    const session = getAuthSession();
    if (!session) {
      navigate("/auth/login");
      return;
    }

    setSubmitting(true);

    try {
      const response = await createOrder({
        items: cartItems.map((item) => ({
          productId: item.product.backendId || item.product.id,
          quantity: Math.max(1, item.quantity),
        })),
        shippingAddress: {
          country: checkout.country,
          state: checkout.country === "Nigeria" ? checkout.state.trim() : "",
          city: checkout.city.trim(),
          line1: checkout.line1.trim(),
          postalCode: checkout.postalCode?.trim() || undefined,
        },
        paymentMethod: checkout.paymentMethod,
        currency: activeCurrency,
      });

      clearCart();
      setCheckout(initialCheckout);
      setShippingFee(0);
      setIsCheckoutModalOpen(false);
      setSuccessMessage(`Order ${response.orderNumber} created successfully.`);

      const paymentUrl = response.paymentUrl;
      if (paymentUrl) {
        setTimeout(() => {
          window.location.href = paymentUrl;
        }, 1500);
      }
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to complete checkout."));
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">Your Bag Is Empty</h1>
          <p className="opacity-70 mb-8">Add products to your bag to start checkout.</p>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Link to="/shop" className="inline-flex items-center gap-2 mb-6 hover:opacity-70">
          <ArrowLeft className="h-4 w-4" />
          Continue Shopping
        </Link>

        <h1 className="text-4xl font-bold mb-8">Your Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.product.id} className="p-4 border border-border rounded-lg flex gap-4">
                <img
                  src={getProductImageByCategory(item.product)}
                  alt={item.product.name}
                  className="h-24 w-24 rounded object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = PRODUCT_FALLBACK_IMAGES[item.product.category];
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm opacity-70 mb-3">{formatMoney(item.product.price, item.product.currency)}</p>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="min-w-6 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="font-semibold">
                  {formatMoney(item.product.price * item.quantity, item.product.currency)}
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-6 h-fit">
            <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>{formatMoney(subtotal, activeCurrency)}</span>
              </div>
              {conversionBaseFee > 0 && (
                <div className="flex justify-between">
                  <span>Currency Base Fee (₦1000)</span>
                  <span>{formatMoney(conversionBaseFee, activeCurrency)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span>{isShippingFeeLoading ? "Calculating..." : formatMoney(shippingFee, activeCurrency)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Estimated Total</span>
                <span>{formatMoney(total, activeCurrency)}</span>
              </div>
            </div>

            <Dialog open={isCheckoutModalOpen} onOpenChange={setIsCheckoutModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Open Checkout</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Secure Checkout</DialogTitle>
                  <DialogDescription>
                    Confirm your address and payment method. We will redirect you to a secure payment page.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Country</Label>
                      <select
                        value={checkout.country}
                        onChange={(event) => setCheckout({
                          ...checkout,
                          country: event.target.value,
                          state: "",
                        })}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                        required
                      >
                        {SUPPORTED_COUNTRIES.map((country) => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>State/Province</Label>
                      {checkout.country === "Nigeria" ? (
                        <select
                          value={checkout.state}
                          onChange={(event) => setCheckout({ ...checkout, state: event.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                          required
                        >
                          <option value="">Select state</option>
                          {stateOptions.map((state) => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          value={checkout.state}
                          onChange={(event) => setCheckout({ ...checkout, state: event.target.value })}
                          placeholder="Not required outside Nigeria"
                          disabled
                        />
                      )}
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={checkout.city}
                        onChange={(event) => setCheckout({ ...checkout, city: event.target.value })}
                        placeholder="e.g. Lekki"
                        required
                      />
                    </div>
                    <div>
                      <Label>Postal Code (Optional)</Label>
                      <Input
                        value={checkout.postalCode}
                        onChange={(event) => setCheckout({ ...checkout, postalCode: event.target.value })}
                        placeholder="e.g. 100001"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Street Address</Label>
                    <Input
                      value={checkout.line1}
                      onChange={(event) => setCheckout({ ...checkout, line1: event.target.value })}
                      placeholder="e.g. 123 Main Street"
                      required
                    />
                  </div>

                  <fieldset className="space-y-3" aria-label="Choose payment method">
                    <legend className="text-sm font-medium">Payment Method</legend>
                    {[
                      { value: "card", label: "Card", helper: "Pay securely with Visa, MasterCard, Verve." },
                      { value: "ussd", label: "USSD", helper: "Dial a short code from your bank to confirm." },
                      { value: "transfer", label: "Bank Transfer", helper: "Instant bank transfer with auto verification." },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition hover:border-primary ${
                          checkout.paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={checkout.paymentMethod === method.value}
                          onChange={() => setCheckout({ ...checkout, paymentMethod: method.value as typeof checkout.paymentMethod })}
                          className="mt-1"
                          aria-describedby={`${method.value}-helper`}
                        />
                        <div>
                          <div className="font-semibold">{method.label}</div>
                          <p id={`${method.value}-helper`} className="text-sm text-muted-foreground">
                            {method.helper}
                          </p>
                        </div>
                      </label>
                    ))}
                  </fieldset>

                  <div className="rounded-lg border border-border p-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span>Items Subtotal</span>
                      <span>{formatMoney(subtotal, activeCurrency)}</span>
                    </div>
                    {conversionBaseFee > 0 && (
                      <div className="flex justify-between">
                        <span>Currency Base Fee (₦1000)</span>
                        <span>{formatMoney(conversionBaseFee, activeCurrency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {isShippingFeeLoading ? (
                          <span className="inline-flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Calculating
                          </span>
                        ) : formatMoney(shippingFee, activeCurrency)}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>{formatMoney(total, activeCurrency)}</span>
                    </div>
                  </div>

                  {errorMessage && (
                    <p className="text-sm text-red-600" role="alert" aria-live="assertive">
                      {errorMessage}
                    </p>
                  )}
                  {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}

                  <Button type="submit" className="w-full" disabled={submitting || isShippingFeeLoading}>
                    {submitting ? "Processing..." : `Pay ${formatMoney(total, activeCurrency)}`}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
