import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { productAPI, categoryAPI } from '../services/api';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Search } from 'lucide-react';
import { SEO } from '../components/SEO';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

const mapProduct = (product: any): Product => ({
  id: product.id,
  name: product.name,
  price: Number(product.price),
  image: product.imageUrl || product.image || '',
  category: product.Category?.name || product.category || 'Uncategorized',
});

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [searchParams]);

  const loadCategories = async () => {
    try {
      // API Call: GET /categories
      const data = await categoryAPI.getAllCategories();
      setCategories(data.map((cat: any) => cat.name));
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      // API Call: GET /products with filters
      const params: any = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        minPrice: searchParams.get('minPrice') || undefined,
        maxPrice: searchParams.get('maxPrice') || undefined,
        sort: sortBy,
      };
      
      const data = await productAPI.getAllProducts(params);
      setProducts((data.products || data || []).map(mapProduct));
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    const params: any = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
    if (priceRange.min) params.minPrice = priceRange.min;
    if (priceRange.max) params.maxPrice = priceRange.max;
    setSearchParams(params);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="min-h-screen bg-white page-section">
      <SEO
        title="Shop Natural Skincare Products"
        description="Browse all Revive Roots Essentials products including cleansers, serums, moisturizers, and masks."
        canonicalPath="/shop"
        keywords="shop skincare, skincare products, natural face care, organic skincare"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-4">Shop Revive Roots for Calm, Confident Skin</h1>
          <p className="text-muted-foreground">
            Discover our complete collection of natural skincare essentials
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-4 space-y-6">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button size="icon" onClick={handleSearch}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <Label>Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </div>
                </div>

                <Button className="w-full" onClick={handleSearch}>
                  Apply Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Products Grid */}
          <div className="md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-muted animate-pulse rounded" />
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      <div className="aspect-square bg-muted">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                        <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                        <p className="font-semibold">${product.price}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
