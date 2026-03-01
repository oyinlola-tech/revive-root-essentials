import { Link } from "react-router";
import type { Product } from "../types/product";
import { Button } from "./ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { useCommerce } from "../contexts/CommerceContext";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { toggleWishlist, isWishlisted } = useCommerce();
  const liked = isWishlisted(product.id);

  return (
    <Link
      to={`/shop/${product.id}`}
      className="group relative block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all"
    >
      <button
        onClick={(event) => {
          event.preventDefault();
          toggleWishlist(product);
        }}
        className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-2 border border-border"
        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-current text-primary" : ""}`} />
      </button>
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wide opacity-60">
            {product.category === 'hair' ? 'Hair Care' : 'Skin Care'}
          </span>
        </div>
        <h3 className="font-semibold mb-2 group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">${product.price}</span>
          <Button
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Bag
          </Button>
        </div>
      </div>
    </Link>
  );
}
