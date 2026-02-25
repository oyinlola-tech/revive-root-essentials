import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';
import { WhatsAppFloat } from './components/WhatsAppFloat';

export default function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <WhatsAppFloat />
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  );
}
