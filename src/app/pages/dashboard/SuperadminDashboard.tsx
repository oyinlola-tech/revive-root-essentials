import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { userAPI, analyticsAPI, orderAPI, newsletterAPI } from '../../services/api';
import { UserRole } from '../../contexts/AuthContext';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { ProductManagement } from '../../components/ProductManagement';
import { SEO } from '../../components/SEO';
import { formatMoney } from '../../utils/formatMoney';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

const mapUser = (user: any): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

export default function SuperadminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // API Call: GET /analytics/dashboard
      const dashboardData = await analyticsAPI.getDashboardStats();
      setStats(dashboardData);

      // API Call: GET /users
      const usersData = await userAPI.getAllUsers();
      setUsers((usersData.users || usersData || []).map(mapUser));

      const ordersData = await orderAPI.getAllOrders({ limit: 50 });
      setOrders(ordersData.orders || ordersData || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });
      setUsers([]);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      // API Call: PUT /users/:id/role
      await userAPI.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      // API Call: DELETE /users/:id
      await userAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleRefund = async (orderId: string) => {
    const reason = prompt('Enter refund reason:');
    if (!reason) return;

    try {
      await orderAPI.refundOrder(orderId, reason);
      toast.success('Order refunded and email sent');
      loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to refund order');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      await userAPI.createAdminAccount({
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        phone: adminForm.phone || undefined,
      });
      toast.success('Admin account created successfully');
      setAdminForm({ name: '', email: '', password: '', phone: '' });
      await loadDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleSendNewsletterNow = async () => {
    setSendingNewsletter(true);
    try {
      const result = await newsletterAPI.sendNow();
      if (result?.sent) {
        toast.success(`Newsletter sent to ${result.recipientCount} recipients`);
      } else {
        toast.error(result?.reason || 'Newsletter was not sent');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send newsletter');
    } finally {
      setSendingNewsletter(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Superadmin Dashboard"
        description="Manage users, admin access, products, orders, and platform analytics."
        canonicalPath="/dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Superadmin Dashboard</h1>
          <p className="text-muted-foreground">Manage all aspects of Revive Roots Essentials</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in store</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +15% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="admin-access">Create Admin</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleUpdateUserRole(user.id, value as UserRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="superadmin">Superadmin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admin-access">
            <Card>
              <CardHeader>
                <CardTitle>Create Admin Login</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={adminForm.name}
                      onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone (optional)</Label>
                    <Input
                      type="tel"
                      value={adminForm.phone}
                      onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Button type="submit" disabled={creatingAdmin}>
                      {creatingAdmin ? 'Creating...' : 'Create Admin Account'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell className="capitalize">{order.status}</TableCell>
                        <TableCell className="capitalize">{order.paymentStatus}</TableCell>
                        <TableCell>{formatMoney(Number(order.totalAmount), order.currency || 'NGN')}</TableCell>
                        <TableCell>
                          {order.paymentStatus === 'paid' ? (
                            <Button variant="outline" size="sm" onClick={() => handleRefund(order.id)}>
                              Refund
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">No refund available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card>
              <CardHeader>
                <CardTitle>Email Marketing Newsletter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Trigger the luxury weekly newsletter campaign manually before the scheduled weekly send.
                  The campaign includes the latest 15 products with image, price in NGN, product links, and unsubscribe option.
                </p>
                <Button onClick={handleSendNewsletterNow} disabled={sendingNewsletter}>
                  {sendingNewsletter ? 'Sending campaign...' : 'Send Newsletter Now'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  Analytics and charts will be displayed here.
                  <br />
                  API Endpoints: GET /analytics/sales, GET /analytics/products
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
