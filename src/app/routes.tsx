import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Shop } from "./pages/Shop";
import { ProductDetails } from "./pages/ProductDetails";
import { Contact } from "./pages/Contact";
import { Cart } from "./pages/Cart";
import { OrderPaymentStatus } from "./pages/OrderPaymentStatus";
import { Wishlist } from "./pages/Wishlist";
import { Account } from "./pages/Account";
import { NewsletterUnsubscribe } from "./pages/NewsletterUnsubscribe";
import { OrderHistory } from "./pages/OrderHistory";
import { OrderDetail } from "./pages/OrderDetail";
import { RefundRequest } from "./pages/RefundRequest";
import RefundTracking from "./pages/RefundTracking";
import AddressManagement from "./pages/AddressManagement";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { OTP } from "./pages/auth/OTP";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import { SuperAdminDashboard } from "./pages/admin/SuperAdminDashboard";
import { NotFound } from "./pages/NotFound";
import { RootLayout } from "./components/RootLayout";
import { AuthLayout } from "./components/AuthLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "shop", Component: Shop },
      { path: "shop/:id", Component: ProductDetails },
      { path: "cart", Component: Cart },
      { path: "orders/:id", Component: OrderPaymentStatus },
      { path: "wishlist", Component: Wishlist },
      { path: "account", Component: Account },
      { path: "contact", Component: Contact },
      { path: "newsletter/unsubscribe", Component: NewsletterUnsubscribe },
      // Customer Features
      { path: "order-history", Component: OrderHistory },
      { path: "order/:id", Component: OrderDetail },
      { path: "refund-request", Component: RefundRequest },
      { path: "refund-tracking", Component: RefundTracking },
      { path: "address-management", Component: AddressManagement },
    ],
  },
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "otp", Component: OTP },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
    ],
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/products",
    Component: AdminProducts,
  },
  {
    path: "/admin/orders",
    Component: AdminOrders,
  },
  {
    path: "/admin/users",
    Component: AdminUsers,
  },
  {
    path: "/admin/coupons",
    Component: AdminCoupons,
  },
  {
    path: "/admin/inventory",
    Component: AdminInventory,
  },
  {
    path: "/admin/audit-logs",
    Component: AdminAuditLogs,
  },
  {
    path: "/super-admin",
    Component: SuperAdminDashboard,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
