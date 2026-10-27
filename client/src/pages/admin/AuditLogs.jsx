import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { IoDocumentTextOutline, IoRefreshOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import './AuditLogs.css';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({ page, limit: 25 });
      setLogs(res.data.data.logs || []);
      setPages(res.data.data.pages || 1);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="audit-logs">
      <div className="audit-header-bar glass">
        <h3>System Audit Trails Registry</h3>
        <p>Immutable system operations activity logs. Tracks all modifications, check-ins/outs, and administrative overrides.</p>
        <Button variant="ghost" onClick={fetchLogs} title="Reload logs">
          <IoRefreshOutline /> Refresh Logs
        </Button>
      </div>

      {loading ? (
        <div className="audit-loading">
          <Spinner size="lg" />
          <p>Querying immutable activity registers...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="no-logs glass">
          <h3>No Audit Records Found</h3>
          <p>No operational changes have been logged in the system database yet.</p>
        </div>
      ) : (
        <div className="table-responsive glass">
          <table className="operations-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator Profile</th>
                <th>API Action</th>
                <th>Target Resource</th>
                <th>IP Address</th>
                <th>Changes Recorded</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <span className="log-date">{new Date(log.createdAt).toLocaleString()}</span>
                  </td>
                  <td>
                    <div className="op-profile">
                      <strong>{log.user?.name || 'System Daemon'}</strong>
                      <small className="op-role">{log.user?.email || 'System'}</small>
                    </div>
                  </td>
                  <td>
                    <Badge variant={log.action === 'deactivate' || log.action === 'delete' ? 'danger' : 'info'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td>
                    <strong>{log.resource}</strong>
                  </td>
                  <td>
                    <code className="ip-addr-code">{log.ip}</code>
                  </td>
                  <td>
                    {log.newValue ? (
                      <div className="changes-preview">
                        <small className="changes-label">Parameters:</small>
                        <code className="changes-code">{JSON.stringify(log.newValue).slice(0, 80)}...</code>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pages > 1 && (
            <div className="bookings-pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="page-nav-btn">Previous</button>
              <span className="page-indicator">Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(page + 1)} className="page-nav-btn">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
