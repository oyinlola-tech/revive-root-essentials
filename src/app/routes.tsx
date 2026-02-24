import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './contexts/AuthContext';
import { ReactNode } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPLogin from './pages/auth/OTPLogin';
import VerifyOTP from './pages/auth/VerifyOTP';
import SuperadminDashboard from './pages/dashboard/SuperadminDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import UserDashboard from './pages/dashboard/UserDashboard';

// Layout Component
function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: ReactNode; allowedRoles?: string[] }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Dashboard Route - Redirects based on user role
function DashboardRoute() {
  const { user } = useAuth();

  if (user?.role === 'superadmin') {
    return <SuperadminDashboard />;
  } else if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: '/shop',
    element: (
      <Layout>
        <Shop />
      </Layout>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <Layout>
        <ProductDetail />
      </Layout>
    ),
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/login/otp',
    element: <OTPLogin />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/register/verify-otp',
    element: <VerifyOTP />,
  },
  {
    path: '/dashboard',
    element: (
      <Layout>
        <ProtectedRoute>
          <DashboardRoute />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/orders',
    element: (
      <Layout>
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Layout>
    ),
  },
  {
    path: '/about',
    element: (
      <Layout>
        <About />
      </Layout>
    ),
  },
  {
    path: '/contact',
    element: (
      <Layout>
        <Contact />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <NotFound />
      </Layout>
    ),
  },
]);
