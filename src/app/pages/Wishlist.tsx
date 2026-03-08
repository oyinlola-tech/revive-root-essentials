import { Link } from "react-router";
import { HeartOff } from "lucide-react";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";
import { useCommerce } from "../contexts/CommerceContext";

export function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useCommerce();

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">Wishlist Is Empty</h1>
          <p className="opacity-70 mb-8">Save products you love to compare and buy later.</p>
          <Link to="/shop">
            <Button>Explore Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-6">Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((product) => (
            <div key={product.id} className="relative">
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 z-10 rounded-full bg-background/95 p-2 border border-border"
                aria-label="Remove from wishlist"
              >
                <HeartOff className="h-4 w-4" />
              </button>
              <ProductCard product={product} onAddToCart={(item) => addToCart(item, 1)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
