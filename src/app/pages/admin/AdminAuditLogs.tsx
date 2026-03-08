import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import * as api from '../../services/api';
import { Search, AlertCircle, Download, Filter, Eye } from 'lucide-react';

type LocalAuditLog = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  statusCode?: number;
  errorMessage?: string;
  createdAt: string;
  timestamp: string;
};

export default function AdminAuditLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<LocalAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LocalAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const itemsPerPage = 15;

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const matchesSearch =
        (log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.resourceName?.toLowerCase().includes(searchTerm.toLowerCase())) ??
        false;

      const matchesAction = !actionFilter || log.action === actionFilter;
      const matchesResource = !resourceFilter || log.resourceType === resourceFilter;
      const matchesStatus = !statusFilter || log.status === statusFilter;

      const logDate = new Date(log.createdAt);
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo) : null;

      const matchesDateFrom = !fromDate || logDate >= fromDate;
      const matchesDateTo = !toDate || logDate <= toDate;

      return (
        matchesSearch &&
        matchesAction &&
        matchesResource &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchTerm, actionFilter, resourceFilter, statusFilter, dateFrom, dateTo, logs]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.adminGetAuditLogs();
      const logsList = (response.data || []).map(log => ({
        ...log,
        timestamp: log.createdAt,
      })) as LocalAuditLog[];
      setLogs(logsList);
      setFilteredLogs(logsList);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to load audit logs'));
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError(null);
      const blob = await api.adminExportAuditLogs();

      // Create blob and download
      const url = window.URL.createObjectURL(blob as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to export logs'));
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'failure':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-muted text-foreground border-border';
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('Create'))
      return 'text-green-600';
    if (action.includes('delete') || action.includes('Delete'))
      return 'text-red-600';
    if (action.includes('update') || action.includes('Update'))
      return 'text-blue-600';
    return 'text-muted-foreground';
  };

  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  // Get unique values for filters
  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueResources = [...new Set(logs.map((l) => l.resourceType))];

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground mt-2">Track system activities and user actions</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || filteredLogs.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-5 h-5" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-card rounded-lg border border-border shadow p-6 mb-6">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="User, action, resource..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Action
              </label>
              <select
                value={actionFilter || ''}
                onChange={(e) => setActionFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="">All Actions</option>
                {uniqueActions.slice(0, 20).map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Resource Type
              </label>
              <select
                value={resourceFilter || ''}
                onChange={(e) => setResourceFilter(e.target.value || null)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              >
                <option value="">All Resources</option>
                {uniqueResources.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource}
                  </option>
                ))}
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
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={loadLogs}
                className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 py-2 rounded-lg transition font-medium"
              >
                Refresh
              </button>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActionFilter(null);
                  setResourceFilter(null);
                  setStatusFilter(null);
                  setDateFrom('');
                  setDateTo('');
                }}
                className="w-full border border-border bg-card hover:bg-muted text-muted-foreground py-2 rounded-lg transition font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="bg-card rounded-lg border border-border shadow p-8 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No audit logs found</p>
            </div>
          ) : (
            <>
              {paginatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-card rounded-lg border border-border shadow overflow-hidden hover:shadow-lg transition"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-muted"
                    onClick={() =>
                      setExpandedLog(expandedLog === log.id ? null : log.id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span
                            className={`font-semibold ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">
                            {log.resourceType}
                          </span>
                          {log.resourceName && (
                            <>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-foreground font-medium truncate">
                                {log.resourceName}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                          {log.userName && (
                            <>
                              <span>{log.userName}</span>
                              <span>•</span>
                            </>
                          )}
                          <span>
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          {log.ipAddress && (
                            <>
                              <span>•</span>
                              <span>{log.ipAddress}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status === 'success' ? '✓ Success' : '✗ Failed'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedLog === log.id && (
                    <div className="border-t px-4 py-4 bg-muted text-sm space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">
                            User
                          </p>
                          <p className="text-foreground">
                            {log.userName || 'Unknown'} ({log.userEmail || 'N/A'})
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">
                            Resource
                          </p>
                          <p className="text-foreground">
                            {log.resourceType} - {log.resourceId}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">
                            IP Address
                          </p>
                          <p className="text-foreground">{log.ipAddress || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">
                            Timestamp
                          </p>
                          <p className="text-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {log.status === 'failure' && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-xs text-red-600 uppercase font-semibold mb-1">
                            Error
                          </p>
                          <p className="text-red-900">
                            {log.errorMessage || 'No error details'}
                          </p>
                          {log.statusCode && (
                            <p className="text-red-800 text-xs mt-1">
                              Status Code: {log.statusCode}
                            </p>
                          )}
                        </div>
                      )}

                      {log.changes && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-600 uppercase font-semibold mb-2">
                            Changes
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <p className="font-semibold text-blue-900 text-xs mb-1">
                                Before
                              </p>
                              <pre className="text-xs text-blue-800 bg-card p-2 rounded border border-blue-200 overflow-auto max-h-32">
                                {JSON.stringify(log.changes.before, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <p className="font-semibold text-blue-900 text-xs mb-1">
                                After
                              </p>
                              <pre className="text-xs text-blue-800 bg-card p-2 rounded border border-blue-200 overflow-auto max-h-32">
                                {JSON.stringify(log.changes.after, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}

                      {log.userAgent && (
                        <div className="p-2 bg-muted rounded border border-border">
                          <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                            User Agent
                          </p>
                          <p className="text-xs text-foreground break-all">
                            {log.userAgent}
                          </p>
                        </div>
                      )}
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
      </div>
    </div>
  );
}
