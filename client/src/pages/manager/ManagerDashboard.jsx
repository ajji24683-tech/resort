import { useState, useEffect } from 'react';
import { managerAPI } from '../../api';
import { IoBedOutline, IoCalendarOutline, IoCashOutline, IoWarningOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';
import Spinner from '../../components/ui/Spinner';
import './ManagerDashboard.css';

// Recharts components
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await managerAPI.getDashboard();
      setStats(res.data.data);
    } catch (err) {
      console.error('Error fetching manager dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="manager-dashboard-loading">
        <Spinner size="lg" />
        <p>Loading operational database telemetry...</p>
      </div>
    );
  }

  const { occupancy, roomStatusBreakdown, todayActivity, revenueToday, alerts } = stats;

  // Mock occupancy historical data for Recharts
  const chartData = [
    { name: 'Mon', Occupancy: 65 },
    { name: 'Tue', Occupancy: 70 },
    { name: 'Wed', Occupancy: 75 },
    { name: 'Thu', Occupancy: 80 },
    { name: 'Fri', Occupancy: 88 },
    { name: 'Sat', Occupancy: 95 },
    { name: 'Sun', Occupancy: 92 },
  ];

  return (
    <div className="manager-dashboard">
      {/* KPI row */}
      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon-wrap occupancy">
            <IoBedOutline />
          </div>
          <div className="stat-info">
            <span className="stat-label">Occupancy %</span>
            <strong className="stat-value">{occupancy.percentage}%</strong>
            <span className="stat-sub">{occupancy.occupied} / {occupancy.total} Rooms occupied</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrap activity">
            <IoCalendarOutline />
          </div>
          <div className="stat-info">
            <span className="stat-label">Check-ins / Outs Today</span>
            <strong className="stat-value">{todayActivity.checkIns} / {todayActivity.checkOuts}</strong>
            <span className="stat-sub">Pending guest activity logs</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrap revenue">
            <IoCashOutline />
          </div>
          <div className="stat-info">
            <span className="stat-label">Revenue Generated Today</span>
            <strong className="stat-value">₹{revenueToday.toLocaleString()}</strong>
            <span className="stat-sub">Paid bookings transactions</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon-wrap alert-icon">
            <IoWarningOutline />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Operations Alerts</span>
            <strong className="stat-value">{alerts.pendingCleaning + alerts.openMaintenance + alerts.openRequests}</strong>
            <span className="stat-sub">{alerts.openMaintenance} open maintenance jobs</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-split">
        {/* Occupancy Trend Chart */}
        <div className="chart-card glass">
          <h3 className="card-heading font-heading">Occupancy Trend (Weekly)</h3>
          <div className="chart-wrap" style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Occupancy" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorOccupancy)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Room readiness checklist / status */}
        <div className="status-summary-card glass">
          <h3 className="card-heading font-heading">Room Status Telemetry</h3>
          <div className="status-bars">
            {[
              { label: 'Available rooms', count: roomStatusBreakdown.available, color: 'var(--color-success)' },
              { label: 'Booked / Reserved', count: roomStatusBreakdown.booked || 0, color: 'var(--color-primary)' },
              { label: 'Occupied rooms', count: roomStatusBreakdown.occupied, color: 'var(--color-secondary-light)' },
              { label: 'Dirty rooms', count: roomStatusBreakdown.dirty, color: 'var(--color-danger)' },
              { label: 'Cleaning in progress', count: roomStatusBreakdown.cleaning, color: 'var(--color-warning)' },
              { label: 'Pending inspection', count: roomStatusBreakdown.inspection, color: 'var(--color-info)' },
              { label: 'Maintenance issues', count: roomStatusBreakdown.maintenance, color: 'var(--color-gray-500)' },
            ].map((item, idx) => (
              <div key={idx} className="status-bar-row">
                <span className="status-row-label">{item.label}</span>
                <div className="bar-container">
                  <div className="bar-fill" style={{ width: `${(item.count / occupancy.total) * 100 || 0}%`, backgroundColor: item.color }} />
                </div>
                <strong className="status-row-count">{item.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Action Alerts */}
      <div className="alerts-section glass">
        <h3 className="card-heading font-heading">Operations Alerts & Action Items</h3>
        <div className="alerts-grid-list">
          {alerts.pendingCleaning > 0 && (
            <div className="alert-item warning">
              <IoWarningOutline />
              <div>
                <h4>{alerts.pendingCleaning} Rooms Require Housekeeping</h4>
                <p>Housekeeping tasks are currently unassigned and in the queue.</p>
              </div>
            </div>
          )}
          {alerts.openMaintenance > 0 && (
            <div className="alert-item danger">
              <IoWarningOutline />
              <div>
                <h4>{alerts.openMaintenance} Maintenance Issue Logs Open</h4>
                <p>Urgent physical room repairs require technicians allocation.</p>
              </div>
            </div>
          )}
          {alerts.pendingCleaning === 0 && alerts.openMaintenance === 0 && (
            <div className="alert-item success">
              <IoCheckmarkCircleOutline />
              <div>
                <h4>All Systems Operational</h4>
                <p>No pending alerts or outstanding cleaning queues recorded.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
