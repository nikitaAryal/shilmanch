import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { activePlayAPI } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlays: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [seatStats, setSeatStats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get today's date in YYYY-MM-DD format
  const getTodayStr = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const [usersRes, playsRes, ordersRes] = await Promise.all([
          api.get('/users'),
          api.get('/plays'),
          api.get('/orders'),
        ]);

        const users = usersRes.data.users || [];
        const plays = playsRes.data || [];
        const orders = ordersRes.data || [];

        const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
        const paidOrders = orders.filter(o => o.status === 'PAID');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

        setStats({
          totalUsers: users.length,
          totalPlays: plays.length,
          totalOrders: orders.length,
          pendingOrders,
          totalRevenue,
        });

        // Get recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch seat stats when date changes
  useEffect(() => {
    const fetchSeatStats = async () => {
      try {
        const response = await activePlayAPI.getSeatStats(selectedDate || null);
        setSeatStats(response.data || []);
      } catch (error) {
        console.error('Error fetching seat stats:', error);
        setSeatStats([]);
      }
    };

    fetchSeatStats();
  }, [selectedDate]);

  if (loading) {
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard">
      <h2 style={{ marginBottom: 24 }}>Dashboard Overview</h2>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Total Users</h3>
          <div className="value">{stats.totalUsers}</div>
        </div>
        <div className="stat-card success">
          <h3>Total Plays</h3>
          <div className="value">{stats.totalPlays}</div>
        </div>
        <div className="stat-card warning">
          <h3>Pending Orders</h3>
          <div className="value">{stats.pendingOrders}</div>
        </div>
        <div className="stat-card danger">
          <h3>Total Revenue</h3>
          <div className="value">Rs. {stats.totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      {/* Seat Statistics for Active Plays */}
      <div className="data-table-container" style={{ marginTop: 24 }}>
        <div className="table-header">
          <h2>Seat Statistics - Active Plays</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: '#6b7280' }}>Filter by Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            />
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setSelectedDate(getTodayStr())}
            >
              Today
            </button>
          </div>
        </div>

        {seatStats.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Play</th>
                <th>Show Time</th>
                <th>Total Seats</th>
                <th>Booked</th>
                <th>Reserved</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {seatStats.map((stat) => (
                <tr key={stat.activeplay_id}>
                  <td>
                    <strong>{stat.playname}</strong>
                  </td>
                  <td>{stat.time}</td>
                  <td>{stat.total_seats}</td>
                  <td>
                    <span className="badge badge-active">{stat.booked_seats}</span>
                  </td>
                  <td>
                    <span className="badge badge-upcoming">{stat.reserved_seats}</span>
                  </td>
                  <td>
                    <span className="badge badge-past">{stat.available_seats}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No active plays or no bookings for this date</p>
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="data-table-container">
        <div className="table-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-primary btn-sm">
            View All
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Play</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.username || order.email}</td>
                  <td>{order.playname}</td>
                  <td>Rs. {order.amount}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No orders yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
        <Link to="/admin/plays" className="btn btn-primary">
          Manage Plays
        </Link>
        <Link to="/admin/schedules" className="btn btn-success">
          Add Schedule
        </Link>
        <Link to="/admin/orders" className="btn btn-secondary">
          View Orders
        </Link>
      </div>
    </div>
  );
}
