import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlays: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
