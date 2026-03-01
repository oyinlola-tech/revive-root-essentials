import { Link } from "react-router";
import type { Product } from "../types/product";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Link
      to={`/shop/${product.id}`}
      className="group block bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all"
    >
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
