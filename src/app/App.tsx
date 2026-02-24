import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { Toaster } from './components/ui/sonner';
import { router } from './routes';
import { WhatsAppFloat } from './components/WhatsAppFloat';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <WhatsAppFloat />
        <Toaster position="top-right" />
      </CartProvider>
    </AuthProvider>
  );
}
