import { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

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

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      address: user.address || '',
    });
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({ username: '', email: '', address: '' });
    setErrors({});
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateEditForm = () => {
    const newErrors = {};

    if (!editForm.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (editForm.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(editForm.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) {
      return;
    }

    try {
      await usersAPI.update(editingUser.id, {
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        password: editingUser.password || '',
        address: editForm.address.trim(),
        is_admin: editingUser.is_admin,
      });
      fetchUsers();
      closeEditModal();
      alert('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
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
                        className="btn btn-primary btn-sm"
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </button>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button className="modal-close" onClick={closeEditModal}>&times;</button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => {
                    setEditForm({ ...editForm, username: e.target.value });
                    if (errors.username) setErrors({ ...errors, username: '' });
                  }}
                  className={errors.username ? 'input-error' : ''}
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({ ...editForm, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  className={errors.email ? 'input-error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  rows="3"
                  placeholder="Enter address"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeEditModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
