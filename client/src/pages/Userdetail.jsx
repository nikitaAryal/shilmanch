import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersAPI, ordersAPI } from "../services/api";
import "./userdetail.css";

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [address, setAddress] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch user details
        const userRes = await usersAPI.getById(user.id);
        setUserData(userRes.data.user);
        setAddress(userRes.data.user.address || "");

        // Fetch booking history (orders)
        const ordersRes = await ordersAPI.getByUser(user.id);
        setOrders(ordersRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const handleAddressUpdate = async () => {
    if (!address.trim()) return;

    setSaving(true);
    try {
      await usersAPI.update(user.id, {
        username: userData.username,
        email: userData.email,
        password: userData.password || '',
        address: address.trim(),
        is_admin: userData.is_admin || false,
      });
      setUserData((prev) => ({ ...prev, address: address.trim() }));
      updateUser({ address: address.trim() });
      alert("Address updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update address");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'pending':
        return 'status-pending';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await ordersAPI.update(orderId, { status: 'cancelled' });
      // Update the orders list locally
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      ));
      alert('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling order:', err);
      alert('Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (!userData) {
    return <div className="loading-container">User not found</div>;
  }

  return (
    <div className="user-profile">
      <h1>My Account</h1>

      {/* Account Information Section */}
      <div className="account-card">
        <h2>Account Information</h2>

        <div className="info-grid">
          <div className="info-item">
            <label>Username</label>
            <p>{userData.username}</p>
          </div>
          <div className="info-item">
            <label>Email</label>
            <p>{userData.email}</p>
          </div>
        </div>

        <div className="address-section">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            rows="3"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address (optional)"
          />
          <button
            onClick={handleAddressUpdate}
            disabled={saving || address.trim() === (userData.address || "")}
            className="btn-save"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>

      {/* Booking History Section */}
      <div className="bookings-card">
        <h2>Booking History</h2>

        {orders.length === 0 ? (
          <p className="no-bookings">No bookings yet.</p>
        ) : (
          <div className="bookings-list">
            {orders.map((order) => (
              <div key={order.id} className="booking-item">
                <img
                  src={order.image_url ? `/api/${order.image_url}` : "/placeholder-play.jpg"}
                  alt={order.playname}
                  className="booking-image"
                />
                <div className="booking-details">
                  <h3>{order.playname}</h3>
                  <p>
                    <strong>Date:</strong> {new Date(order.show_date).toLocaleDateString()} | <strong>Time:</strong> {order.show_time}
                  </p>
                  <p><strong>Seats:</strong> {JSON.parse(order.seats_json).join(", ")}</p>
                  <p className="booking-amount">Amount: Rs.{order.amount}</p>
                  <div className="booking-status-row">
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {order.status?.toUpperCase()}
                    </span>
                    {order.status === 'PENDING' && (
                      <button
                        className="btn-cancel-booking"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="logout-section">
        <button onClick={handleLogout} className="btn-logout">
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
