import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/product";
import { Button } from "../components/ui/button";
import { CheckoutModal } from "../components/CheckoutModal";
import { Filter } from "lucide-react";
import { getProducts } from "../services/api";

export function Shop() {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "hair" | "skincare">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high">("featured");
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const category = searchParams.get("category");
    if (category === "hair" || category === "skincare") {
      setCategoryFilter(category);
    }
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;

    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const apiProducts = await getProducts({
          category: categoryFilter === "all" ? undefined : categoryFilter,
          sortBy,
        });

        if (!ignore) {
          setFilteredProducts(apiProducts);
        }
      } catch {
        if (!ignore) {
          setLoadError("Unable to reach backend. No products loaded.");
          setFilteredProducts([]);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [categoryFilter, sortBy]);

  const handleAddToCart = (product: Product) => {
    const existing = cartItems.find((item) => item.product.id === product.id);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      );
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Shop Revive Roots Essential</h1>
          <p className="text-lg opacity-70">
            Discover our complete collection of natural hair and skincare products
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filter:</span>
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("all")}
              >
                All Products
              </Button>
              <Button
                variant={categoryFilter === "hair" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("hair")}
              >
                Hair Care
              </Button>
              <Button
                variant={categoryFilter === "skincare" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("skincare")}
              >
                Skin Care
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold">Sort By:</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as "featured" | "price-low" | "price-high")}
              className="px-3 py-2 bg-background border border-border rounded-lg"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <div className="mb-6 rounded-lg border border-border p-3 text-sm opacity-80">Loading products...</div>
        )}
        {loadError && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg opacity-70">No products found</p>
          </div>
        )}
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onCheckout={() => {
          alert("Order placed successfully!");
          setCheckoutOpen(false);
          setCartItems([]);
        }}
      />
    </div>
  );
}
