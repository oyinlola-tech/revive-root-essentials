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
  adminIssueOrderRefund,
  AdminProduct,
  createAdminProduct,
  deleteAdminProduct,
  getAdminOrders,
  getAdminProducts,
  getAuthSession,
  getCategories,
  getContactSubmissions,
  getNewsletterSubscribers,
  logout,
  uploadAdminProductImages,
  updateAdminProduct,
  updateOrderStatus,
} from "../../services/api";
import { getDisplayErrorMessage } from "../../utils/uiErrorMessages";

const MAX_PRODUCT_IMAGES = 10;
const FIXED_CATEGORY_NAMES = ["hair care", "skin care"];

const initialProductForm = {
  id: "",
  name: "",
  description: "",
  price: "",
  imageUrls: [] as string[],
  categoryId: "",
  ingredients: "",
  benefits: "",
  howToUse: "",
  size: "",
  stock: "0",
  isFeatured: false,
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [issuingRefundFor, setIssuingRefundFor] = useState("");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; description: string }>>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [contacts, setContacts] = useState<Array<{ id: string; name: string; email: string; subject: string; message: string; createdAt: string }>>([]);
  const [subscribers, setSubscribers] = useState<Array<{ id: string; email: string; createdAt: string }>>([]);
  const [productForm, setProductForm] = useState(initialProductForm);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviewUrls, setProductImagePreviewUrls] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const editingProduct = Boolean(productForm.id);

  const canSubmitProduct = useMemo(
    () =>
      productForm.name.trim().length > 0 &&
      productForm.description.trim().length > 0 &&
      Number(productForm.price) > 0 &&
      productForm.categoryId.trim().length > 0 &&
      (productForm.imageUrls.length > 0 || productImageFiles.length > 0),
    [productForm, productImageFiles],
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
      setCategories(
        categoryData.filter((category) =>
          FIXED_CATEGORY_NAMES.includes(String(category.name || "").toLowerCase().trim()),
        ),
      );
      setOrders(orderData);
      setContacts(contactData);
      setSubscribers(subscriberData);
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to load dashboard data."));
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

  useEffect(() => {
    if (productImageFiles.length === 0) {
      setProductImagePreviewUrls([]);
      return undefined;
    }

    const previewUrls = productImageFiles.map((file) => URL.createObjectURL(file));
    setProductImagePreviewUrls(previewUrls);
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [productImageFiles]);

  const resetProductForm = () => {
    setProductForm(initialProductForm);
    setProductImageFiles([]);
    setProductImagePreviewUrls([]);
  };

  const parseLines = (value: string) =>
    value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

  const handleProductSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!productForm.categoryId.trim()) {
      setErrorMessage("Please select a category.");
      return;
    }
    if (!canSubmitProduct) return;

    setSavingProduct(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      let imageUrls = [...productForm.imageUrls];
      if (productImageFiles.length > 0) {
        const uploadedImages = await uploadAdminProductImages(productImageFiles);
        imageUrls = [...imageUrls, ...uploadedImages].slice(0, MAX_PRODUCT_IMAGES);
      }

      if (imageUrls.length === 0) {
        throw new Error("At least one product image is required.");
      }

      const payload = {
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: Number(productForm.price),
        imageUrl: imageUrls[0],
        imageUrls,
        categoryId: productForm.categoryId || undefined,
        ingredients: parseLines(productForm.ingredients),
        benefits: parseLines(productForm.benefits),
        howToUse: productForm.howToUse.trim() || undefined,
        size: productForm.size.trim() || undefined,
        stock: Number(productForm.stock || 0),
        isFeatured: productForm.isFeatured,
      };

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
      setErrorMessage(getDisplayErrorMessage(error, "Unable to save product."));
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
      setErrorMessage(getDisplayErrorMessage(error, "Unable to delete product."));
    }
  };

  const handleEditProduct = (product: AdminProduct) => {
    setProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrls: product.imageUrls,
      categoryId: product.categoryId,
      ingredients: product.ingredients.join("\n"),
      benefits: product.benefits.join("\n"),
      howToUse: product.howToUse,
      size: product.size,
      stock: String(product.stock),
      isFeatured: product.isFeatured,
    });
    setProductImageFiles([]);
    setProductImagePreviewUrls([]);
  };

  const handleProductImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []).slice(0, MAX_PRODUCT_IMAGES);
    const remainingSlots = Math.max(MAX_PRODUCT_IMAGES - productForm.imageUrls.length, 0);
    setProductImageFiles(selectedFiles.slice(0, remainingSlots));
  };

  const removeSavedProductImage = (index: number) => {
    setProductForm((current) => ({
      ...current,
      imageUrls: current.imageUrls.filter((_, imageIndex) => imageIndex !== index),
    }));
  };

  const removeQueuedProductImage = (index: number) => {
    setProductImageFiles((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const handleOrderStatus = async (id: string, status: AdminOrder["status"]) => {
    try {
      await updateOrderStatus(id, status);
      setStatusMessage("Order status updated.");
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to update order status."));
    }
  };

  const handleIssueRefund = async (order: AdminOrder) => {
    const reason = window.prompt(
      "Optional refund note for the customer email:",
      "Your cancelled order has entered refund processing and we will keep you updated by email.",
    ) || undefined;

    try {
      setIssuingRefundFor(order.id);
      setStatusMessage("");
      setErrorMessage("");
      await adminIssueOrderRefund(order.id, reason);
      setStatusMessage("Refund issued.");
      await loadDashboardData();
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to issue refund."));
    } finally {
      setIssuingRefundFor("");
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
              <Link to="/admin/shipping-fees">
                <Button variant="outline" size="sm">
                  Shipping Fees
                </Button>
              </Link>
              <Link to="/admin/coupons">
                <Button variant="outline" size="sm">
                  Coupons
                </Button>
              </Link>
              <Link to="/admin/contacts">
                <Button variant="outline" size="sm">
                  Contact Messages
                </Button>
              </Link>
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
                    <Label>Product Images</Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleProductImageSelection}
                    />
                    <p className="mt-2 text-xs opacity-70">Upload up to 10 JPG, PNG, WEBP, or GIF images. The first image is used as the main product image.</p>
                    {productForm.imageUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs uppercase tracking-wide opacity-60">Saved images</p>
                        <div className="flex flex-wrap gap-3">
                          {productForm.imageUrls.map((imageUrl, index) => (
                            <div key={imageUrl} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Saved product ${index + 1}`}
                                className="h-16 w-16 rounded object-cover border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeSavedProductImage(index)}
                                className="absolute -right-2 -top-2 rounded-full border border-border bg-background px-2 py-0.5 text-xs"
                              >
                                x
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {productImagePreviewUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-xs uppercase tracking-wide opacity-60">New uploads</p>
                        <div className="flex flex-wrap gap-3">
                          {productImagePreviewUrls.map((previewUrl, index) => (
                            <div key={previewUrl} className="relative">
                              <img
                                src={previewUrl}
                                alt={`Queued product ${index + 1}`}
                                className="h-16 w-16 rounded object-cover border border-border"
                              />
                              <button
                                type="button"
                                onClick={() => removeQueuedProductImage(index)}
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
                        <p className="text-xs opacity-60">{product.imageUrls.length} image{product.imageUrls.length === 1 ? "" : "s"}</p>
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
                          {order.customerNote && (
                            <p className="text-sm mt-1">
                              Note: <span className="opacity-80">{order.customerNote}</span>
                            </p>
                          )}
                        </div>
                        <div className="text-sm">
                          Payment: {order.paymentStatus === "pending" ? "Pending payment" : order.paymentStatus}
                        </div>
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
                        {order.status === "cancelled" && order.paymentStatus === "paid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleIssueRefund(order)}
                            disabled={issuingRefundFor === order.id}
                          >
                            {issuingRefundFor === order.id ? "Issuing Refund..." : "Issue Refund"}
                          </Button>
                        )}
                        {order.paymentStatus === "refunded" && (
                          <span className="text-sm text-blue-700">Refund Completed</span>
                        )}
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
