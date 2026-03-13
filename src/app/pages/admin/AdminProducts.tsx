import { useState, useEffect } from 'react';
import * as api from '../../services/api';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { getDisplayErrorMessage } from '../../utils/uiErrorMessages';

const MAX_PRODUCT_IMAGES = 10;
const FIXED_CATEGORY_NAMES = ['hair care', 'skin care'];

export default function AdminProducts() {
  const [products, setProducts] = useState<api.AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<api.AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrls: [] as string[],
    categoryId: '',
    stock: '',
    isFeatured: false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const itemsPerPage = 10;

  const toNumberOrNull = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const toIntOrZero = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
  };

  useEffect(() => {
    loadProductsAndCategories();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [searchTerm, products]);

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviewUrls([]);
      return undefined;
    }

    const previewUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const loadProductsAndCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const [productsRes, categoriesRes] = await Promise.all([
        api.getAdminProducts(),
        api.getCategories(),
      ]);
      setProducts(productsRes);
      setFilteredProducts(productsRes);
      setCategories(
        categoriesRes.filter((category: { name?: string }) =>
          FIXED_CATEGORY_NAMES.includes(String(category?.name || '').toLowerCase().trim())
        )
      );
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load data'));
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingProduct(true);
      if (!formData.name || !formData.price || !formData.categoryId) {
        setError('Please fill in all required fields');
        return;
      }
      const price = toNumberOrNull(formData.price);
      if (price == null || price <= 0) {
        setError('Price must be greater than 0');
        return;
      }

      let imageUrls = [...formData.imageUrls];
      if (imageFiles.length > 0) {
        const uploadedImages = await api.uploadAdminProductImages(imageFiles);
        imageUrls = [...imageUrls, ...uploadedImages].slice(0, MAX_PRODUCT_IMAGES);
      }

      if (imageUrls.length === 0) {
        setError('Please choose at least one product image');
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        price,
        imageUrl: imageUrls[0],
        imageUrls,
        categoryId: formData.categoryId,
        stock: toIntOrZero(formData.stock),
        isFeatured: formData.isFeatured,
      };

      if (editingId) {
        await api.updateAdminProduct(editingId, payload);
      } else {
        await api.createAdminProduct(payload);
      }

      await loadProductsAndCategories();
      handleCancel();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to save product'));
    } finally {
      setSavingProduct(false);
    }
  };

  const handleEdit = (product: api.AdminProduct) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      imageUrls: product.imageUrls,
      categoryId: product.categoryId,
      stock: product.stock.toString(),
      isFeatured: product.isFeatured,
    });
    setEditingId(product.id);
    setImageFiles([]);
    setImagePreviewUrls([]);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Delete product "${name}"?`)) {
      try {
        await api.deleteAdminProduct(id);
        await loadProductsAndCategories();
      } catch (err) {
        setError(getDisplayErrorMessage(err, 'Failed to delete product'));
      }
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setImageFiles([]);
    setImagePreviewUrls([]);
    setFormData({
      name: '',
      description: '',
      price: '',
      imageUrls: [],
      categoryId: '',
      stock: '',
      isFeatured: false,
    });
    setError(null);
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const remainingSlots = Math.max(MAX_PRODUCT_IMAGES - formData.imageUrls.length, 0);
    setImageFiles(selectedFiles.slice(0, remainingSlots));
  };

  const removeSavedImage = (index: number) => {
    setFormData((current) => ({
      ...current,
      imageUrls: current.imageUrls.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const removeQueuedImage = (index: number) => {
    setImageFiles((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-foreground font-medium">Loading products...</p>
            <p className="text-sm text-muted-foreground mt-1">Please wait while we fetch the catalog.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-2">Manage your product catalog</p>
          </div>
          {!isFormOpen && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {isFormOpen && (
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {editingId ? 'Edit Product' : 'Add New Product'}
            </h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Price (NGN) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Stock
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Product Images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageSelection}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload up to 10 JPG, PNG, WEBP, or GIF images up to 20MB each. The first image is the primary product image.
                </p>
                {formData.imageUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Saved images</p>
                    <div className="flex flex-wrap gap-3">
                      {formData.imageUrls.map((imageUrl, index) => (
                        <div key={imageUrl} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Saved product ${index + 1}`}
                            className="h-16 w-16 rounded object-cover border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeSavedImage(index)}
                            className="absolute -right-2 -top-2 rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {imagePreviewUrls.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">New uploads</p>
                    <div className="flex flex-wrap gap-3">
                      {imagePreviewUrls.map((previewUrl, index) => (
                        <div key={previewUrl} className="relative">
                          <img
                            src={previewUrl}
                            alt={`Queued product ${index + 1}`}
                            className="h-16 w-16 rounded object-cover border border-border"
                          />
                          <button
                            type="button"
                            onClick={() => removeQueuedImage(index)}
                            className="absolute -right-2 -top-2 rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                          >
                            x
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm font-medium text-muted-foreground">
                  Featured Product
                </label>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingProduct ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={savingProduct}
                  className="flex-1 bg-muted hover:bg-accent text-muted-foreground py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2 bg-background rounded-lg px-4 py-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-0 focus:ring-0 focus:outline-none"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-10 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground text-lg font-medium">No products found</p>
              <p className="text-muted-foreground text-sm mt-1">Try a different search term or add a new product.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Product</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Price</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Stock</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Featured</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-muted">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl && (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {product.imageUrls.length} image{product.imageUrls.length === 1 ? '' : 's'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {product.categoryName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground">
                          NGN {product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {product.isFeatured ? (
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-semibold">
                              Yes
                            </span>
                          ) : (
                            <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full text-xs">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              className="p-2 hover:bg-red-100 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-emerald-600 text-white'
                          : 'border border-border hover:bg-muted'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
