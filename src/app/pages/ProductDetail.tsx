import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { productAPI, reviewAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { Star, Minus, Plus, ShoppingCart } from 'lucide-react';
import { SEO } from '../components/SEO';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ingredients?: string[];
  howToUse?: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const mapProduct = (product: any): Product => ({
  id: product.id,
  name: product.name,
  price: Number(product.price),
  description: product.description || '',
  image: product.imageUrl || product.image || '',
  category: product.Category?.name || product.category || 'Uncategorized',
  metaTitle: product.metaTitle,
  metaDescription: product.metaDescription,
  metaKeywords: product.metaKeywords,
  ingredients: product.ingredients || [],
  howToUse: product.howToUse || '',
});

const mapReview = (review: any): Review => ({
  id: review.id,
  userId: review.userId,
  userName: review.User?.name || review.userName || 'Anonymous',
  rating: Number(review.rating),
  comment: review.comment || '',
  createdAt: review.createdAt,
});

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
      loadReviews();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      // API Call: GET /products/:id
      const data = await productAPI.getProductById(id!);
      setProduct(mapProduct(data));
    } catch (error) {
      console.error('Failed to load product:', error);
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      // API Call: GET /reviews/product/:productId
      const data = await reviewAPI.getProductReviews(id!);
      setReviews((data || []).map(mapReview));
    } catch (error) {
      console.error('Failed to load reviews:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    try {
      // API Call: POST /cart
      await addToCart(id!, quantity);
      toast.success('Added to cart!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-white page-section">
      <SEO
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.description || `${product.name} by Revive Roots Essentials`}
        image={product.image}
        type="product"
        canonicalPath={`/product/${product.id}`}
        keywords={product.metaKeywords || `${product.name}, natural skincare, ${product.category}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.image ? [product.image] : undefined,
          description: product.metaDescription || product.description,
          sku: product.id,
          brand: { '@type': 'Brand', name: 'Revive Roots Essentials' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'USD',
            price: product.price,
            availability: 'https://schema.org/InStock',
          },
          aggregateRating: reviews.length
            ? {
                '@type': 'AggregateRating',
                ratingValue: averageRating.toFixed(1),
                reviewCount: reviews.length,
              }
            : undefined,
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{product.category}</p>
              <h1 className="text-4xl mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} reviews)
                </span>
              </div>
              <p className="text-3xl font-semibold">${product.price}</p>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">Description</TabsTrigger>
                <TabsTrigger value="ingredients" className="flex-1">Ingredients</TabsTrigger>
                <TabsTrigger value="how-to-use" className="flex-1">How to Use</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="space-y-2 p-4">
                <p className="text-muted-foreground">{product.description}</p>
              </TabsContent>
              <TabsContent value="ingredients" className="p-4">
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.ingredients?.map((ingredient, i) => (
                    <li key={i}>{ingredient}</li>
                  )) || <li>Ingredient information coming soon</li>}
                </ul>
              </TabsContent>
              <TabsContent value="how-to-use" className="p-4">
                <p className="text-muted-foreground">{product.howToUse || 'Apply as directed.'}</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl mb-6">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{review.userName}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
