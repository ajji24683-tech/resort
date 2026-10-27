import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { IoPeopleOutline, IoCalendarOutline, IoCashOutline, IoDocumentTextOutline, IoSettingsOutline, IoLockClosedOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import './AdminDashboard.css';

// Recharts components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setStats(res.data.data);
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <Spinner size="lg" />
        <p>Connecting to system metrics engine...</p>
      </div>
    );
  }

  const { users, bookings, todayActivity, finance, rooms, complaints, recentActivity } = stats;

  const chartData = [
    { name: 'Jan', Revenue: 40000 },
    { name: 'Feb', Revenue: 60000 },
    { name: 'Mar', Revenue: 85000 },
    { name: 'Apr', Revenue: 120000 },
    { name: 'May', Revenue: 150000 },
    { name: 'Jun', Revenue: 210000 },
    { name: 'Jul', Revenue: 180000 },
  ];

  return (
    <div className="admin-dashboard animate-fade-in-up">
      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card glass">
          <div className="icon-wrap users"><IoPeopleOutline /></div>
          <div className="metric-info">
            <span className="metric-label">System Users</span>
            <strong className="metric-value">{users.total}</strong>
            <span className="metric-sub">Accounts registered</span>
          </div>
        </div>

        <div className="metric-card glass">
          <div className="icon-wrap bookings"><IoCalendarOutline /></div>
          <div className="metric-info">
            <span className="metric-label">Bookings Placed</span>
            <strong className="metric-value">{bookings.total}</strong>
            <span className="metric-sub">
              {todayActivity ? `Today: ${todayActivity.checkIns} In / ${todayActivity.checkOuts} Out` : `${bookings.today || 0} booked today`}
            </span>
          </div>
        </div>

        <div className="metric-card glass">
          <div className="icon-wrap revenue"><IoCashOutline /></div>
          <div className="metric-info">
            <span className="metric-label">Gross Revenue</span>
            <strong className="metric-value">₹{finance.totalRevenue.toLocaleString()}</strong>
            <span className="metric-sub">Net: ₹{finance.netRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="metric-card glass">
          <div className="icon-wrap complaints"><IoDocumentTextOutline /></div>
          <div className="metric-info">
            <span className="metric-label">Open Complaints</span>
            <strong className="metric-value">{complaints.open}</strong>
            <span className="metric-sub">Pending resolution</span>
          </div>
        </div>
      </div>

      <div className="dashboard-double-panel">
        {/* Revenue Line Chart */}
        <div className="chart-panel-card glass">
          <h3 className="panel-heading font-heading">System Revenue Analytics</h3>
          <div className="chart-container" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room availability status overview */}
        <div className="rooms-overview-panel glass">
          <h3 className="panel-heading font-heading">Sanctuary Rooms Availability</h3>
          <div className="rooms-meter-box">
            <div className="rooms-radial-meter">
              <span className="meter-percentage">
                {rooms.total > 0 ? Math.round((rooms.available / rooms.total) * 100) : 0}%
              </span>
              <span className="meter-label">Rooms Available</span>
            </div>
            <div className="rooms-meter-details">
              <div className="meter-row">
                <span>Available Rooms:</span>
                <strong>{rooms.available}</strong>
              </div>
              <div className="meter-row">
                <span>Booked / Reserved:</span>
                <strong>{rooms.booked || 0}</strong>
              </div>
              <div className="meter-row">
                <span>Occupied:</span>
                <strong>{rooms.occupied || 0}</strong>
              </div>
              <div className="meter-row">
                <span>Total Active Rooms:</span>
                <strong>{rooms.total}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent System Audit Logs */}
      <div className="audit-panel-card glass">
        <h3 className="panel-heading font-heading">Recent System Activity Logs</h3>
        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <div className="operator-profile">
                      <span className="op-name">{log.user?.name || 'System'}</span>
                      <small className="op-role">{log.user?.role || 'Daemon'}</small>
                    </div>
                  </td>
                  <td>
                    <Badge variant={log.action === 'deactivate' || log.action === 'delete' ? 'danger' : 'info'}>
                      {log.action}
                    </Badge>
                  </td>
                  <td>{log.resource}</td>
                  <td><code className="ip-addr">{log.ip}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
