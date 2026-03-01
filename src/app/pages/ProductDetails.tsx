import { useParams, Link } from "react-router";
import type { Product } from "../types/product";
import { Button } from "../components/ui/button";
import { ProductCard } from "../components/ProductCard";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { getFeaturedProducts, getProductByIdentifier } from "../services/api";
import { useCommerce } from "../contexts/CommerceContext";
import { formatMoney } from "../utils/formatMoney";
import { PRODUCT_FALLBACK_IMAGES, getProductImageByCategory } from "../utils/productImages";

export function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCommerce();

  useEffect(() => {
    let ignore = false;

    const loadProductData = async () => {
      if (!id) {
        setIsLoading(false);
        setProduct(null);
        return;
      }

      setIsLoading(true);
      setLoadError("");

      try {
        const [mainProduct, featuredProducts] = await Promise.all([
          getProductByIdentifier(id),
          getFeaturedProducts(),
        ]);

        if (ignore) return;

        setProduct(mainProduct);
        setRelatedProducts(featuredProducts.filter((entry) => entry.id !== mainProduct.id).slice(0, 3));
      } catch {
        if (ignore) return;

        setProduct(null);
        setRelatedProducts([]);
        setLoadError("Unable to load live product data.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadProductData();
    return () => {
      ignore = true;
    };
  }, [id]);

  const safeIngredients = useMemo(() => product?.ingredients || [], [product]);
  const safeBenefits = useMemo(() => product?.benefits || [], [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg opacity-70">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <Link to="/shop">
            <Button>Return to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToBag = () => {
    addToCart(product, quantity);
  };

  return (
    <div>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link to="/shop" className="inline-flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        {loadError && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-16">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={getProductImageByCategory(product)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = PRODUCT_FALLBACK_IMAGES[product.category];
              }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <span className="text-sm uppercase tracking-wide opacity-60">
                {product.category === "hair" ? "Hair Care" : "Skin Care"}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{product.name}</h1>
              <p className="text-2xl font-semibold">{formatMoney(product.price, product.currency)}</p>
            </div>

            <Separator />

            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="opacity-70">{product.description}</p>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Size</h2>
              <p className="opacity-70">{product.size}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 border-l border-r border-border min-w-16 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-2 hover:bg-muted transition-colors">
                  +
                </button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAddToBag}>
                Add to Bag
              </Button>
            </div>
          </div>
        </div>

        {safeIngredients.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Key Ingredients</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {safeIngredients.map((ingredient, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {safeBenefits.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safeBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-16 p-8 bg-muted/30 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">How to Use</h2>
          <p className="opacity-70">{product.howToUse}</p>
        </div>

        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={(item) => {
                    addToCart(item, 1);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
