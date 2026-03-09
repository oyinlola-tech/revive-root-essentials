import { lazy, type ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { AuthLayout } from "./components/AuthLayout";

const lazyNamed = <T extends Record<string, ComponentType<any>>>(
  factory: () => Promise<T>,
  name: keyof T,
) =>
  lazy(async () => {
    const module = await factory();
    return { default: module[name] as ComponentType<any> };
  });

const Home = lazyNamed(() => import("./pages/Home"), "Home");
const About = lazyNamed(() => import("./pages/About"), "About");
const Shop = lazyNamed(() => import("./pages/Shop"), "Shop");
const ProductDetails = lazyNamed(() => import("./pages/ProductDetails"), "ProductDetails");
const Contact = lazyNamed(() => import("./pages/Contact"), "Contact");
const Cart = lazyNamed(() => import("./pages/Cart"), "Cart");
const OrderPaymentStatus = lazyNamed(() => import("./pages/OrderPaymentStatus"), "OrderPaymentStatus");
const Wishlist = lazyNamed(() => import("./pages/Wishlist"), "Wishlist");
const Account = lazyNamed(() => import("./pages/Account"), "Account");
const NewsletterUnsubscribe = lazyNamed(() => import("./pages/NewsletterUnsubscribe"), "NewsletterUnsubscribe");
const OrderHistory = lazyNamed(() => import("./pages/OrderHistory"), "OrderHistory");
const OrderDetail = lazyNamed(() => import("./pages/OrderDetail"), "OrderDetail");
const RefundRequest = lazyNamed(() => import("./pages/RefundRequest"), "RefundRequest");
const RefundTracking = lazy(() => import("./pages/RefundTracking"));
const AddressManagement = lazy(() => import("./pages/AddressManagement"));

const Login = lazyNamed(() => import("./pages/auth/Login"), "Login");
const Signup = lazyNamed(() => import("./pages/auth/Signup"), "Signup");
const OTP = lazyNamed(() => import("./pages/auth/OTP"), "OTP");
const VerifyEmail = lazyNamed(() => import("./pages/auth/VerifyEmail"), "VerifyEmail");
const ForgotPassword = lazyNamed(() => import("./pages/auth/ForgotPassword"), "ForgotPassword");
const ResetPassword = lazyNamed(() => import("./pages/auth/ResetPassword"), "ResetPassword");

const AdminDashboard = lazyNamed(() => import("./pages/admin/AdminDashboard"), "AdminDashboard");
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminInventory = lazy(() => import("./pages/admin/AdminInventory"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const SuperAdminDashboard = lazyNamed(() => import("./pages/admin/SuperAdminDashboard"), "SuperAdminDashboard");
const NotFound = lazyNamed(() => import("./pages/NotFound"), "NotFound");

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
      { path: "verify-email", Component: VerifyEmail },
      { path: "forgot-password", Component: ForgotPassword },
      { path: "reset-password", Component: ResetPassword },
    ],
  },
  { path: "/admin", Component: AdminDashboard },
  { path: "/admin/products", Component: AdminProducts },
  { path: "/admin/orders", Component: AdminOrders },
  { path: "/admin/users", Component: AdminUsers },
  { path: "/admin/coupons", Component: AdminCoupons },
  { path: "/admin/inventory", Component: AdminInventory },
  { path: "/admin/audit-logs", Component: AdminAuditLogs },
  { path: "/super-admin", Component: SuperAdminDashboard },
  { path: "*", Component: NotFound },
]);
