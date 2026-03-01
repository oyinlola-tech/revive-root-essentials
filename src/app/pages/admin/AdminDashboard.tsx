import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { products as initialProducts, Product } from "../../data/products";
import { teamMembers as initialTeam, TeamMember } from "../../data/team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Edit2, Trash2, Plus, ArrowLeft } from "lucide-react";

export function AdminDashboard() {
  const [products, setProducts] = useState(initialProducts);
  const [team, setTeam] = useState(initialTeam);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingTeam, setEditingTeam] = useState<TeamMember | null>(null);

  const handleSaveProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSaveTeam = (member: TeamMember) => {
    setTeam(team.map(t => t.id === member.id ? member : t));
    setEditingTeam(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      setTeam(team.filter(t => t.id !== id));
    }
  };

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
              <span className="text-sm opacity-60">Logged in as Admin</span>
              <Button variant="outline" size="sm" onClick={() => window.location.href = "/"}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Products ({products.length})</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{product.name}</h3>
                        <p className="text-sm opacity-60">
                          {product.category === 'hair' ? 'Hair Care' : 'Skin Care'} • ${product.price}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {editingProduct && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveProduct(editingProduct);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Product Name</Label>
                      <Input
                        value={editingProduct.name}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, name: e.target.value })
                        }
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: parseFloat(e.target.value),
                          })
                        }
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editingProduct.description}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            description: e.target.value,
                          })
                        }
                        className="bg-input-background"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingProduct(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Team Members ({team.length})</span>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {team.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-4 p-4 border border-border rounded-lg"
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm opacity-60">{member.role}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingTeam(member)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteTeam(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {editingTeam && (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Team Member</CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveTeam(editingTeam);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={editingTeam.name}
                        onChange={(e) =>
                          setEditingTeam({ ...editingTeam, name: e.target.value })
                        }
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={editingTeam.role}
                        onChange={(e) =>
                          setEditingTeam({ ...editingTeam, role: e.target.value })
                        }
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea
                        value={editingTeam.bio}
                        onChange={(e) =>
                          setEditingTeam({ ...editingTeam, bio: e.target.value })
                        }
                        className="bg-input-background"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Save Changes</Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setEditingTeam(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Order #1234</span>
                      <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">Pending</span>
                    </div>
                    <p className="text-sm opacity-60">Customer: John Doe</p>
                    <p className="text-sm opacity-60">Total: $125.00</p>
                  </div>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Order #1235</span>
                      <span className="text-sm bg-primary/10 px-3 py-1 rounded-full">Completed</span>
                    </div>
                    <p className="text-sm opacity-60">Customer: Jane Smith</p>
                    <p className="text-sm opacity-60">Total: $89.00</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
