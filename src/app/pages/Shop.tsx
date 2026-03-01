import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { ProductCard } from "../components/ProductCard";
import type { Product } from "../types/product";
import { Button } from "../components/ui/button";
import { Filter } from "lucide-react";
import { getProducts } from "../services/api";
import { useCommerce } from "../contexts/CommerceContext";
import { useSeo } from "../hooks/useSeo";

export function Shop() {
  const [searchParams] = useSearchParams();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<"all" | "hair" | "skincare">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-low" | "price-high">("featured");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const { addToCart } = useCommerce();
  useSeo({
    title: "Shop Hair & Skincare Products | Revive Roots Essential",
    description:
      "Browse all Revive Roots Essential products. Filter by hair care and skin care categories, search products, and shop by price.",
    canonicalPath: "/shop",
    keywords: "shop hair care, shop skincare, beauty ecommerce nigeria",
  });

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
          search,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
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
  }, [categoryFilter, sortBy, search, minPrice, maxPrice]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
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

        <div className="flex flex-col gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-5 w-5" />
            <span className="font-semibold">Filter:</span>
            <div className="flex flex-wrap gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="px-3 py-2 bg-background border border-border rounded-lg"
            />
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min price"
              className="px-3 py-2 bg-background border border-border rounded-lg"
            />
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max price"
              className="px-3 py-2 bg-background border border-border rounded-lg"
            />
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

    </div>
  );
}
