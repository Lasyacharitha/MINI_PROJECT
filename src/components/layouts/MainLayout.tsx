import { ReactNode, useState, useEffect } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // Get cart count from localStorage
    const cart = localStorage.getItem('cart');
    if (cart) {
      try {
        const cartItems = JSON.parse(cart);
        const count = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
        setCartItemCount(count);
      } catch {
        setCartItemCount(0);
      }
    }

    // Listen for cart updates
    const handleCartUpdate = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        try {
          const cartItems = JSON.parse(cart);
          const count = cartItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
          setCartItemCount(count);
        } catch {
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header cartItemCount={cartItemCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
