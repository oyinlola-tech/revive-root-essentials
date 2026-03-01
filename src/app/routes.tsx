import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Shop } from "./pages/Shop";
import { ProductDetails } from "./pages/ProductDetails";
import { Contact } from "./pages/Contact";
import { Cart } from "./pages/Cart";
import { Wishlist } from "./pages/Wishlist";
import { Account } from "./pages/Account";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { OTP } from "./pages/auth/OTP";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
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
      { path: "wishlist", Component: Wishlist },
      { path: "account", Component: Account },
      { path: "contact", Component: Contact },
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
    path: "/super-admin",
    Component: SuperAdminDashboard,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
