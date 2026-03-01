import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useCommerce } from "../contexts/CommerceContext";
import { createOrder, getAuthSession } from "../services/api";

const initialCheckout = {
  country: "",
  state: "",
  city: "",
  line1: "",
  postalCode: "",
  paymentMethod: "card" as "card" | "ussd" | "transfer",
};

export function Cart() {
  const navigate = useNavigate();
  const { cartItems, subtotal, updateCartQuantity, removeFromCart, clearCart } = useCommerce();
  const [checkout, setCheckout] = useState(initialCheckout);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const shipping = useMemo(() => (subtotal > 100 ? 0 : 10), [subtotal]);
  const tax = useMemo(() => subtotal * 0.02, [subtotal]);
  const total = subtotal + shipping + tax;

  const handleCheckout = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty.");
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
          quantity: item.quantity,
        })),
        shippingAddress: {
          country: checkout.country,
          state: checkout.state,
          city: checkout.city,
          line1: checkout.line1,
          postalCode: checkout.postalCode || undefined,
        },
        paymentMethod: checkout.paymentMethod,
      });

      clearCart();
      setCheckout(initialCheckout);
      setSuccessMessage(`Order ${response.orderNumber} created successfully.`);

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to complete checkout.");
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
                  src={item.product.image}
                  alt={item.product.name}
                  className="h-24 w-24 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product.name}</h3>
                  <p className="text-sm opacity-70 mb-3">${item.product.price.toFixed(2)}</p>
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
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border border-border rounded-lg p-6 h-fit">
            <h2 className="text-2xl font-semibold mb-4">Checkout</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <Label>Country</Label>
                <Input
                  value={checkout.country}
                  onChange={(event) => setCheckout({ ...checkout, country: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>State</Label>
                <Input
                  value={checkout.state}
                  onChange={(event) => setCheckout({ ...checkout, state: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>City</Label>
                <Input
                  value={checkout.city}
                  onChange={(event) => setCheckout({ ...checkout, city: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Address Line</Label>
                <Input
                  value={checkout.line1}
                  onChange={(event) => setCheckout({ ...checkout, line1: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Postal Code</Label>
                <Input
                  value={checkout.postalCode}
                  onChange={(event) => setCheckout({ ...checkout, postalCode: event.target.value })}
                />
              </div>
              <div>
                <Label>Payment Method</Label>
                <select
                  value={checkout.paymentMethod}
                  onChange={(event) =>
                    setCheckout({
                      ...checkout,
                      paymentMethod: event.target.value as "card" | "ussd" | "transfer",
                    })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                >
                  <option value="card">Card</option>
                  <option value="ussd">USSD</option>
                  <option value="transfer">Bank Transfer</option>
                </select>
              </div>
              {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
              {successMessage && <p className="text-sm text-green-700">{successMessage}</p>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Processing..." : `Pay $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
