import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import {
  AdminOrder,
  AdminProduct,
  createAdminProduct,
  createCategory,
  deleteAdminProduct,
  deleteCategory,
  getAdminOrders,
  getAdminProducts,
  getAuthSession,
  getCategories,
  getContactSubmissions,
  getNewsletterSubscribers,
  logout,
  updateAdminProduct,
  updateCategory,
  updateOrderStatus,
} from "../../services/api";

const initialProductForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  categoryId: "",
  ingredients: "",
  benefits: "",
  howToUse: "",
  size: "",
  stock: "0",
  isFeatured: false,
};

const initialCategoryForm = {
  id: "",
  name: "",
  description: "",
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; email: string; subject: string; message: string; createdAt: string }>>([]);
  const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string; createdAt: string }>>([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const editingProduct = Boolean(productForm.id);
  const editingCategory = Boolean(categoryForm.id);

  const canSubmitProduct = useMemo(
    () =>
      productForm.name.trim().length > 0 &&
      productForm.description.trim().length > 0 &&
      Number(productForm.price) > 0 &&
      productForm.imageUrl.trim().length > 0,
    [productForm],
  );

  const loadDashboardData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [productData, categoryData, orderData, contactData, subscriberData] = await Promise.all([
        getAdminProducts(),
        getCategories(),
        getAdminOrders(),
        getContactSubmissions(),
        getNewsletterSubscribers(),
      ]);
      setProducts(productData);
      setCategories(categoryData);
      setOrders(orderData);
      setContacts(contactData);
      setSubscribers(subscriberData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      navigate("/auth/login");
      return;
    }

    if (!["admin", "superadmin"].includes(session.user.role)) {
      navigate("/");
      return;
    }

    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetProductForm = () => {
    setProductForm(initialProductForm);
  };

  const resetCategoryForm = () => {
    setCategoryForm(initialCategoryForm);
  };

  const parseLines = (value: string) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleProductSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmitProduct) return;

    setSavingProduct(true);
    setStatusMessage("");
    setErrorMessage("");

    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      imageUrl: productForm.imageUrl.trim(),
      categoryId: productForm.categoryId || undefined,
      ingredients: parseLines(productForm.ingredients),
      benefits: parseLines(productForm.benefits),
      howToUse: productForm.howToUse.trim() || undefined,
      size: productForm.size.trim() || undefined,
      stock: Number(productForm.stock || 0),
      isFeatured: productForm.isFeatured,
    };

    try {
      if (editingProduct) {
        await updateAdminProduct(productForm.id, payload);
        setStatusMessage("Product updated.");
      } else {
        await createAdminProduct(payload);
        setStatusMessage("Product created.");
      }
      resetProductForm();
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    setStatusMessage("");
    setErrorMessage("");
    try {
      await deleteAdminProduct(id);
      setStatusMessage("Product deleted.");
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete product.");
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      ingredients: product.ingredients.join("\n"),
      benefits: product.benefits.join("\n"),
      howToUse: product.howToUse,
      size: product.size,
      stock: String(product.stock),
      isFeatured: product.isFeatured,
    });
  };

  const handleCategorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!categoryForm.name.trim()) return;

    setSavingCategory(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      if (editingCategory) {
        await updateCategory(categoryForm.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
        setStatusMessage("Category updated.");
      } else {
        await createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });
        setStatusMessage("Category created.");
      }
      resetCategoryForm();
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;

    try {
      await deleteCategory(id);
      setStatusMessage("Category deleted.");
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to delete category.");
    }
  };

  const handleOrderStatus = async (id: string, status: AdminOrder["status"]) => {
    try {
      await updateOrderStatus(id, status);
      setStatusMessage("Order status updated.");
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update order status.");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Site
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
          {statusMessage && <p className="text-sm text-green-700 mt-3">{statusMessage}</p>}
          {errorMessage && <p className="text-sm text-red-600 mt-3">{errorMessage}</p>}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? "Edit Product" : "Create Product"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={productForm.name}
                      onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Image URL</Label>
                    <Input
                      value={productForm.imageUrl}
                      onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <select
                      value={productForm.categoryId}
                      onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg"
                    >
                      <option value="">No category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Input
                      value={productForm.size}
                      onChange={(event) => setProductForm({ ...productForm, size: event.target.value })}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      id="featured"
                      type="checkbox"
                      checked={productForm.isFeatured}
                      onChange={(event) => setProductForm({ ...productForm, isFeatured: event.target.checked })}
                    />
                    <Label htmlFor="featured">Featured product</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={4}
                      value={productForm.description}
                      onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ingredients (one per line)</Label>
                    <Textarea
                      rows={4}
                      value={productForm.ingredients}
                      onChange={(event) => setProductForm({ ...productForm, ingredients: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Benefits (one per line)</Label>
                    <Textarea
                      rows={4}
                      value={productForm.benefits}
                      onChange={(event) => setProductForm({ ...productForm, benefits: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>How To Use</Label>
                    <Textarea
                      rows={3}
                      value={productForm.howToUse}
                      onChange={(event) => setProductForm({ ...productForm, howToUse: event.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit" disabled={savingProduct || !canSubmitProduct}>
                      {savingProduct ? "Saving..." : editingProduct ? "Update Product" : "Create Product"}
                    </Button>
                    {editingProduct && (
                      <Button type="button" variant="outline" onClick={resetProductForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {products.map((product) => (
                    <div key={product.id} className="p-4 border border-border rounded-lg flex items-center gap-4">
                      <img src={product.imageUrl} alt={product.name} className="h-14 w-14 rounded object-cover" />
                      <div className="flex-1">
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm opacity-70">
                          {product.categoryName} | ${product.price.toFixed(2)} | Stock {product.stock}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{editingCategory ? "Edit Category" : "Create Category"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm({ ...categoryForm, name: event.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={categoryForm.description}
                      onChange={(event) => setCategoryForm({ ...categoryForm, description: event.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={savingCategory || !categoryForm.name.trim()}>
                      {savingCategory ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                    </Button>
                    {editingCategory && (
                      <Button type="button" variant="outline" onClick={resetCategoryForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Categories ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="p-4 border border-border rounded-lg flex items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm opacity-70">{category.description || "No description"}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCategoryForm({ id: category.id, name: category.name, description: category.description || "" })}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>All Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div>
                          <p className="font-semibold">#{order.orderNumber}</p>
                          <p className="text-sm opacity-70">
                            {new Date(order.createdAt).toLocaleString()} | {order.currency} {order.totalAmount.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm">Payment: {order.paymentStatus}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Status</Label>
                        <select
                          value={order.status}
                          onChange={(event) => handleOrderStatus(order.id, event.target.value as AdminOrder["status"])}
                          className="px-3 py-2 bg-background border border-border rounded-lg"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages ({contacts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="p-4 border border-border rounded-lg">
                      <p className="font-semibold">{contact.subject}</p>
                      <p className="text-sm opacity-70 mb-2">
                        {contact.name} ({contact.email}) | {new Date(contact.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm">{contact.message}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle>Newsletter Subscribers ({subscribers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="p-3 border border-border rounded-lg flex items-center justify-between">
                      <span>{subscriber.email}</span>
                      <span className="text-sm opacity-60">{new Date(subscriber.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
