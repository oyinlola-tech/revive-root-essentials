import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as api from '../../services/api';
import { Search, AlertCircle, Plus, Edit2, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { getDisplayErrorMessage } from '../../utils/uiErrorMessages';

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  totalStock: number;
  availableStock: number;
  reservedStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  lastRestocked?: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  lastAdjustment?: {
    quantity: number;
    reason: string;
    date: string;
    adjustedBy: string;
  };
}

interface AdjustmentHistory {
  id: string;
  inventoryId: string;
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export default function AdminInventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [adjustmentHistory, setAdjustmentHistory] = useState<AdjustmentHistory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const itemsPerPage = 10;

  const [adjustmentData, setAdjustmentData] = useState({
    quantity: 0,
    type: 'add' as 'add' | 'subtract',
    reason: '',
  });

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    const filtered = inventory.filter((item) => {
      const matchesSearch =
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredInventory(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, inventory]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.adminGetInventory();
      const raw = response.data || [];
      const inventoryList = raw.map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name || 'Product',
        sku: item.sku,
        totalStock: item.quantity,
        availableStock: item.quantity - item.reservedQuantity,
        reservedStock: item.reservedQuantity,
        reorderLevel: item.reorderLevel,
        reorderQuantity: 10,
        status: (item.quantity > item.reorderLevel ? 'in-stock' : item.quantity > 0 ? 'low-stock' : 'out-of-stock') as any,
      })) as InventoryItem[];
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load inventory'));
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustInventory = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustmentData({ quantity: 0, type: 'add', reason: '' });
    setShowAdjustmentForm(true);
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustmentData.quantity || !adjustmentData.reason) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const adjustedQuantity =
        adjustmentData.type === 'add'
          ? adjustmentData.quantity
          : -adjustmentData.quantity;

      await api.adminAdjustInventory(selectedItem.productId, {
        quantity: adjustedQuantity,
        reason: adjustmentData.reason,
      });

      setShowAdjustmentForm(false);
      setSelectedItem(null);
      await loadInventory();
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to adjust inventory'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'low-stock':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'out-of-stock':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-stock':
        return '✓';
      case 'low-stock':
        return '⚠';
      case 'out-of-stock':
        return '✕';
      default:
        return '-';
    }
  };

  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);

  const lowStockCount = inventory.filter((i) => i.status === 'low-stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'out-of-stock').length;

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-2">Manage stock levels and adjustments</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {lowStockCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Low Stock Items</h3>
                <p className="text-sm text-yellow-700">
                  {lowStockCount} product{lowStockCount !== 1 ? 's' : ''} below reorder level
                </p>
              </div>
            </div>
          )}
          {outOfStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Out of Stock Items</h3>
                <p className="text-sm text-red-700">
                  {outOfStockCount} product{outOfStockCount !== 1 ? 's' : ''} completely out of stock
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Product name, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={loadInventory}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg transition font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="space-y-4">
          {filteredInventory.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No inventory items found</p>
            </div>
          ) : (
            <>
              {paginatedInventory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedItem(expandedItem === item.id ? null : item.id)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">SKU: {item.sku}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500">Total Stock</p>
                            <p className="text-xl font-bold text-gray-900">
                              {item.totalStock}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Available</p>
                            <p className="text-xl font-bold text-green-600">
                              {item.availableStock}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Reserved</p>
                            <p className="text-xl font-bold text-orange-600">
                              {item.reservedStock}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status === 'in-stock'
                            ? 'In Stock'
                            : item.status === 'low-stock'
                            ? 'Low Stock'
                            : 'Out of Stock'}
                        </span>
                        <div className="mt-3 text-sm text-gray-500">
                          <p>Reorder Level: {item.reorderLevel}</p>
                          <p>Reorder Qty: {item.reorderQuantity}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stock Level Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            item.status === 'in-stock'
                              ? 'bg-green-500'
                              : item.status === 'low-stock'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              (item.availableStock /
                                (item.totalStock || 1)) *
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {expandedItem === item.id && (
                    <div className="border-t px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div>
                          <p className="text-sm text-gray-500">Total Stock</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {item.totalStock}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Available</p>
                          <p className="text-2xl font-bold text-green-600">
                            {item.availableStock}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reserved</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {item.reservedStock}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Reorder Level</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {item.reorderLevel}
                          </p>
                        </div>
                      </div>

                      {item.lastRestocked && (
                        <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                          <p className="text-sm text-gray-500">Last Restocked</p>
                          <p className="text-sm text-gray-900">
                            {new Date(item.lastRestocked).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-900 mb-3">
                          Adjust Stock
                        </h4>
                        <button
                          onClick={() => handleAdjustInventory(item)}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Adjust Stock
                        </button>
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
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                            : 'border border-gray-300 hover:bg-gray-50'
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
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Adjustment Modal */}
        {showAdjustmentForm && selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Adjust Stock: {selectedItem.productName}
              </h3>

              <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedItem.totalStock}
                </p>
              </div>

              <form onSubmit={handleSubmitAdjustment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setAdjustmentData({
                          ...adjustmentData,
                          type: 'add',
                        })
                      }
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition font-medium ${
                        adjustmentData.type === 'add'
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setAdjustmentData({
                          ...adjustmentData,
                          type: 'subtract',
                        })
                      }
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg transition font-medium ${
                        adjustmentData.type === 'subtract'
                          ? 'bg-red-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <TrendingDown className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={adjustmentData.quantity}
                    onChange={(e) =>
                      setAdjustmentData({
                        ...adjustmentData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., 10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <select
                    value={adjustmentData.reason}
                    onChange={(e) =>
                      setAdjustmentData({
                        ...adjustmentData,
                        reason: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="restock">Restock</option>
                    <option value="damage">Damage</option>
                    <option value="loss">Loss</option>
                    <option value="return">Customer Return</option>
                    <option value="correction">Inventory Correction</option>
                    <option value="transfer">Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdjustmentForm(false);
                      setSelectedItem(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adjusting...' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
