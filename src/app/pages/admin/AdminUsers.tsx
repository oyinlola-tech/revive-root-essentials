import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as api from '../../services/api';
import { Search, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { getDisplayErrorMessage } from '../../utils/uiErrorMessages';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || user.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.adminGetUsers();
      const usersList = (response.data || []).map(u => ({
        firstName: String(u.firstName || u.name || '').split(' ').slice(0, -1).join(' ') || String(u.name || '').split(' ')[0] || '',
        lastName: String(u.lastName || '').trim() || String(u.name || '').split(' ').slice(1).join(' '),
        ...u,
        role: (u.role as any) as 'user' | 'admin' | 'superadmin',
        status: (u.status as any) as 'active' | 'inactive',
      })) as User[];
      setUsers(usersList);
      setFilteredUsers(usersList);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load users'));
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditingStatus(user.status);
    setShowModal(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);
      setError(null);
      await api.adminUpdateUser(selectedUser.id, {
        status: editingStatus as any,
      });
      setShowModal(false);
      setSelectedUser(null);
      await loadUsers();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to update user'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setError(null);
      await api.adminDeleteUser(userId);
      await loadUsers();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to delete user'));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700';
      case 'inactive':
        return 'bg-yellow-50 text-yellow-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-2">Manage user accounts and account status. Admin access is created separately from the super admin page.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Name, Email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Role
              </label>
              <select
                value={roleFilter || ''}
                onChange={(e) => setRoleFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="user">Customer</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadUsers}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-card rounded-lg border border-border shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No users found</p>
            </div>
          ) : (
            <>
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-card rounded-lg border border-border shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-muted"
                    onClick={() =>
                      setExpandedUser(expandedUser === user.id ? null : user.id)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                        {user.phone && (
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="flex gap-2 mb-3 justify-end">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRoleColor(
                              user.role
                            )}`}
                          >
                            {user.role === 'user' ? 'Customer' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              user.status
                            )}`}
                          >
                            {user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined{' '}
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {expandedUser === user.id && (
                    <div className="border-t px-6 py-4 bg-muted">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Orders</p>
                          <p className="text-2xl font-bold text-foreground">
                            {user.totalOrders || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Spent</p>
                          <p className="text-2xl font-bold text-foreground">
                            ₦{(user.totalSpent || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Last Login</p>
                          <p className="text-sm text-foreground">
                            {user.lastLogin
                              ? new Date(user.lastLogin).toLocaleString()
                              : 'Never'}
                          </p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-foreground mb-3">
                          Manage User
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg transition ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white'
                            : 'border border-border hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Edit Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Edit {selectedUser.firstName} {selectedUser.lastName}
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Role
                  </label>
                  <div className="w-full px-4 py-2 border border-border rounded-lg bg-muted text-sm text-muted-foreground">
                    {selectedUser.role === 'user'
                      ? 'Customer'
                      : selectedUser.role === 'superadmin'
                        ? 'Super Admin'
                        : 'Admin'}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Admin accounts must be created manually from the super admin page. Roles cannot be changed from this list.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Status
                  </label>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-muted transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
