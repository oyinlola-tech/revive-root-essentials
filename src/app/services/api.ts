/**
 * API Service Layer
 * All backend API endpoints are defined here
 * Uses VITE_API_URL for backend URL, e.g. http://localhost:3000/api
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

const toQueryString = (params?: Record<string, string | number | undefined>) => {
  if (!params) return '';
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => [key, String(value)]);
  return filtered.length > 0 ? `?${new URLSearchParams(filtered)}` : '';
};

// Helper function for API calls
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function apiUpload(endpoint: string, formData: FormData) {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

// ============ AUTHENTICATION ENDPOINTS ============

export const authAPI = {
  // POST /auth/register - Register new user
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    acceptedTerms: boolean;
    acceptedMarketing?: boolean;
    acceptedNewsletter?: boolean;
  }) =>
    apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /auth/send-otp - Send OTP to email/phone
  sendOTP: (data: { identifier: string; type: 'email' | 'phone' }) =>
    apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /auth/verify-otp - Verify OTP
  verifyOTP: (data: { identifier: string; otp: string }) =>
    apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /auth/login - Login user
  login: (data: { email: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /auth/logout - Logout user
  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),

  // GET /auth/me - Get current user
  getCurrentUser: () => apiCall('/auth/me'),

  // POST /auth/refresh-token - Refresh auth token
  refreshToken: (refreshToken: string) =>
    apiCall('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  // POST /auth/reset-password - Request password reset
  resetPassword: (email: string) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
};

// ============ USER MANAGEMENT ENDPOINTS ============

export const userAPI = {
  // GET /users - Get all users (Admin/Superadmin only)
  getAllUsers: (params?: { page?: number; limit?: number; role?: string }) =>
    apiCall(`/users${toQueryString(params)}`),

  // GET /users/:id - Get user by ID
  getUserById: (id: string) => apiCall(`/users/${id}`),

  // PUT /users/:id - Update user
  updateUser: (id: string, data: any) =>
    apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /users/:id - Delete user (Superadmin only)
  deleteUser: (id: string) =>
    apiCall(`/users/${id}`, {
      method: 'DELETE',
    }),

  // DELETE /users/me/account - Delete current authenticated account
  deleteMyAccount: () =>
    apiCall('/users/me/account', {
      method: 'DELETE',
    }),

  // PUT /users/:id/role - Update user role (Superadmin only)
  updateUserRole: (id: string, role: 'user' | 'admin' | 'superadmin') =>
    apiCall(`/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  // POST /users/admin-account - Create admin account (Superadmin only)
  createAdminAccount: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiCall('/users/admin-account', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============ PRODUCT ENDPOINTS ============

export const productAPI = {
  // GET /products - Get all products
  getAllProducts: (params?: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) => apiCall(`/products${toQueryString(params)}`),

  // GET /products/:id - Get product by ID
  getProductById: (id: string) => apiCall(`/products/${id}`),

  // POST /products - Create product (Admin/Superadmin only)
  createProduct: (data: any) =>
    apiCall('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /products/:id - Update product (Admin/Superadmin only)
  updateProduct: (id: string, data: any) =>
    apiCall(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /products/:id - Delete product (Admin/Superadmin only)
  deleteProduct: (id: string) =>
    apiCall(`/products/${id}`, {
      method: 'DELETE',
    }),

  // GET /products/featured - Get featured products
  getFeaturedProducts: () => apiCall('/products/featured'),

  // GET /products/bestsellers - Get bestselling products
  getBestsellers: () => apiCall('/products/bestsellers'),

  // POST /products/upload-image - Upload image (Admin/Superadmin only)
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiUpload('/products/upload-image', formData);
  },
};

// ============ CATEGORY ENDPOINTS ============

export const categoryAPI = {
  // GET /categories - Get all categories
  getAllCategories: () => apiCall('/categories'),

  // GET /categories/:id - Get category by ID
  getCategoryById: (id: string) => apiCall(`/categories/${id}`),

  // POST /categories - Create category (Admin/Superadmin only)
  createCategory: (data: { name: string; description?: string }) =>
    apiCall('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /categories/:id - Update category (Admin/Superadmin only)
  updateCategory: (id: string, data: any) =>
    apiCall(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /categories/:id - Delete category (Admin/Superadmin only)
  deleteCategory: (id: string) =>
    apiCall(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

// ============ CART ENDPOINTS ============

export const cartAPI = {
  // GET /cart - Get user's cart
  getCart: () => apiCall('/cart'),

  // POST /cart - Add item to cart
  addToCart: (data: { productId: string; quantity: number }) =>
    apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /cart/:itemId - Update cart item quantity
  updateCartItem: (itemId: string, quantity: number) =>
    apiCall(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  // DELETE /cart/:itemId - Remove item from cart
  removeFromCart: (itemId: string) =>
    apiCall(`/cart/${itemId}`, {
      method: 'DELETE',
    }),

  // DELETE /cart - Clear cart
  clearCart: () =>
    apiCall('/cart', {
      method: 'DELETE',
    }),
};

// ============ ORDER ENDPOINTS ============

export const orderAPI = {
  // GET /orders - Get user's orders
  getUserOrders: (params?: { page?: number; limit?: number }) =>
    apiCall(`/orders${toQueryString(params)}`),

  // GET /orders/all - Get all orders (Admin/Superadmin only)
  getAllOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    apiCall(`/orders/all${toQueryString(params)}`),

  // GET /orders/:id - Get order by ID
  getOrderById: (id: string) => apiCall(`/orders/${id}`),

  // POST /orders - Create order
  createOrder: (data: any) =>
    apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /orders/:id/status - Update order status (Admin/Superadmin only)
  updateOrderStatus: (id: string, status: string) =>
    apiCall(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // POST /orders/:id/verify-payment - Verify payment for order
  verifyPayment: (id: string, reference?: string) =>
    apiCall(`/orders/${id}/verify-payment`, {
      method: 'POST',
      body: JSON.stringify({ reference }),
    }),

  // POST /orders/:id/refund - Refund paid order (Admin/Superadmin only)
  refundOrder: (id: string, reason?: string) =>
    apiCall(`/orders/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // DELETE /orders/:id - Cancel order
  cancelOrder: (id: string) =>
    apiCall(`/orders/${id}`, {
      method: 'DELETE',
    }),
};

// ============ REVIEW ENDPOINTS ============

export const reviewAPI = {
  // GET /reviews/product/:productId - Get product reviews
  getProductReviews: (productId: string) => apiCall(`/reviews/product/${productId}`),

  // POST /reviews - Create review
  createReview: (data: { productId: string; rating: number; comment: string }) =>
    apiCall('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /reviews/:id - Update review
  updateReview: (id: string, data: any) =>
    apiCall(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /reviews/:id - Delete review
  deleteReview: (id: string) =>
    apiCall(`/reviews/${id}`, {
      method: 'DELETE',
    }),
};

// ============ ANALYTICS ENDPOINTS (Admin/Superadmin) ============

export const analyticsAPI = {
  // GET /analytics/dashboard - Get dashboard stats
  getDashboardStats: () => apiCall('/analytics/dashboard'),

  // GET /analytics/sales - Get sales data
  getSalesData: (params?: { startDate?: string; endDate?: string }) =>
    apiCall(`/analytics/sales?${new URLSearchParams(params as any)}`),

  // GET /analytics/products - Get product analytics
  getProductAnalytics: () => apiCall('/analytics/products'),

  // GET /analytics/users - Get user analytics
  getUserAnalytics: () => apiCall('/analytics/users'),
};

// ============ CONTACT ENDPOINTS ============

export const contactAPI = {
  // POST /contact - Submit contact form
  submitContactForm: (data: { name: string; email: string; subject: string; message: string }) =>
    apiCall('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /contact - Get all contact submissions (Admin/Superadmin only)
  getAllSubmissions: (params?: { page?: number; limit?: number }) =>
    apiCall(`/contact${toQueryString(params)}`),
};

// ============ NEWSLETTER ENDPOINTS ============

export const newsletterAPI = {
  // POST /newsletter/subscribe - Subscribe to newsletter
  subscribe: (email: string) =>
    apiCall('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // GET /newsletter/subscribers - Get all subscribers (Admin/Superadmin only)
  getSubscribers: () => apiCall('/newsletter/subscribers'),

  // GET /newsletter/unsubscribe?token=... - Unsubscribe via email token
  unsubscribe: (token: string) => apiCall(`/newsletter/unsubscribe?token=${encodeURIComponent(token)}`),

  // POST /newsletter/send-now - Trigger newsletter campaign (Superadmin only)
  sendNow: () =>
    apiCall('/newsletter/send-now', {
      method: 'POST',
    }),
};
