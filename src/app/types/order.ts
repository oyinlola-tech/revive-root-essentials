export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentLink?: string | null;
  paymentMethod?: string | null;
  shippingAddress?: string | {
    country?: string;
    state?: string;
    city?: string;
    line1?: string;
    line2?: string;
    postalCode?: string;
    note?: string;
  };
  createdAt: string;
  items?: Array<{ productId?: string; quantity: number; name?: string; price?: number }>;
}
