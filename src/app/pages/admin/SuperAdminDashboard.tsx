import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  createAdminAccount,
  getAuthSession,
  getDashboardStats,
  getUsers,
  logout,
} from "../../services/api";
import { getDisplayErrorMessage } from "../../utils/uiErrorMessages";

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: "user" | "admin" | "superadmin" }>>([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [statsData, usersData] = await Promise.all([getDashboardStats(), getUsers()]);
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to load super admin data."));
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
    if (session.user.role !== "superadmin") {
      navigate("/admin");
      return;
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    setCreatingAdmin(true);

    try {
      await createAdminAccount({
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password,
        phone: adminForm.phone || undefined,
      });
      setStatusMessage("Admin account created.");
      setAdminForm({ name: "", email: "", password: "", phone: "" });
      await loadData();
    } catch (error) {
      setErrorMessage(getDisplayErrorMessage(error, "Unable to create admin account."));
    } finally {
      setCreatingAdmin(false);
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
              <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  Open Admin Panel
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={loadData}>
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

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.users}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.products}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.orders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">NGN {stats.revenue.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Admin Account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={adminForm.name}
                  onChange={(event) => setAdminForm({ ...adminForm, name: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={adminForm.email}
                  onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={adminForm.password}
                  onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input
                  value={adminForm.phone}
                  onChange={(event) => setAdminForm({ ...adminForm, phone: event.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={creatingAdmin}>
                  {creatingAdmin ? "Creating..." : "Create Admin"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Access Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm opacity-70">
              Admin accounts are created manually from the form above. Role changes are not available from this user list.
            </p>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="p-4 border border-border rounded-lg flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm opacity-70">{user.email}</p>
                  </div>
                  <span className="rounded-full border border-border bg-muted px-3 py-2 text-sm font-medium">
                    {user.role === "user" ? "Customer" : user.role === "superadmin" ? "Super Admin" : "Admin"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
