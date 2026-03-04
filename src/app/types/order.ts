export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  items?: Array<{ productId?: string; quantity: number; name?: string }>;
}
