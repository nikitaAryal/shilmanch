import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usersAPI, ordersAPI } from "../services/api";

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

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!userData) {
    return <div className="p-8 text-center">User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      {/* Account Information Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Account Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="mt-1 text-lg">{userData.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-lg">{userData.email}</p>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            id="address"
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your address (optional)"
          />
          <button
            onClick={handleAddressUpdate}
            disabled={saving || address.trim() === (userData.address || "")}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {saving ? "Saving..." : "Save Address"}
          </button>
        </div>
      </div>

      {/* Booking History Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Booking History</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">No bookings yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 flex items-center gap-6">
                <img
                  src={order.image_url || "/placeholder-play.jpg"}
                  alt={order.playname}
                  className="w-24 h-32 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-medium">{order.playname}</h3>
                  <p className="text-gray-600">
                    Date: {new Date(order.show_date).toLocaleDateString()} | Time: {order.show_time}
                  </p>
                  <p className="text-gray-600">Seats: {JSON.parse(order.seats_json).join(", ")}</p>
                  <p className="text-gray-600">Amount: ₹{order.amount}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-sm rounded-full ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="mt-10 text-center">
        <button
          onClick={handleLogout}
          className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700 text-lg"
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;