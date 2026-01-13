import { useState, useEffect } from 'react';
import { ordersAPI } from '../../services/api';

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId) => {
    if (!window.confirm('Confirm this payment as received?')) return;

    try {
      await ordersAPI.update(orderId, {
        status: 'PAID',
        paid_at: new Date().toISOString(),
      });
      fetchOrders();
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Failed to confirm payment');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      await ordersAPI.update(orderId, { status: 'CANCELLED' });
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Extract just the date part to avoid timezone issues
    const datePart = dateStr.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString();
  };

  const parseSeats = (seatsJson) => {
    try {
      const seats = typeof seatsJson === 'string' ? JSON.parse(seatsJson) : seatsJson;
      return seats?.join(', ') || '-';
    } catch {
      return seatsJson || '-';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="orders-management">
      <div className="data-table-container">
        <div className="table-header">
          <h2>Orders Management</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #d1d5db',
              }}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredOrders.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Play</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>
                    <div>
                      <strong>{order.username}</strong>
                      <br />
                      <small style={{ color: '#6b7280' }}>{order.email}</small>
                    </div>
                  </td>
                  <td>{order.playname}</td>
                  <td>
                    <div>
                      {formatDate(order.show_date)}
                      <br />
                      <small style={{ color: '#6b7280' }}>{order.show_time}</small>
                    </div>
                  </td>
                  <td>
                    <small>{parseSeats(order.seats_json)}</small>
                  </td>
                  <td>Rs. {order.amount}</td>
                  <td>
                    <span className={`badge badge-${order.status}`}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => confirmPayment(order.id)}
                          >
                            Confirm Paid
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => cancelOrder(order.id)}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {order.status === 'PAID' && (
                        <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                          Payment Confirmed
                        </span>
                      )}
                      {order.status === 'CANCELLED' && (
                        <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                          Cancelled
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No orders found.</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div style={{ marginTop: 24 }}>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="value">{orders.length}</div>
          </div>
          <div className="stat-card warning">
            <h3>Pending</h3>
            <div className="value">{orders.filter(o => o.status === 'PENDING').length}</div>
          </div>
          <div className="stat-card success">
            <h3>Paid</h3>
            <div className="value">{orders.filter(o => o.status === 'PAID').length}</div>
          </div>
          <div className="stat-card danger">
            <h3>Cancelled</h3>
            <div className="value">{orders.filter(o => o.status === 'CANCELLED').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
