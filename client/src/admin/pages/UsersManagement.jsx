import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (user) => {
    const action = user.is_admin ? 'remove admin privileges from' : 'make';
    if (!window.confirm(`Are you sure you want to ${action} ${user.username} an admin?`)) return;

    try {
      await usersAPI.update(user.id, {
        username: user.username,
        email: user.email,
        password: user.password || '',
        address: user.address || '',
        is_admin: !user.is_admin,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.username}?`)) return;

    try {
      await usersAPI.delete(user.id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  if (loading) {
    return <div className="admin-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="users-management">
      <div className="data-table-container">
        <div className="table-header">
          <h2>Users Management</h2>
          <span style={{ color: '#6b7280' }}>{users.length} total users</span>
        </div>

        {users.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Address</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.address || '-'}</td>
                  <td>
                    <span className={`badge ${user.is_admin ? 'badge-paid' : 'badge-pending'}`}>
                      {user.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className={`btn btn-sm ${user.is_admin ? 'btn-secondary' : 'btn-success'}`}
                        onClick={() => toggleAdminStatus(user)}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
